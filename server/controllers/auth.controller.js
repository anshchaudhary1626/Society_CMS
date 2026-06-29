const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { ROLES } = require('../utils/constants');

/**
 * Generates a signed JWT for authentication.
 * Payload holds the user's ID, role, and email.
 */
const signToken = (userId, role, email) => {
  return jwt.sign(
    { userId, role, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Returns options for setting the HTTP-Only cookie.
 */
const getCookieOptions = () => {
  return {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Match JWT duration (7 days)
    httpOnly: true, // Hides cookie from frontend scripts to block XSS theft
    secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
    sameSite: 'lax' // Mitigation against CSRF attacks
  };
};

/**
 * Register a new resident account.
 * Endpoint: POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, flatNumber } = req.body;

    // 1. Verify that email is not already taken
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'A user is already registered with this email address.'
      });
    }

    // 2. Create the user. Explicitly enforce the 'resident' role so residents can't register as admins/workers.
    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      flatNumber,
      role: ROLES.RESIDENT // Enforced role
    });

    // 3. Issue JWT token
    const token = signToken(newUser._id, newUser.role, newUser.email);

    // 4. Save token in HTTP-Only Cookie
    res.cookie('token', token, getCookieOptions());

    // 5. Send back success response (excluding password hash)
    res.status(201).json({
      status: 'success',
      message: 'Account registered successfully!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        flatNumber: newUser.flatNumber
      }
    });
  } catch (error) {
    next(error); // Sends Mongoose schema validation errors to central middleware
  }
};

/**
 * Authenticate user credentials and issue a cookie session.
 * Endpoint: POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate that input is complete
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide both email and password.'
      });
    }

    // 2. Find user by email and explicitly select their hidden password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password.'
      });
    }

    // 3. Verify password match using user model instance helper
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password.'
      });
    }

    // 4. Issue JWT token
    const token = signToken(user._id, user.role, user.email);

    // 5. Save token in HTTP-Only Cookie
    res.cookie('token', token, getCookieOptions());

    // 6. Send response
    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear the cookie session to log out the user.
 * Endpoint: POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    // Clear cookie by overwriting it with a short-lived expiration
    res.cookie('token', 'loggedout', {
      expires: new Date(Date.now() + 5 * 1000), // Expires in 5 seconds
      httpOnly: true
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully!'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve the current authenticated user's profile.
 * Endpoint: GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    // req.user was already set by the 'protect' middleware
    res.status(200).json({
      status: 'success',
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
