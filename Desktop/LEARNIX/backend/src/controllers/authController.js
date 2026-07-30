const crypto = require('crypto');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const ErrorResponse = require('../utils/errorResponse');
const { sendTokenResponse } = require('../utils/jwt');
const {
    sendWelcomeEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendOTPEmail,
} = require('../utils/email');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc   Register user
// @route  POST /api/v1/auth/register
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorResponse('Email already registered.', 400));
        }

        const allowedRoles = ['student', 'instructor'];
        const userRole = allowedRoles.includes(role) ? role : 'student';

        const user = await User.create({ name, email, password, role: userRole });

        // Send verification email
        const verifyToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });
        try {
            await sendVerificationEmail(user, verifyToken);
            await sendWelcomeEmail(user);
        } catch (err) {
            console.error('Email sending failed:', err.message);
        }

        sendTokenResponse(user, 201, res, 'Registration successful! Please verify your email.');
    } catch (error) {
        next(error);
    }
};

// @desc   Login user
// @route  POST /api/v1/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password, rememberMe } = req.body;
        if (!email || !password) {
            return next(new ErrorResponse('Please provide email and password.', 400));
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return next(new ErrorResponse('Invalid email or password.', 401));
        }

        if (user.isSuspended) {
            return next(new ErrorResponse('Your account is suspended. Contact support.', 403));
        }

        user.rememberMe = rememberMe || false;
        user.lastActive = Date.now();
        await user.save({ validateBeforeSave: false });

        // Log login activity
        try {
            const ActivityLog = require('../models/ActivityLog');
            await ActivityLog.create({
                user: user._id,
                action: 'login',
                actionDescription: `${user.name} logged in successfully`,
                targetModel: 'User',
                targetId: user._id,
                ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
                userAgent: req.get('user-agent') || 'Unknown'
            });
            console.log('[LOGIN LOG] Created for user:', user.email);
        } catch (err) {
            console.error('[LOGIN LOG ERROR]:', err.message);
        }

        sendTokenResponse(user, 200, res, 'Login successful!');
    } catch (error) {
        next(error);
    }
};

// @desc   Logout user
// @route  POST /api/v1/auth/logout
exports.logout = async (req, res, next) => {
    try {
        // Log logout activity if user is authenticated
        if (req.user) {
            try {
                const ActivityLog = require('../models/ActivityLog');
                await ActivityLog.create({
                    user: req.user.id,
                    action: 'logout',
                    actionDescription: `User logged out`,
                    targetModel: 'User',
                    targetId: req.user.id,
                    ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
                    userAgent: req.get('user-agent') || 'Unknown'
                });
                console.log('[LOGOUT LOG] Created for user:', req.user.id);
            } catch (err) {
                console.error('[LOGOUT LOG ERROR]:', err.message);
            }
        }

        res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
        res.status(200).json({ success: true, message: 'Logged out successfully.' });
    } catch (error) {
        next(error);
    }
};

// @desc   Get current user
// @route  GET /api/v1/auth/me
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('enrolledCourses', 'title thumbnail');
        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// @desc   Verify email
// @route  GET /api/v1/auth/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpire: { $gt: Date.now() },
        }).select('+emailVerificationToken +emailVerificationExpire');

        if (!user) {
            return next(new ErrorResponse('Invalid or expired verification token.', 400));
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Email verified successfully!' });
    } catch (error) {
        next(error);
    }
};

// @desc   Forgot password
// @route  POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return next(new ErrorResponse('No user found with that email.', 404));
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        try {
            await sendPasswordResetEmail(user, resetToken);
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return next(new ErrorResponse('Email could not be sent.', 500));
        }

        res.status(200).json({ success: true, message: 'Password reset email sent.' });
    } catch (error) {
        next(error);
    }
};

// @desc   Reset password
// @route  PUT /api/v1/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        }).select('+resetPasswordToken +resetPasswordExpire');

        if (!user) {
            return next(new ErrorResponse('Invalid or expired reset token.', 400));
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res, 'Password reset successfully!');
    } catch (error) {
        next(error);
    }
};

// @desc   Change password
// @route  PUT /api/v1/auth/change-password
exports.changePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return next(new ErrorResponse('Current password is incorrect.', 400));
        }
        user.password = req.body.newPassword;
        await user.save();
        res.status(200).json({ success: true, message: 'Password changed successfully!' });
    } catch (error) {
        next(error);
    }
};

// @desc   Send OTP
// @route  POST /api/v1/auth/send-otp
exports.sendOTP = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return next(new ErrorResponse('User not found.', 404));

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = crypto.createHash('sha256').update(otp).digest('hex');
        user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 min
        await user.save({ validateBeforeSave: false });

        await sendOTPEmail(user, otp);
        res.status(200).json({ success: true, message: 'OTP sent to your email.' });
    } catch (error) {
        next(error);
    }
};

// @desc   Verify OTP
// @route  POST /api/v1/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
    try {
        const hashedOtp = crypto.createHash('sha256').update(req.body.otp).digest('hex');
        const user = await User.findOne({
            email: req.body.email,
            otp: hashedOtp,
            otpExpire: { $gt: Date.now() },
        }).select('+otp +otpExpire');

        if (!user) return next(new ErrorResponse('Invalid or expired OTP.', 400));

        user.otp = undefined;
        user.otpExpire = undefined;
        user.isEmailVerified = true;
        await user.save();

        sendTokenResponse(user, 200, res, 'OTP verified successfully!');
    } catch (error) {
        next(error);
    }
};

// @desc   Update profile
// @route  PUT /api/v1/auth/update-profile
exports.updateProfile = async (req, res, next) => {
    try {
        const allowedFields = ['name', 'bio', 'headline', 'website', 'twitter', 'linkedin', 'youtube', 'phone', 'country', 'language'];
        const updateData = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updateData[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
        res.status(200).json({ success: true, message: 'Profile updated.', user });
    } catch (error) {
        next(error);
    }
};

// @desc   Upload avatar
// @route  PUT /api/v1/auth/upload-avatar
exports.uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) return next(new ErrorResponse('Please upload an image.', 400));

        const user = await User.findById(req.user.id);
        if (user.avatarPublicId) {
            await deleteFromCloudinary(user.avatarPublicId);
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const { url, publicId } = await uploadToCloudinary(dataURI, 'learnix/avatars', {
            transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
        });

        user.avatar = url;
        user.avatarPublicId = publicId;
        await user.save();

        res.status(200).json({ success: true, message: 'Avatar updated.', avatar: url });
    } catch (error) {
        next(error);
    }
};

// @desc   Delete account
// @route  DELETE /api/v1/auth/delete-account
exports.deleteAccount = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');
        if (user.provider === 'local' && !(await user.matchPassword(req.body.password))) {
            return next(new ErrorResponse('Password is incorrect.', 400));
        }
        if (user.avatarPublicId) {
            await deleteFromCloudinary(user.avatarPublicId);
        }
        await User.findByIdAndDelete(req.user.id);
        res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
        res.status(200).json({ success: true, message: 'Account deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

// @desc   Google OAuth callback
// @route  GET /api/v1/auth/google/callback
exports.googleCallback = async (req, res) => {
    sendTokenResponse(req.user, 200, res, 'Google login successful!');
};

// @desc   GitHub OAuth callback
// @route  GET /api/v1/auth/github/callback
exports.githubCallback = async (req, res) => {
    sendTokenResponse(req.user, 200, res, 'GitHub login successful!');
};
