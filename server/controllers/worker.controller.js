const Complaint = require('../models/complaint.model');
const User = require('../models/user.model');
const Review = require('../models/review.model');
const { STATUS } = require('../utils/constants');

// Get Assigned Complaints
// Endpoint: GET /api/worker/complaints

const getAssignedComplaints = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = { assignedWorker: req.user._id };

        if (status) {
            filter.status = status;
        }

        const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: complaints.length,
            data: { complaints }
        });
    } catch (error) {
        next(error);
    }
}

//Start Work on Complaint
// Endpoint: PATCH /api/worker/complaints/:id/start

const startWork = async (req, res, next) => {
    try {
        const { id } = req.params;

        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        //Security Check: Verify this worker is indeed the assigned worker
        if (complaint.assignedWorker.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        //can only start if assigned
        if (complaint.status !== STATUS.ASSIGNED) {
            return res.status(400).json({ message: 'Cannot start work. Complaint status must be ASSIGNED.' });
        }

        complaint.status = STATUS.IN_PROGRESS;
        await complaint.save();

        res.status(200).json({
            status: 'success',
            message: 'Work started on complaint. Status is now IN_PROGRESS.',
            data: { complaint }
        });

    } catch (error) {
        next(error);
    }
}


//Resolve Complaint
// Endpoint: PATCH /api/worker/complaints/:id/resolve

const resolveComplaint = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { resolutionNotes, resolutionImage } = req.body;
        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Security Check: Verify worker is the assigned worker
        if (complaint.assignedWorker.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not assigned to this complaint.' });
        }

        //State Check: Can only resolve if the task is IN_PROGRESS
        if (complaint.status !== STATUS.IN_PROGRESS) {
            return res.status(400).json({ message: 'You can only resolve complaints that are IN_PROGRESS.' });
        }

        complaint.status = STATUS.RESOLVED;
        complaint.resolutionNotes = resolutionNotes;
        complaint.resolutionImage = resolutionImage;
        complaint.resolvedAt = Date.now();

        await complaint.save();

        res.status(200).json({
            status: 'success',
            message: 'Complaint resolved successfully, Awaiting resident confirmation.',
            data: { complaint }
        });
    } catch (error) {
        next(error)
    }
}


//Get My Reviews (Feedback board for workers) ---
// Endpoint: GET /api/worker/reviews

const getMyReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ worker: req.user._id })
            .populate('resident', 'name')
            .populate('complaint', 'complaintId category');

        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: { reviews }
        })
    } catch (error) {
        next(error)
    }
}


//Toggle Worker Availability Status ---
// Endpoint: PATCH /api/worker/availability

const toggleAvailability = async (req, res, next) => {
    try {
        const worker = await User.findById(req.user._id);

        worker.isAvailable = !worker.isAvailable;
        await worker.save();

        res.status(200).json({
            status: 'success',
            message: `Worker availability toggled successfully. Status is now ${worker.isAvailable ? 'Available' : 'Unavailable'}`,
            data: { isAvailable: worker.isAvailable }
        })
    } catch (error) {
        next(error)
    }
}


module.exports = {
    getAssignedComplaints,
    startWork,
    resolveComplaint,
    getMyReviews,
    toggleAvailability
}