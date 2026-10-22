const express = require('express');
const Vehicle = require('../models/Vehicle');

const router = express.Router();

/**
 * GET /api/v1/vehicles
 * Returns every vehicle in the fleet. Optionally filter by type via ?type=Sedan.
 * Public endpoint (used by the fleet page before/after login).
 */
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
