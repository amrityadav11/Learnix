const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        action: {
            type: String,
            required: true,
            enum: [
                'login',
                'logout',
                'course_approved',
                'course_rejected',
                'course_published',
                'course_unpublished',
                'course_deleted',
                'course_created',
                'user_updated',
                'user_deleted',
                'user_suspended',
                'category_created',
                'category_deleted',
                'coupon_created',
                'settings_updated',
                'announcement_sent',
                'review_deleted',
                'order_refunded'
            ]
        },
        actionDescription: {
            type: String,
            required: true
        },
        targetModel: {
            type: String,
            enum: ['User', 'Course', 'Category', 'Coupon', 'Review', 'Order', 'Settings', 'None'],
            default: 'None'
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed
        },
        ipAddress: {
            type: String
        },
        userAgent: {
            type: String
        }
    },
    { timestamps: true }
);

// Index for efficient queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
