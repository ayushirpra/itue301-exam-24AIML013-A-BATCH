const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

/**
 * Custom auth guard for protected endpoints.
 * Validates a Bearer token from the Authorization header:
 *   Authorization: Bearer <token>
 * If valid, attaches the decoded customer document (without password) to
 * req.customer. Otherwise responds with 401 Unauthorized.
 */
async function authGuard(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Provide a Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    // Look up the customer in MongoDB (exclude password field)
    const customer = await Customer.findById(decoded.id).select('-password');
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Customer no longer exists.',
      });
    }

    req.customer = customer;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authGuard;
