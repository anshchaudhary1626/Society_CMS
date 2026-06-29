const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { ROLES, CATEGORIES } = require('../utils/constants');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    role: {
        type: String,
        enum: {
            values: Object.values(ROLES),
            message: "Invalid Role"
        },
        default: ROLES.RESIDENT
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    flatNumber: {
        type: String,
        required: function () {
            return this.role === ROLES.RESIDENT;
        },
        trim: true
    },
    // Worker-specific fields:
    isAvailable: {
        type: Boolean,
        default: true
    },
    specialization: [
        {
            type: String,
            enum: Object.values(CATEGORIES) // Matching Electricity, Water, Plumbing, etc.
        }
    ],
    activeComplaints: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
})

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) return next();

    try {
        this.password = await bcrypt.hash(this.password, 10)
        next()
    } catch (error) {
        return next(error)
    }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

const userModel = mongoose.model('User', userSchema)

module.exports = userModel