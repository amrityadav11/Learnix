const express = require('express');
const router = express.Router();
const {
    getDashboardStats, getUsers, updateUser, deleteUser,
    getAdminCourses, approveCourse, createCategory, deleteCategory,
    getAdminOrders, createCoupon, getSettings, updateSettings,
    sendAnnouncement, deleteReview,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);

// Users
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Courses
router.get('/courses', getAdminCourses);
router.put('/courses/:id/approve', approveCourse);

// Categories
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

// Orders
router.get('/orders', getAdminOrders);

// Coupons
router.post('/coupons', createCoupon);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Announcements
router.post('/announce', sendAnnouncement);

// Reviews
router.delete('/reviews/:id', deleteReview);

module.exports = router;
