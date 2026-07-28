const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        type: {
            type: String,
            enum: [
                'course_enrolled', 'course_approved', 'course_rejected', 'course_update',
                'new_review', 'new_message', 'payment_success', 'payment_failed',
                'admin_announcement', 'certificate_issued', 'assignment_graded',
                'quiz_result', 'new_student', 'withdrawal_approved', 'discount_alert',
            ],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        link: { type: String, default: '/' },
        isRead: { type: Boolean, default: false },
        readAt: { type: Date },
        metadata: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
