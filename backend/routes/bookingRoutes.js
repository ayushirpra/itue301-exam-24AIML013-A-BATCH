const express = require('express');
const authGuard = require('../middleware/authGuard');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

const router = express.Router();

/**
 * POST /api/v1/bookings
 * Protected. Body: { vehicle, pickupDate, returnDate }
 * Verifies the vehicle is available, creates the booking, then marks the
 * vehicle unavailable. Returns the created booking.
 */
router.post('/', authGuard, async (req, res, next) => {
  try {
    const { vehicle, pickupDate, returnDate } = req.body;

    if (!vehicle || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'vehicle, pickupDate and returnDate are required.',
      });
    }

    const pickup = new Date(pickupDate);
    const ret = new Date(returnDate);
    if (isNaN(pickup.getTime()) || isNaN(ret.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'pickupDate and returnDate must be valid dates.',
      });
    }
    if (ret <= pickup) {
      return res.status(400).json({
        success: false,
        message: 'Return date must be after the pickup date.',
      });
    }

    // 1. Verify the vehicle exists and is available
    const foundVehicle = await Vehicle.findById(vehicle);
    if (!foundVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }
    if (!foundVehicle.available) {
      return res.status(409).json({
        success: false,
        message: 'This vehicle is not available for booking.',
      });
    }

    // 2. Calculate total amount
    const days = Math.ceil((ret - pickup) / (1000 * 60 * 60 * 24));
    const totalAmount = days * foundVehicle.pricePerDay;

    // 3. Create the booking
    const booking = await Booking.create({
      customer: req.customer._id,
      vehicle,
      pickupDate: pickup,
      returnDate: ret,
      totalAmount,
      status: 'reserved',
    });

    // 4. Mark the vehicle unavailable
    foundVehicle.available = false;
    await foundVehicle.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/bookings/my
 * Protected. Returns all bookings for the logged-in customer, populating
 * customer name/email and vehicle model/type using Mongoose populate().
 */
router.get('/my', authGuard, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.customer._id })
      .populate('customer', 'name email')
      .populate('vehicle', 'model type pricePerDay')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/bookings/:id/status
 * Protected. Body: { status }
 * Updates the status of a booking. When status becomes 'cancelled' or
 * 'completed', the associated vehicle is made available again.
 */
router.patch('/:id/status', authGuard, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['reserved', 'ongoing', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Ensure the booking belongs to the logged-in customer
    if (booking.customer.toString() !== req.customer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this booking.',
      });
    }

    booking.status = status;
    await booking.save();

    // Release the vehicle if the booking ends
    if (status === 'cancelled' || status === 'completed') {
      await Vehicle.findByIdAndUpdate(booking.vehicle, { available: true });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
