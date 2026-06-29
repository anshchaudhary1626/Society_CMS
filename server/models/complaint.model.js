const mongoose = require("mongoose")
const { CATEGORIES, STATUS } = require('../utils/constants');

const complaintSchema = new mongoose.Schema({
    complaintId: {
        type: String,
        unique: true,

    },
    resident: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Resident ID is required"]
    },
    category: {
        type: String,
        enum: {
            values: Object.values(CATEGORIES), // ['Electricity', 'Water', 'Plumbing', etc.]
            message: 'Invalid category selected'
        },
        required: [true, 'Category is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: [10, 'Description must be at least 10 characters long'],
        trim: true
    },
    images: {
        type: [String], // Array of ImageKit URLs
        validate: [
            function (val) {
                return val.length <= 2;
            },
            'You can upload a maximum of 2 images'
        ]
    },
    status: {
        type: String,
        enum: Object.values(STATUS), // ['PENDING', 'ASSIGNED', 'IN_PROGRESS', etc.]
        default: STATUS.PENDING
    },
    assignedWorker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // Resolution details filled by the worker when fixing the issue
    resolutionNotes: {
        type: String,
        trim: true,
        default: ''
    },
    resolutionImage: {
        type: String, // Single ImageKit proof URL uploaded by the worker
        default: ''
    },

    // Reopen details filled by the resident if they reject the fix
    reopenReason: {
        type: String,
        trim: true,
        default: ''
    },

    // Timestamps for tracking SLA (Service Level Agreements)
    resolvedAt: {
        type: Date
    },
    closedAt: {
        type: Date
    }
}, {
    // Automatically adds createdAt and updatedAt
    timestamps: true
});

complaintSchema.pre('save', async function (next) {
    // We only want to generate the ID if the document is brand new
    if (this.isNew) {
        try {
            // 1. Get the current year (e.g. 2026)
            const year = new Date().getFullYear();

            // 2. Generate a random 4-digit number (e.g. between 1000 and 9999)
            const randomDigits = Math.floor(1000 + Math.random() * 9000);


            this.complaintId = `COMP-${year}${randomDigits}`;

            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});



const complaintModel = mongoose.model('Complaint', complaintSchema);

module.exports = complaintModel;