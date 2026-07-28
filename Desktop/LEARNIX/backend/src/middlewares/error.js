const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log for dev
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', err);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error = new ErrorResponse(`Resource not found with id: ${err.value}`, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = new ErrorResponse(`Duplicate field value: ${field} already exists.`, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        error = new ErrorResponse(messages.join(', '), 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new ErrorResponse('Invalid token. Please login again.', 401);
    }

    if (err.name === 'TokenExpiredError') {
        error = new ErrorResponse('Token has expired. Please login again.', 401);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
