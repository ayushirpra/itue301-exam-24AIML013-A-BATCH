const express = require('express');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const router = express.Router();

/**
 * POST /api/v1/auth/login
 * Body: { email, password }
 * Validates credentials against MongoDB and returns a signed JWT plus the
 * customer object.
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Plain-text comparison for this exam project.
    // In production, hash passwords with bcrypt.
    if (customer.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
