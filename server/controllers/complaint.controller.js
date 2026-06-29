const Complaint = require('../models/complaint.model');
const User = require('../models/user.model');
const autoAssign = require('../utils/autoAssign');
const { STATUS, ROLES } = require('../utils/constants');
const Review = require('../models/review.model');

//POST : /api/complaints
const createComplaint = async (req, res, next) => {
    try {
        const { category, description, images } = req.body;

        const newComplaint = await Complaint.create({
            resident: req.user._id,
            category,
            description,
            images,
            status: STATUS.PENDING,
        })

        const workerId = await autoAssign(newComplaint);

        if (workerId) {
            newComplaint.assignedWorker = workerId;
            newComplaint.status = STATUS.ASSIGNED;
            await newComplaint.save();
        }

        res.status(201).json({
            status: 'success',
            message: 'Complaint submitted successfully!',
            data: { complaint: newComplaint }
        })

    } catch (error) {
        next(error);
    }
}

// Endpoint: GET /api/complaints/my

const getMyComplaints = async (req, res, next) => {
    try {
        const { status } = req.query

        const queryFilter = { resident: req.user._id };

        if (status) {
            queryFilter.status = status;
        }

        const complaints = await Complaint.find(queryFilter).sort({ createdAt: -1 });

        //return with status 200 with complaint array

        res.status(200).json({
            status: 'success',
            results: complaints.length,
            data: { complaints }
        });
    } catch (error) {
        next(error)
    }
}

// Endpoint: GET /api/complaints/:id

const getComplaintById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const complaint = await Complaint.findById(id)
            .populate('resident', 'name email phone flatNumber')
            .populate('assignedWorker', 'name email phone specialization')

        // Check if found else return 404
        if (!complaint) {
            return res.status(404).json({
                status: 'fail',
                message: 'Complaint not found'
            })
        }

        // Check Authorization
        const isOwner = complaint.resident._id.toString() === req.user._id.toString();
        const isAssignedWorker = complaint.assignedWorker && complaint.assignedWorker._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === ROLES.ADMIN;

        if (!isOwner && !isAssignedWorker && !isAdmin) {
            return res.status(403).json({ message: 'You do not have permission to view this complaint' });
        }

        res.status(200).json({ status: 'success', data: { complaint } });
    } catch (error) {
        next(error)
    }
}

//Closing resolved complaints
//Endpoint: PATCH /api/complaints/:id/close

const closeComplaint = async (req, res, next) => {
    try {
        const { id } = req.params;

        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        //Security Check: Verify that current user is the owner (resident) who filed it
        if (complaint.resident.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the resident who filed this complaint can close it.' });
        }

        //State Check: Can only close resolved complaints:

        if (complaint.status !== STATUS.RESOLVED) {
            return res.status(400).json({ message: 'Complaints can only be closed once they are marked as RESOLVED by the worker.' });
        }

        //Update complaint details

        complaint.status = STATUS.CLOSED;
        complaint.closedAt = Date.now();
        await complaint.save();

        if (complaint.assignedWorker) {
            await User.findByIdAndUpdate(complaint.assignedWorker, {
                $inc: { activeComplaints: -1 }
            });
        }


        res.status(200).json({
            status: 'success',
            message: 'Complaint closed successfully! You can now leave a review.',
            data: { complaint }
        })

    } catch (error) {
        next(error)
    }
}

// Reopen Complaint
// Endpoint: PATCH /api/complaints/:id/reopen

const reOpenComplaint = async (req, res, next) => {
    try {
        const { id } = req.params
        const { reopenReason } = req.body;

        const complaint = await Complaint.findById(id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        //check authorization: Resident only

        if (complaint.resident.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the resident who filed this complaint can reopen it.' });
        }

        //State Check: Can only reopen resolved or closed complaints
        if (complaint.status !== STATUS.RESOLVED) {
            return res.status(400).json({ message: 'Only complaints in RESOLVED status can be reopened.' });
        }

        // 1. Decrement workload of the previously assigned worker (if any)
        if (complaint.assignedWorker) {
            await User.findByIdAndUpdate(complaint.assignedWorker, {
                $inc: { activeComplaints: -1 }
            });
        }

        // 2. Reset resolution fields and store the reopen reason
        complaint.reopenReason = reopenReason;
        complaint.resolutionNotes = '';
        complaint.resolutionImage = '';
        complaint.resolvedAt = null;

        // 3. Trigger auto-assignment to search for a new/available worker
        const newWorkerId = await autoAssign(complaint);
        if (newWorkerId) {
            complaint.status = STATUS.ASSIGNED;
            complaint.assignedWorker = newWorkerId;
        } else {
            complaint.status = STATUS.PENDING;
            complaint.assignedWorker = null;
        }

        await complaint.save();

        res.status(200).json({
            status: "success",
            message: 'Complaint reopened and reassigned successfully.',
            data: { complaint }
        })

    }

    catch (error) {
        next(error)
    }
}

//Submit Review on closed complaints ---
// Endpoint: POST /api/complaints/:id/review

const submitReview = async (req, res, next) => {
    try {
        const { id } = req.params; // The complaint ID
        const { rating, comment } = req.body;
        // A. Find the complaint
        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        // B. Security Check: Only the resident owner can leave a review
        if (complaint.resident.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the resident who created this complaint can leave a review.' });
        }
        // C. State Check: Can only review complaints that are CLOSED
        if (complaint.status !== STATUS.CLOSED) {
            return res.status(400).json({ message: 'You can only leave reviews on CLOSED complaints.' });
        }

        await Review.create({
            complaint: complaint._id,
            resident: req.user._id,
            worker: complaint.assignedWorker,
            rating,
            comment
        })

        res.status(201).json({
            status: 'success',
            message: 'Review submitted successfully! Thank you for your feedback.'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already submitted a review for this complaint.' });
        }
        next(error);
    }
}


module.exports = {
    createComplaint,
    getMyComplaints,
    getComplaintById,
    closeComplaint,
    reOpenComplaint,
    submitReview
}