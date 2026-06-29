const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Protect middleware to secure routes using HTTP-Only cookies.
 * Extracts the JWT from the cookie, verifies it, and attaches the user document to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Retrieve the token from request cookies (parsed by cookie-parser)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2. If token is missing, return 401 Unauthorized
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Not authorized! Please log in to gain access.'
    });
  }

  try {
    // 3. Verify the token signature against the JWT secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.userId).select('-password');

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this session no longer exists.'
      });
    }
    req.user = currentUser;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({
      status: 'fail',
      message: 'Not authorized! Session expired or invalid token.'
    });
  }
};

module.exports = { protect };
