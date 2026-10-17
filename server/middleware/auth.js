
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify that the request contains a valid login token
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to access this resource.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing.',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing from server/.env');

      return res.status(500).json({
        success: false,
        message: 'Server authentication is not configured.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the current user from the database.
    // This avoids relying only on role information in the token.
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists. Please log in again.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Your session is invalid or expired. Please log in again.',
      });
    }

    console.error('Authentication error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Authentication failed due to a server error.',
    });
  }
};

// Allow only specified account roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in first.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
      });
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };
