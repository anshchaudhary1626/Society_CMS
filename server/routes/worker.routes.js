const express = require('express');
const { body } = require('express-validator');


const {
    getAssignedComplaints,
    startWork,
    resolveComplaint,
    getMyReviews,
    toggleAvailability
} = require('../controllers/worker.controller');


// Import auth and role verification middlewares
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { ROLES } = require('../utils/constants');
const router = express.Router();

//Apply global guards to all routes inside this file (requires LOGGED_IN and role: WORKER)
router.use(protect);
router.use(requireRole(ROLES.WORKER));

router.get('/complaints', getAssignedComplaints)

router.patch('/complaints/:id/start', startWork);

router.patch(
    '/complaints/:id/resolve',
    [
        body('resolutionNotes')
            .isLength({ min: 10 })
            .withMessage('Resolution notes must explain the fix (min 10 characters)'),
        body('resolutionImage')
            .notEmpty()
            .withMessage('Resolution proof image URL is required'),
        validate
    ],
    resolveComplaint
);

router.get('/reviews', getMyReviews)

router.patch('/availability', toggleAvailability);

module.exports = router;