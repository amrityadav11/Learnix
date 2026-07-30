const User = require('../models/User');
const Course = require('../models/Course');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const Blog = require('../models/Blog');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const ErrorResponse = require('../utils/errorResponse');

// Helper function to log admin activities
const logActivity = async (userId, action, description, targetModel = 'None', targetId = null, metadata = {}, req = null) => {
    try {
        await ActivityLog.create({
            user: userId,
            action,
            actionDescription: description,
            targetModel,
            targetId,
            metadata,
            ipAddress: req?.ip || req?.connection?.remoteAddress,
            userAgent: req?.get('user-agent')
        });
    } catch (err) {
        console.error('Activity log error:', err.message);
    }
};

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

// @desc   List/Delist (Publish/Unpublish) course
// @route  PUT /api/v1/admin/courses/:id/toggle-publish
exports.toggleCoursePublish = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return next(new ErrorResponse('Course not found.', 404));

        // Toggle publish status
        course.isPublished = !course.isPublished;
        course.status = course.isPublished ? 'published' : 'unpublished';

        if (course.isPublished) {
            course.publishedAt = Date.now();
        }

        await course.save();

        // Notify instructor
        await Notification.create({
            recipient: course.instructor,
            type: course.isPublished ? 'course_published' : 'course_unpublished',
            title: course.isPublished ? 'Course Published' : 'Course Unpublished',
            message: course.isPublished
                ? `Your course "${course.title}" is now live and visible to students.`
                : `Your course "${course.title}" has been unpublished and is no longer visible to students.`,
            link: `/instructor/courses/${course._id}`,
        });

        res.status(200).json({
            success: true,
            course,
            message: course.isPublished ? 'Course published successfully' : 'Course unpublished successfully'
        });
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

// @desc   Get all orders (admin) with date filtering
// @route  GET /api/v1/admin/orders
exports.getAdminOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { period, startDate, endDate, status } = req.query;

        let query = {};

        // Filter by status
        if (status && status !== 'all') {
            query.paymentStatus = status;
        }

        // Filter by time period
        const now = new Date();
        if (period) {
            switch (period) {
                case 'today':
                    query.createdAt = {
                        $gte: new Date(now.setHours(0, 0, 0, 0)),
                        $lte: new Date(now.setHours(23, 59, 59, 999))
                    };
                    break;
                case 'week':
                    const weekAgo = new Date(now.setDate(now.getDate() - 7));
                    query.createdAt = { $gte: weekAgo };
                    break;
                case 'month':
                    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                    query.createdAt = { $gte: monthAgo };
                    break;
                case 'year':
                    const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
                    query.createdAt = { $gte: yearAgo };
                    break;
                case 'custom':
                    if (startDate && endDate) {
                        query.createdAt = {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        };
                    }
                    break;
            }
        }

        const orders = await Order.find(query)
            .populate('user', 'name email avatar')
            .populate('courses.course', 'title thumbnail')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(query);

        // Calculate stats for the filtered period
        const stats = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$finalAmount' },
                    totalOrders: { $sum: 1 },
                    completedOrders: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
                    },
                    completedRevenue: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, '$finalAmount', 0] }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            orders,
            total,
            totalPages: Math.ceil(total / limit),
            stats: stats[0] || { totalRevenue: 0, totalOrders: 0, completedOrders: 0, completedRevenue: 0 }
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Download orders report (CSV format)
// @route  GET /api/v1/admin/orders/download
exports.downloadOrdersReport = async (req, res, next) => {
    try {
        const { period, startDate, endDate, status } = req.query;

        let query = {};

        // Apply same filters as getAdminOrders
        if (status && status !== 'all') {
            query.paymentStatus = status;
        }

        const now = new Date();
        if (period) {
            switch (period) {
                case 'today':
                    query.createdAt = {
                        $gte: new Date(now.setHours(0, 0, 0, 0)),
                        $lte: new Date(now.setHours(23, 59, 59, 999))
                    };
                    break;
                case 'week':
                    const weekAgo = new Date(now.setDate(now.getDate() - 7));
                    query.createdAt = { $gte: weekAgo };
                    break;
                case 'month':
                    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                    query.createdAt = { $gte: monthAgo };
                    break;
                case 'year':
                    const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
                    query.createdAt = { $gte: yearAgo };
                    break;
                case 'custom':
                    if (startDate && endDate) {
                        query.createdAt = {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        };
                    }
                    break;
            }
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('courses.course', 'title')
            .sort('-createdAt');

        // Generate CSV content
        const csvHeader = 'Order ID,Date,Customer Name,Customer Email,Payment Method,Status,Courses,Total Amount,Discount,Final Amount\n';
        const csvRows = orders.map(order => {
            const courses = order.courses.map(c => c.course?.title || 'Unknown').join('; ');
            return `${order._id},${new Date(order.createdAt).toISOString()},${order.user?.name || 'N/A'},${order.user?.email || 'N/A'},${order.paymentMethod},${order.paymentStatus},"${courses}",${order.totalAmount},${order.couponDiscount || 0},${order.finalAmount}`;
        }).join('\n');

        const csv = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=orders-report-${Date.now()}.csv`);
        res.status(200).send(csv);
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

        // Log activity
        await logActivity(req.user.id, 'review_deleted', `Deleted review for course`, 'Review', req.params.id, {}, req);

        res.status(200).json({ success: true, message: 'Review deleted.' });
    } catch (error) {
        next(error);
    }
};

// @desc   Get admin activity logs
// @route  GET /api/v1/admin/activities
exports.getActivityLogs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const { action, userId, startDate, endDate } = req.query;

        let query = {};

        if (action && action !== 'all') {
            query.action = action;
        }

        if (userId) {
            query.user = userId;
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const activities = await ActivityLog.find(query)
            .populate('user', 'name email avatar role')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        const total = await ActivityLog.countDocuments(query);

        // Get activity stats
        const stats = await ActivityLog.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            activities,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            stats
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Get login/logout statistics
// @route  GET /api/v1/admin/login-stats
exports.getLoginStats = async (req, res, next) => {
    try {
        const { period } = req.query;

        const now = new Date();
        let query = {
            action: { $in: ['login', 'logout'] }
        };

        // Apply time filter
        if (period) {
            switch (period) {
                case 'today':
                    query.createdAt = {
                        $gte: new Date(now.setHours(0, 0, 0, 0))
                    };
                    break;
                case 'week':
                    const weekAgo = new Date(now.setDate(now.getDate() - 7));
                    query.createdAt = { $gte: weekAgo };
                    break;
                case 'month':
                    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                    query.createdAt = { $gte: monthAgo };
                    break;
            }
        }

        // Get login/logout counts
        const stats = await ActivityLog.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        action: '$action',
                        user: '$user'
                    },
                    count: { $sum: 1 },
                    lastActivity: { $max: '$createdAt' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id.user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: '$userInfo'
            },
            {
                $project: {
                    action: '$_id.action',
                    user: {
                        _id: '$userInfo._id',
                        name: '$userInfo.name',
                        email: '$userInfo.email',
                        role: '$userInfo.role'
                    },
                    count: 1,
                    lastActivity: 1
                }
            },
            { $sort: { lastActivity: -1 } }
        ]);

        const totalLogins = await ActivityLog.countDocuments({ ...query, action: 'login' });
        const totalLogouts = await ActivityLog.countDocuments({ ...query, action: 'logout' });

        res.status(200).json({
            success: true,
            stats,
            summary: {
                totalLogins,
                totalLogouts
            }
        });
    } catch (error) {
        next(error);
    }
};
