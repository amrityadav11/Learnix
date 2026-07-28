const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 50 },
        email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
        password: { type: String, minlength: 6, select: false },
        avatar: { type: String, default: '' },
        avatarPublicId: { type: String, default: '' },
        role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
        isEmailVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        isSuspended: { type: Boolean, default: false },

        // OAuth
        googleId: { type: String },
        githubId: { type: String },
        provider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },

        // OTP
        otp: { type: String, select: false },
        otpExpire: { type: Date, select: false },

        // Password Reset
        resetPasswordToken: { type: String, select: false },
        resetPasswordExpire: { type: Date, select: false },

        // Email Verification
        emailVerificationToken: { type: String, select: false },
        emailVerificationExpire: { type: Date, select: false },

        // Profile
        bio: { type: String, maxlength: 500 },
        headline: { type: String, maxlength: 120 },
        website: { type: String },
        twitter: { type: String },
        linkedin: { type: String },
        youtube: { type: String },
        phone: { type: String },
        country: { type: String },
        language: { type: String, default: 'English' },

        // Student specific
        enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
        completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
        badges: [{ type: String }],
        points: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        lastActive: { type: Date },

        // Instructor specific
        isApprovedInstructor: { type: Boolean, default: false },
        totalEarnings: { type: Number, default: 0 },
        pendingEarnings: { type: Number, default: 0 },
        withdrawnEarnings: { type: Number, default: 0 },
        bankDetails: {
            accountNumber: String,
            ifscCode: String,
            bankName: String,
            accountHolderName: String,
        },

        // Notifications settings
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },

        // Referral
        referralCode: { type: String, unique: true, sparse: true },
        referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        referralEarnings: { type: Number, default: 0 },

        rememberMe: { type: Boolean, default: false },
        twoFactorEnabled: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

// Generate referral code
userSchema.pre('save', function (next) {
    if (!this.referralCode) {
        this.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    }
    next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    return resetToken;
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function () {
    const verifyToken = crypto.randomBytes(20).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return verifyToken;
};

module.exports = mongoose.model('User', userSchema);
