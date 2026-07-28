const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

// @desc   Get user notifications
// @route  GET /api/v1/notifications
exports.getNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipient: req.user.id })
            .populate('sender', 'name avatar')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments({ recipient: req.user.id });
        const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });

        res.status(200).json({ success: true, notifications, total, unreadCount, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        next(error);
    }
};

// @desc   Mark notification as read
// @route  PUT /api/v1/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        if (!notification) return next(new ErrorResponse('Notification not found.', 404));
        res.status(200).json({ success: true, notification });
    } catch (error) {
        next(error);
    }
};

// @desc   Mark all notifications as read
// @route  PUT /api/v1/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
        next(error);
    }
};

// @desc   Delete notification
// @route  DELETE /api/v1/notifications/:id
exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user.id,
        });
        if (!notification) return next(new ErrorResponse('Notification not found.', 404));
        res.status(200).json({ success: true, message: 'Notification deleted.' });
    } catch (error) {
        next(error);
    }
};

// @desc   Delete all notifications
// @route  DELETE /api/v1/notifications
exports.deleteAllNotifications = async (req, res, next) => {
    try {
        await Notification.deleteMany({ recipient: req.user.id });
        res.status(200).json({ success: true, message: 'All notifications deleted.' });
    } catch (error) {
        next(error);
    }
};
