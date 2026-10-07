const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authenticate a user from the JWT Bearer token.
 * Sets req.user on success, otherwise 401.
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token is missing',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Session expired, please login again'
          : 'Not authorized, invalid token';
      return res.status(401).json({ success: false, message });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization. Must be used after authenticateUser.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
};

module.exports = { authenticateUser, requireAdmin };
