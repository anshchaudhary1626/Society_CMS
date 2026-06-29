const User = require('../models/user.model');
const { ROLES } = require('./constants');

/**
 * Automatically assigns a complaint to an available worker specializing in the category.
 * Employs greedy load balancing (assigns to the worker with the lowest active workload).
 * 
 * @param {Object} complaint - The Mongoose complaint document
 * @returns {Promise<ObjectId|null>} The assigned worker's ID or null if no worker is available
 */
const autoAssign = async (complaint) => {
  try {
    // 1. Query available workers specializing in the complaint category
    const eligibleWorkers = await User.find({
      role: ROLES.WORKER,
      isAvailable: true,
      specialization: complaint.category
    }).sort({ activeComplaints: 1, createdAt: 1 }); // Sort by lowest workload, then oldest account

    // 2. If no workers are found, return null (complaint remains PENDING)
    if (eligibleWorkers.length === 0) {
      return null;
    }

    // 3. Select the worker with the lowest workload (first worker in sorted array)
    const selectedWorker = eligibleWorkers[0];

    // 4. Increment worker's active workload count
    selectedWorker.activeComplaints += 1;
    await selectedWorker.save();

    // 5. Return the assigned worker's ID
    return selectedWorker._id;
  } catch (error) {
    console.error('Auto-Assignment Algorithm Error:', error.message);
    throw error;
  }
};

module.exports = autoAssign;