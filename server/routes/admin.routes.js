const express = require('express');
const { body } = require('express-validator');

// Import controllers
const { 
  getAllComplaints, 
  getStats, 
  createWorker, 
  getWorkers, 
  reassignComplaint, 
  getResidents 
} = require('../controllers/admin.controller');

// Import guards
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Apply global security filters to all routes registered inside this file
router.use(protect);
router.use(requireRole(ROLES.ADMIN));

// --- Route mappings ---
router.get('/complaints', getAllComplaints);
router.get('/stats', getStats);
router.get('/workers', getWorkers);
router.get('/residents', getResidents);

// Create new worker accounts with custom field validations
router.post(
  '/workers',
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').notEmpty().withMessage('Phone number is required').trim(),
    body('specialization').isArray({ min: 1 }).withMessage('At least one specialization is required'),
    validate
  ],
  createWorker
);

// Manual complaint re-assignment route with field validations
router.patch(
  '/complaints/:id/assign',
  [
    body('workerId').notEmpty().withMessage('Worker ID parameter is required'),
    validate
  ],
  reassignComplaint
);

module.exports = router;
