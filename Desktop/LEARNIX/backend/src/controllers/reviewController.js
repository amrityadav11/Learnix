const Review = require('../models/Review');
const Course = require('../models/Course');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

// @desc   Get reviews for a course
// @route  GET /api/v1/courses/:courseId/reviews
exports.getReviews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ course: req.params.courseId, isApproved: true })
            .populate('user', 'name avatar')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ course: req.params.courseId, isApproved: true });

        // Rating breakdown
        const breakdown = await Review.aggregate([
            { $match: { course: require('mongoose').Types.ObjectId.createFromHexString(req.params.courseId), isApproved: true } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } },
        ]);

        res.status(200).json({ success: true, reviews, total, totalPages: Math.ceil(total / limit), breakdown });
    } catch (error) {
        next(error);
    }
};

// @desc   Create review
// @route  POST /api/v1/courses/:courseId/reviews
exports.createReview = async (req, res, next) => {
    try {
        // Check if user purchased the course
        const hasPurchased = await Order.findOne({
            user: req.user.id,
            'courses.course': req.params.courseId,
            paymentStatus: 'completed',
        });
        if (!hasPurchased) return next(new ErrorResponse('You must purchase this course to leave a review.', 403));

        const existingReview = await Review.findOne({ course: req.params.courseId, user: req.user.id });
        if (existingReview) return next(new ErrorResponse('You have already reviewed this course.', 400));

        const review = await Review.create({
            course: req.params.courseId,
            user: req.user.id,
            rating: req.body.rating,
            title: req.body.title,
            comment: req.body.comment,
        });

        // Notify instructor
        const course = await Course.findById(req.params.courseId);
        if (course) {
            await Notification.create({
                recipient: course.instructor,
                sender: req.user.id,
                type: 'new_review',
                title: 'New Review Received',
                message: `A student left a ${review.rating}-star review on "${course.title}".`,
                link: `/instructor/courses/${course._id}`,
            });
        }

        await review.populate('user', 'name avatar');
        res.status(201).json({ success: true, review });
    } catch (error) {
        next(error);
    }
};

// @desc   Update review
// @route  PUT /api/v1/reviews/:id
exports.updateReview = async (req, res, next) => {
    try {
        let review = await Review.findById(req.params.id);
        if (!review) return next(new ErrorResponse('Review not found.', 404));
        if (review.user.toString() !== req.user.id) return next(new ErrorResponse('Not authorized.', 403));

        review.rating = req.body.rating || review.rating;
        review.comment = req.body.comment || review.comment;
        review.title = req.body.title || review.title;
        await review.save();

        res.status(200).json({ success: true, review });
    } catch (error) {
        next(error);
    }
};

// @desc   Delete review
// @route  DELETE /api/v1/reviews/:id
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return next(new ErrorResponse('Review not found.', 404));
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized.', 403));
        }
        await Review.calcAverageRating(review.course);
        await review.deleteOne();
        res.status(200).json({ success: true, message: 'Review deleted.' });
    } catch (error) {
        next(error);
    }
};

// @desc   Like review
// @route  PUT /api/v1/reviews/:id/like
exports.likeReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return next(new ErrorResponse('Review not found.', 404));

        const likedIndex = review.likes.indexOf(req.user.id);
        if (likedIndex === -1) {
            review.likes.push(req.user.id);
            review.totalLikes += 1;
        } else {
            review.likes.splice(likedIndex, 1);
            review.totalLikes = Math.max(0, review.totalLikes - 1);
        }
        await review.save();
        res.status(200).json({ success: true, totalLikes: review.totalLikes });
    } catch (error) {
        next(error);
    }
};

// @desc   Report review
// @route  PUT /api/v1/reviews/:id/report
exports.reportReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { isReported: true, reportReason: req.body.reason },
            { new: true }
        );
        if (!review) return next(new ErrorResponse('Review not found.', 404));
        res.status(200).json({ success: true, message: 'Review reported.' });
    } catch (error) {
        next(error);
    }
};
