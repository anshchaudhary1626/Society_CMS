const express = require('express')

const { body } = require('express-validator')

const {
    createComplaint,
    getMyComplaints,
    getComplaintById,
    closeComplaint,
    reOpenComplaint,
    submitReview
} = require('../controllers/complaint.controller');


// Import middlewares
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router()

//POST: Create complaint (Protected, Resident-Only)

router.post('/', protect,
    requireRole(ROLES.RESIDENT), [
    body('category')
        .notEmpty().withMessage('Complaint category is required'),
    body('description')
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters long'),

],
    validate,
    createComplaint
)

//GET: my complaints (Protected, Resident-Only)
//  GET: Get logged-in resident's complaints (Protected, Resident-Only)
router.get('/my', protect, requireRole(ROLES.RESIDENT), getMyComplaints)

//GET: Get complaint details (Protected, open to Owner Resident, Assigned Worker, or Admin)

router.get('/:id', protect, getComplaintById);

//PATCH: Close a complaint (Protected, Resident-Only)

router.patch('/:id/close', protect, requireRole(ROLES.RESIDENT), closeComplaint);

//PATCH: Reopen a complaint (Protected, Resident-Only)

router.patch('/:id/reopen', protect, requireRole(ROLES.RESIDENT), [
    body('reopenReason')
        .notEmpty()
        .withMessage('Please provide a reason for reopening the complaint'),
    validate], reOpenComplaint
)

router.post(
    '/:id/review',
    protect,
    requireRole(ROLES.RESIDENT),
    [
        body('rating')
            .isInt({ min: 1, max: 5 })
            .withMessage('Rating must be an integer between 1 and 5'),
        validate
    ],
    submitReview
);

module.exports = router;