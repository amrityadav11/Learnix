const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, maxlength: 100 },
        comment: { type: String, required: true, maxlength: 1000 },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        totalLikes: { type: Number, default: 0 },
        isApproved: { type: Boolean, default: true },
        isReported: { type: Boolean, default: false },
        reportReason: { type: String },
        instructorReply: {
            comment: String,
            repliedAt: Date,
        },
    },
    { timestamps: true }
);

reviewSchema.index({ course: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (courseId) {
    const stats = await this.aggregate([
        { $match: { course: courseId, isApproved: true } },
        { $group: { _id: '$course', avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
    ]);
    const Course = require('./Course');
    if (stats.length > 0) {
        await Course.findByIdAndUpdate(courseId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
            totalReviews: stats[0].totalReviews,
        });
    } else {
        await Course.findByIdAndUpdate(courseId, { averageRating: 0, totalReviews: 0 });
    }
};

reviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.course);
});

reviewSchema.post('remove', function () {
    this.constructor.calcAverageRating(this.course);
});

module.exports = mongoose.model('Review', reviewSchema);
