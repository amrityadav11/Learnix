const User = require('../models/User');
const Course = require('../models/Course');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const Blog = require('../models/Blog');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

// @desc   Get admin dashboard stats
// @route  GET /api/v1/admin/stats
exports.getDashboardStats = async (req, res, next) => {
    try {
        const [totalUsers, totalCourses, totalOrders, totalRevenue] = await Promise.all([
            User.countDocuments(),
            Course.countDocuments({ isPublished: true }),
            Order.countDocuments({ paymentStatus: 'completed' }),
            Order.aggregate([{ $match: { paymentStatus: 'completed' } }, { $group: { _id: null, total: { $sum: '$finalAmount' } } }]),
        ]);

        const revenueByMonth = await Order.aggregate([
            { $match: { paymentStatus: 'completed', createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$finalAmount' }, orders: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        const usersByMonth = await User.aggregate([
            { $match: { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        const recentOrders = await Order.find({ paymentStatus: 'completed' })
            .populate('user', 'name email avatar')
            .populate('courses.course', 'title')
            .sort('-createdAt')
            .limit(10);

        const topCourses = await Course.find({ isPublished: true }).sort('-totalStudents').limit(5)
            .populate('instructor', 'name');

        const coursesByCategory = await Course.aggregate([
            { $match: { isPublished: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
            { $unwind: '$category' },
            { $project: { name: '$category.name', count: 1 } },
            { $sort: { count: -1 } },
            { $limit: 8 },
        ]);

        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalInstructors = await User.countDocuments({ role: 'instructor' });
        const pendingCourses = await Course.countDocuments({ status: 'pending' });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers, totalCourses, totalOrders, totalStudents, totalInstructors, pendingCourses,
                totalRevenue: totalRevenue[0]?.total || 0,
            },
            revenueByMonth, usersByMonth, recentOrders, topCourses, coursesByCategory,
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Get all users
// @route  GET /api/v1/admin/users
exports.getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.query.role) query.role = req.query.role;
        if (req.query.search) {
            query.$or = [
                { name: new RegExp(req.query.search, 'i') },
                { email: new RegExp(req.query.search, 'i') },
            ];
        }
        if (req.query.status === 'suspended') query.isSuspended = true;
        if (req.query.status === 'active') query.isSuspended = false;

        const users = await User.find(query).sort('-createdAt').skip(skip).limit(limit);
        const total = await User.countDocuments(query);

        res.status(200).json({ success: true, users, total, totalPages: Math.ceil(total / limit), currentPage: page });
    } catch (error) {
        next(error);
    }
};

// @desc   Update user (admin)
// @route  PUT /api/v1/admin/users/:id
exports.updateUser = async (req, res, next) => {
    try {
        const allowedFields = ['name', 'email', 'role', 'isSuspended', 'isActive', 'isApprovedInstructor', 'isEmailVerified'];
        const updateData = {};
        allowedFields.forEach((f) => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!user) return next(new ErrorResponse('User not found.', 404));

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// @desc   Delete user (admin)
// @route  DELETE /api/v1/admin/users/:id
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return next(new ErrorResponse('User not found.', 404));
        res.status(200).json({ success: true, message: 'User deleted.' });
    } catch (error) {
        next(error);
    }
};

// @desc   Get all courses (admin)
// @route  GET /api/v1/admin/courses
exports.getAdminCourses = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.search) query.$or = [{ title: new RegExp(req.query.search, 'i') }];

        const courses = await Course.find(query)
            .populate('instructor', 'name email')
            .populate('category', 'name')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        const total = await Course.countDocuments(query);
        res.status(200).json({ success: true, courses, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        next(error);
    }
};

// @desc   Approve / reject course
// @route  PUT /api/v1/admin/courses/:id/approve
exports.approveCourse = async (req, res, next) => {
    try {
        const { approve, reason } = req.body;
        const course = await Course.findById(req.params.id);
        if (!course) return next(new ErrorResponse('Course not found.', 404));

        if (approve) {
            course.status = 'published';
            course.isPublished = true;
            course.isApproved = true;
            course.approvedAt = Date.now();
            course.publishedAt = Date.now();
        } else {
            course.status = 'rejected';
        }
        await course.save();

        // Notify instructor
        await Notification.create({
            recipient: course.instructor,
            type: approve ? 'course_approved' : 'course_rejected',
            title: approve ? 'Course Approved!' : 'Course Rejected',
            message: approve
                ? `Your course "${course.title}" has been approved and is now live.`
                : `Your course "${course.title}" was rejected. Reason: ${reason || 'Did not meet guidelines.'}`,
            link: `/instructor/courses/${course._id}`,
        });

        res.status(200).json({ success: true, course });
    } catch (error) {
        next(error);
    }
};

// @desc   Manage categories
// @route  POST /api/v1/admin/categories
exports.createCategory = async (req, res, next) => {
    try {
        const { name, description, icon, color, parent } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const existing = await Category.findOne({ slug });
        if (existing) return next(new ErrorResponse('Category with this name already exists.', 400));
        const category = await Category.create({ name, slug, description, icon, color, parent: parent || null });
        if (parent) {
            await Category.findByIdAndUpdate(parent, { $push: { subcategories: category._id } });
        }
        res.status(201).json({ success: true, category });
    } catch (error) {
        next(error);
    }
};

// @desc   Delete category (admin)
// @route  DELETE /api/v1/admin/categories/:id
exports.deleteCategory = async (req, res, next) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Category deleted.' });
    } catch (error) {
        next(error);
    }
};

// @desc   Get all orders (admin)
// @route  GET /api/v1/admin/orders
exports.getAdminOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('courses.course', 'title')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments();
        res.status(200).json({ success: true, orders, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        next(error);
    }
};

// @desc   Create coupon
// @route  POST /api/v1/admin/coupons
exports.createCoupon = async (req, res, next) => {
    try {
        req.body.createdBy = req.user.id;
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, coupon });
    } catch (error) {
        next(error);
    }
};

// @desc   Get/update site settings
// @route  GET/PUT /api/v1/admin/settings
exports.getSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) settings = await Settings.create({});
        res.status(200).json({ success: true, settings });
    } catch (error) {
        next(error);
    }
};

exports.updateSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(req.body);
        } else {
            settings = await Settings.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
        }
        res.status(200).json({ success: true, settings });
    } catch (error) {
        next(error);
    }
};

// @desc   Send announcement
// @route  POST /api/v1/admin/announce
exports.sendAnnouncement = async (req, res, next) => {
    try {
        const { title, message, targetRole, link } = req.body;
        let userQuery = {};
        if (targetRole && targetRole !== 'all') userQuery.role = targetRole;

        const users = await User.find(userQuery).select('_id');
        const notifications = users.map((u) => ({
            recipient: u._id,
            type: 'admin_announcement',
            title,
            message,
            link: link || '/',
            sender: req.user.id,
        }));

        await Notification.insertMany(notifications);
        res.status(200).json({ success: true, message: `Announcement sent to ${users.length} users.` });
    } catch (error) {
        next(error);
    }
};

// @desc   Delete review (admin)
// @route  DELETE /api/v1/admin/reviews/:id
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return next(new ErrorResponse('Review not found.', 404));
        await Review.calcAverageRating(review.course);
        res.status(200).json({ success: true, message: 'Review deleted.' });
    } catch (error) {
        next(error);
    }
};
