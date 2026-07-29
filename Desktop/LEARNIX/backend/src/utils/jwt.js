const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token and send it as a cookie
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });

    const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE) || 7;
    const cookieOptions = {
        expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
    };

    res.status(statusCode).cookie('token', token, cookieOptions).json({
        success: true,
        message,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        },
    });
};

module.exports = { sendTokenResponse };
