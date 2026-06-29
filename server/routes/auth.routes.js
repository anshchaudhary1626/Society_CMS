const express = require('express');
const { register, login, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

// Public Authentication Routes
router.post(
    '/register',
    [
        body('name')
            .notEmpty()
            .withMessage('Name is required')
            .trim(),
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email address')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('phone')
            .notEmpty()
            .withMessage('Phone number is required')
            .trim(),
        body('flatNumber')
            .notEmpty()
            .withMessage('Flat number is required')
            .trim(),
        validate
    ],
    register
);

router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email address')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Password is required'),
        validate
    ],
    login
);
router.post('/logout', logout);

// Protected Routes (requires a valid JWT Cookie)
router.get('/me', protect, getMe);

module.exports = router;
