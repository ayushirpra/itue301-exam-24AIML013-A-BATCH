const mongoose = require('mongoose');

/**
 * Booking schema
 * Links a customer to a vehicle for a rental period with a status lifecycle.
 * Fields: customer (ref Customer, required), vehicle (ref Vehicle, required),
 * pickupDate (required), returnDate (required, must be after pickupDate),
 * totalAmount (min 0), status (enum reserved/ongoing/completed/cancelled,
 * default reserved).
 */
const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
    },
    pickupDate: {
      type: Date,
      required: [true, 'Pickup date is required'],
    },
    returnDate: {
      type: Date,
      required: [true, 'Return date is required'],
      validate: {
        validator: function (value) {
          return value > this.pickupDate;
        },
        message: 'Return date must be after the pickup date',
      },
    },
    totalAmount: {
      type: Number,
      min: [0, 'Total amount cannot be negative'],
      default: 0,
    },
    status: {
      type: String,
      enum: ['reserved', 'ongoing', 'completed', 'cancelled'],
      default: 'reserved',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
