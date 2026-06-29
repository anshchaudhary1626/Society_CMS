const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema({
    complaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
        required: [true, "Complaint reference is required"]
    },
    resident: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Resident reference is required']
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Worker reference is required']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating must be at most 5']
    },
    comment: {
        type: String,
        trim: true,
        default: ''
    },
}, {
    timestamps: true
})

// --- Compound Unique Index ---
// This acts as a database-level safety lock ensuring that a resident 
// can never leave more than one review for a specific complaint.
// If they try to write another, MongoDB will reject it with a duplicate key error.
reviewSchema.index({ complaint: 1, resident: 1 }, { unique: true });

const reviewModel = mongoose.model('Review', reviewSchema)

module.exports = reviewModel