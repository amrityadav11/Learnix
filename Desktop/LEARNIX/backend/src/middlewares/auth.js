const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Protect routes - verify JWT
 */
exports.protect = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ErrorResponse('Not authorized. Please login.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new ErrorResponse('User no longer exists.', 401));
        }

        if (user.isSuspended) {
            return next(new ErrorResponse('Your account has been suspended. Contact support.', 403));
        }

        if (!user.isActive) {
            return next(new ErrorResponse('Your account is deactivated.', 403));
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized. Invalid token.', 401));
    }
};

/**
 * Grant access to specific roles
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`Role '${req.user.role}' is not authorized for this route.`, 403));
        }
        next();
    };
};

/**
 * Check if email is verified
 */
exports.requireEmailVerification = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return next(new ErrorResponse('Please verify your email address first.', 403));
    }
    next();
};

/**
 * Optional authentication - attach user if token exists
 */
exports.optionalAuth = async (req, res, next) => {
    let token;
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
        } catch (err) {
            // Continue without user
        }
    }
    next();
};
