const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const {
    register, login, logout, getMe, verifyEmail, forgotPassword, resetPassword,
    changePassword, sendOTP, verifyOTP, updateProfile, uploadAvatar, deleteAccount,
    googleCallback, githubCallback, becomeInstructor,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { uploadAvatar: uploadAvatarMiddleware } = require('../middlewares/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/change-password', protect, changePassword);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.put('/update-profile', protect, updateProfile);
router.put('/upload-avatar', protect, uploadAvatarMiddleware, uploadAvatar);
router.delete('/delete-account', protect, deleteAccount);
router.put('/become-instructor', protect, becomeInstructor);

// OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google` }), googleCallback);
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=github` }), githubCallback);

module.exports = router;
