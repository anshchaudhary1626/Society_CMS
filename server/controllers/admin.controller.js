const Complaint = require('../models/complaint.model');
const User = require('../models/user.model');
const { STATUS, ROLES } = require('../utils/constants');

/**
 * Get all complaints in the system with advanced filters and pagination.
 * Endpoint: GET /api/admin/complaints
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const { status, category, worker, resident, page = 1, limit = 10 } = req.query;

    // 1. Build query filters based on incoming params
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (worker) filter.assignedWorker = worker;
    if (resident) filter.resident = resident;

    // 2. Calculate offsets for pagination
    const skip = (page - 1) * limit;

    // 3. Query Mongoose model with populated resident and worker models
    const complaints = await Complaint.find(filter)
      .populate('resident', 'name email phone flatNumber')
      .populate('assignedWorker', 'name email phone specialization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // 4. Retrieve total count matching the filters
    const total = await Complaint.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      total,
      page: parseInt(page),
      results: complaints.length,
      data: { complaints }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Aggregate and calculate dashboard statistics.
 * Endpoint: GET /api/admin/stats
 */
const getStats = async (req, res, next) => {
  try {
    // 1. Calculate status-wise counts using MongoDB Aggregations
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 2. Calculate category-wise counts using MongoDB Aggregations
    const categoryCounts = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // 3. Calculate average resolution duration in hours (closedAt - createdAt)
    const closedComplaints = await Complaint.find({ status: STATUS.CLOSED });
    let totalResolutionTime = 0;

    closedComplaints.forEach(comp => {
      const diffMs = new Date(comp.closedAt) - new Date(comp.createdAt);
      totalResolutionTime += diffMs / (1000 * 60 * 60); // convert milliseconds to hours
    });

    const averageResolutionTimeHours = closedComplaints.length > 0
      ? (totalResolutionTime / closedComplaints.length).toFixed(1)
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        statusCounts,
        categoryCounts,
        averageResolutionTimeHours: parseFloat(averageResolutionTimeHours)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new worker account.
 * Endpoint: POST /api/admin/workers
 */
const createWorker = async (req, res, next) => {
  try {
    const { name, email, password, phone, specialization } = req.body;

    // 1. Check duplicate email in Database
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'A user account is already registered with this email address.'
      });
    }

    // 2. Create the worker document
    const newWorker = await User.create({
      name,
      email,
      password,
      phone,
      specialization, // Array of specializations (e.g. ['plumbing', 'electricity'])
      role: ROLES.WORKER,
      isAvailable: true,
      activeComplaints: 0
    });

    res.status(201).json({
      status: 'success',
      message: 'Worker account created successfully.',
      data: {
        worker: {
          id: newWorker._id,
          name: newWorker.name,
          email: newWorker.email,
          role: newWorker.role,
          phone: newWorker.phone,
          specialization: newWorker.specialization
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all worker accounts with current active workloads.
 * Endpoint: GET /api/admin/workers
 */
const getWorkers = async (req, res, next) => {
  try {
    const workers = await User.find({ role: ROLES.WORKER }).sort({ activeComplaints: 1 });

    res.status(200).json({
      status: 'success',
      results: workers.length,
      data: { workers }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually assign/reassign a complaint to a specific worker.
 * Endpoint: PATCH /api/admin/complaints/:id/assign
 */
const reassignComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { workerId } = req.body; // The target worker's ID

    // 1. Find the target complaint
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        status: 'fail',
        message: 'Complaint not found.'
      });
    }

    // 2. Find and validate the new worker
    const newWorker = await User.findById(workerId);
    if (!newWorker || newWorker.role !== ROLES.WORKER) {
      return res.status(400).json({
        status: 'fail',
        message: 'Selected user is not a valid worker.'
      });
    }

    // 3. Decrement the workload of the old worker (if one was previously assigned)
    if (complaint.assignedWorker) {
      await User.findByIdAndUpdate(complaint.assignedWorker, {
        $inc: { activeComplaints: -1 }
      });
    }

    // 4. Increment workload of the newly assigned worker
    newWorker.activeComplaints += 1;
    await newWorker.save();

    // 5. Update complaint references and update status to ASSIGNED
    complaint.assignedWorker = newWorker._id;
    complaint.status = STATUS.ASSIGNED;
    await complaint.save();

    res.status(200).json({
      status: 'success',
      message: `Complaint successfully reassigned to worker ${newWorker.name}.`,
      data: { complaint }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all resident accounts with basic profile details.
 * Endpoint: GET /api/admin/residents
 */
const getResidents = async (req, res, next) => {
  try {
    const residents = await User.find({ role: ROLES.RESIDENT }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: residents.length,
      data: { residents }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllComplaints,
  getStats,
  createWorker,
  getWorkers,
  reassignComplaint,
  getResidents
};