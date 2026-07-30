const mongoose = require('mongoose');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Assignment = require('../models/Assignment');
const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');
const Progress = require('../models/Progress');
const ErrorResponse = require('../utils/errorResponse');
const { uploadVideoToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// @desc   Get instructor dashboard overview
// @route  GET /api/v1/instructor/overview
exports.getDashboardOverview = async (req, res, next) => {
    try {
        const instructorId = req.user.id;

        // Get all courses
        const courses = await Course.find({ instructor: instructorId });
        const courseIds = courses.map(c => c._id);

        // Total students
        const totalStudents = await Course.aggregate([
            { $match: { instructor: mongoose.Types.ObjectId(instructorId) } },
            { $group: { _id: null, total: { $sum: '$totalStudents' } } }
        ]);

        // Total revenue
        const totalRevenue = courses.reduce((sum, course) => sum + (course.totalRevenue || 0), 0);

        // Average rating
        const avgRating = courses.length > 0
            ? courses.reduce((sum, c) => sum + (c.averageRating || 0), 0) / courses.length
            : 0;

        // Get recent orders/enrollments
        const recentEnrollments = await Order.find({ courses: { $in: courseIds } })
            .populate('user', 'name avatar email')
            .sort('-createdAt')
            .limit(5);

        // Get recent reviews
        const recentReviews = await Review.find({ course: { $in: courseIds } })
            .populate('user', 'name avatar')
            .sort('-createdAt')
            .limit(5);

        // Calculate completion rates
        const completionStats = await Progress.aggregate([
            { $match: { course: { $in: courseIds } } },
            { $group: { _id: '$course', avgCompletion: { $avg: '$progress' } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalCourses: courses.length,
                totalStudents: totalStudents[0]?.total || 0,
                totalRevenue,
                averageRating: avgRating.toFixed(2),
                courses: courses.map(c => ({
                    id: c._id,
                    title: c.title,
                    students: c.totalStudents,
                    revenue: c.totalRevenue,
                    rating: c.averageRating,
                    status: c.status
                })),
                recentEnrollments,
                recentReviews,
                completionStats
            }
        });
    } catch (error) {
        next(error);
    }
};

// ===================== UPLOAD VIDEOS/CONTENT =====================

// @desc   Upload video to course module lesson
// @route  POST /api/v1/instructor/courses/:courseId/modules/:moduleId/lessons/:lessonId/video
exports.uploadLessonVideo = async (req, res, next) => {
    try {
        const { courseId, moduleId, lessonId } = req.params;

        if (!req.file) {
            return next(new ErrorResponse('No video file provided', 400));
        }

        // Verify course ownership
        const course = await Course.findById(courseId);
        if (!course) return next(new ErrorResponse('Course not found', 404));
        if (course.instructor.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized to update this course', 403));
        }

        // Find module and lesson
        const module = course.modules.id(moduleId);
        if (!module) return next(new ErrorResponse('Module not found', 404));

        const lesson = module.lessons.id(lessonId);
        if (!lesson) return next(new ErrorResponse('Lesson not found', 404));

        // Delete old video if exists
        if (lesson.videoPublicId) {
            await deleteFromCloudinary(lesson.videoPublicId);
        }

        // Upload to Cloudinary
        const result = await uploadVideoToCloudinary(req.file.path);

        lesson.videoUrl = result.secure_url;
        lesson.videoPublicId = result.public_id;
        lesson.duration = Math.ceil(result.duration) || 0;

        await course.save();

        // Clean up temp file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            message: 'Video uploaded successfully',
            data: {
                videoUrl: lesson.videoUrl,
                duration: lesson.duration
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Delete lesson video
// @route  DELETE /api/v1/instructor/courses/:courseId/modules/:moduleId/lessons/:lessonId/video
exports.deleteLessonVideo = async (req, res, next) => {
    try {
        const { courseId, moduleId, lessonId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) return next(new ErrorResponse('Course not found', 404));
        if (course.instructor.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        const module = course.modules.id(moduleId);
        if (!module) return next(new ErrorResponse('Module not found', 404));

        const lesson = module.lessons.id(lessonId);
        if (!lesson) return next(new ErrorResponse('Lesson not found', 404));

        if (lesson.videoPublicId) {
            await deleteFromCloudinary(lesson.videoPublicId);
        }

        lesson.videoUrl = null;
        lesson.videoPublicId = null;
        lesson.duration = 0;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ===================== ASSIGNMENTS MANAGEMENT =====================

// @desc   Get all assignments for instructor's courses
// @route  GET /api/v1/instructor/assignments
exports.getInstructorAssignments = async (req, res, next) => {
    try {
        const courses = await Course.find({ instructor: req.user.id }).select('_id');
        const courseIds = courses.map(c => c._id);

        const assignments = await Assignment.find({ course: { $in: courseIds } })
            .populate('course', 'title')
            .populate('submissions.user', 'name email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Create assignment
// @route  POST /api/v1/instructor/assignments
exports.createAssignment = async (req, res, next) => {
    try {
        const { courseId, title, description, dueDate, maxScore } = req.body;

        // Verify course ownership
        const course = await Course.findById(courseId);
        if (!course) return next(new ErrorResponse('Course not found', 404));
        if (course.instructor.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        const assignment = await Assignment.create({
            course: courseId,
            title,
            description,
            dueDate,
            maxScore: maxScore || 100,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Assignment created successfully',
            data: assignment
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Update assignment
// @route  PUT /api/v1/instructor/assignments/:id
exports.updateAssignment = async (req, res, next) => {
    try {
        let assignment = await Assignment.findById(req.params.id);
        if (!assignment) return next(new ErrorResponse('Assignment not found', 404));

        // Verify ownership via course
        const course = await Course.findById(assignment.course);
        if (course.instructor.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Assignment updated successfully',
            data: assignment
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Delete assignment
// @route  DELETE /api/v1/instructor/assignments/:id
exports.deleteAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return next(new ErrorResponse('Assignment not found', 404));

        const course = await Course.findById(assignment.course);
        if (course.instructor.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        await Assignment.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Assignment deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Grade assignment submission
// @route  POST /api/v1/instructor/assignments/:id/submissions/:submissionId/grade
exports.gradeSubmission = async (req, res, next) => {
    try {
        const { score, feedback } = req.body;
        const { id, submissionId } = req.params;

        const assignment = await Assignment.findById(id);
        if (!assignment) return next(new ErrorResponse('Assignment not found', 404));

        const course = await Course.findById(assignment.course);
        if (course.instructor.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        const submission = assignment.submissions.id(submissionId);
        if (!submission) return next(new ErrorResponse('Submission not found', 404));

        submission.score = score;
        submission.feedback = feedback;
        submission.gradedAt = new Date();
        submission.isGraded = true;

        await assignment.save();

        res.status(200).json({
            success: true,
            message: 'Submission graded successfully',
            data: submission
        });
    } catch (error) {
        next(error);
    }
};

// ===================== QUIZZES MANAGEMENT =====================

// @desc   Get all quizzes for instructor's courses
// @route  GET /api/v1/instructor/quizzes
exports.getInstructorQuizzes = async (req, res, next) => {
    try {
        const courses = await Course.find({ instructor: req.user.id }).select('_id');
        const courseIds = courses.map(c => c._id);

        const quizzes = await Quiz.find({ course: { $in: courseIds } })
            .populate('course', 'title')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Create quiz
// @route  POST /api/v1/instructor/quizzes
exports.createQuiz = async (req, res, next) => {
    try {
        const { courseId, title, description, timeLimit, passingScore, questions } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return next(new ErrorResponse('Course not found', 404));
        if (course.instructor.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        const quiz = await Quiz.create({
            course: courseId,
            title,
            description,
            timeLimit,
            passingScore: passingScore || 60,
            questions: questions || [],
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            data: quiz
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Update quiz
// @route  PUT /api/v1/instructor/quizzes/:id
exports.updateQuiz = async (req, res, next) => {
    try {
        let quiz = await Quiz.findById(req.params.id);
        if (!quiz) return next(new ErrorResponse('Quiz not found', 404));

        const course = await Course.findById(quiz.course);
        if (course.instructor.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Quiz updated successfully',
            data: quiz
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Delete quiz
// @route  DELETE /api/v1/instructor/quizzes/:id
exports.deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return next(new ErrorResponse('Quiz not found', 404));

        const course = await Course.findById(quiz.course);
        if (course.instructor.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        await Quiz.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Add question to quiz
// @route  POST /api/v1/instructor/quizzes/:id/questions
exports.addQuizQuestion = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return next(new ErrorResponse('Quiz not found', 404));

        const course = await Course.findById(quiz.course);
        if (course.instructor.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        const { question, type, options, correctAnswer, points } = req.body;

        quiz.questions.push({
            question,
            type,
            options,
            correctAnswer,
            points: points || 1
        });

        await quiz.save();

        res.status(200).json({
            success: true,
            message: 'Question added successfully',
            data: quiz
        });
    } catch (error) {
        next(error);
    }
};

// ===================== REVIEWS MANAGEMENT =====================

// @desc   Get all reviews for instructor's courses
// @route  GET /api/v1/instructor/reviews
exports.getInstructorReviews = async (req, res, next) => {
    try {
        const courses = await Course.find({ instructor: req.user.id }).select('_id');
        const courseIds = courses.map(c => c._id);

        const { status = 'all' } = req.query;
        let filter = { course: { $in: courseIds } };

        if (status === 'pending') filter.isApproved = false;
        else if (status === 'approved') filter.isApproved = true;

        const reviews = await Review.find(filter)
            .populate('user', 'name avatar email')
            .populate('course', 'title')
            .sort('-createdAt');

        const stats = {
            total: reviews.length,
            approved: reviews.filter(r => r.isApproved).length,
            pending: reviews.filter(r => !r.isApproved).length,
            averageRating: reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
                : 0
        };

        res.status(200).json({
            success: true,
            stats,
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Approve/reject review
// @route  PUT /api/v1/instructor/reviews/:id
exports.updateReviewStatus = async (req, res, next) => {
    try {
        const { isApproved, replyText } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) return next(new ErrorResponse('Review not found', 404));

        // Verify ownership
        const course = await Course.findById(review.course);
        if (course.instructor.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        review.isApproved = isApproved;
        if (replyText) {
            review.instructorReply = {
                text: replyText,
                repliedAt: new Date()
            };
        }

        await review.save();

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: review
        });
    } catch (error) {
        next(error);
    }
};

// ===================== ANALYTICS =====================

// @desc   Get course analytics
// @route  GET /api/v1/instructor/analytics/:courseId
exports.getCourseAnalytics = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { dateRange = '30' } = req.query;

        const course = await Course.findById(courseId);
        if (!course) return next(new ErrorResponse('Course not found', 404));
        if (course.instructor.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        const days = parseInt(dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Enrollment trend
        const enrollmentTrend = await Order.aggregate([
            {
                $match: {
                    courses: course._id,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    enrollments: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Completion rate
        const completedStudents = await Progress.countDocuments({
            course: course._id,
            progress: 100
        });

        // Student engagement
        const engagement = await Progress.aggregate([
            { $match: { course: course._id } },
            {
                $group: {
                    _id: null,
                    avgProgress: { $avg: '$progress' },
                    totalStudents: { $sum: 1 }
                }
            }
        ]);

        // Revenue analytics
        const orders = await Order.find({
            courses: course._id,
            createdAt: { $gte: startDate }
        });

        const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Rating over time
        const ratingTrend = await Review.aggregate([
            {
                $match: {
                    course: course._id,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    avgRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                courseTitle: course.title,
                enrollmentTrend,
                completionStats: {
                    completed: completedStudents,
                    total: course.totalStudents,
                    rate: course.totalStudents > 0 ? ((completedStudents / course.totalStudents) * 100).toFixed(2) : 0
                },
                engagement: engagement[0] || { avgProgress: 0, totalStudents: 0 },
                revenue: {
                    total: revenue,
                    orders: orders.length,
                    avgOrderValue: orders.length > 0 ? (revenue / orders.length).toFixed(2) : 0
                },
                ratingTrend
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Get instructor analytics (all courses)
// @route  GET /api/v1/instructor/analytics
exports.getInstructorAnalytics = async (req, res, next) => {
    try {
        const { dateRange = '30' } = req.query;
        const days = parseInt(dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const courses = await Course.find({ instructor: req.user.id });
        const courseIds = courses.map(c => c._id);

        // Total metrics
        const totalStudents = courses.reduce((sum, c) => sum + c.totalStudents, 0);
        const totalRevenue = courses.reduce((sum, c) => sum + c.totalRevenue, 0);
        const avgRating = courses.length > 0
            ? (courses.reduce((sum, c) => sum + c.averageRating, 0) / courses.length).toFixed(2)
            : 0;

        // Enrollment trend
        const enrollmentTrend = await Order.aggregate([
            {
                $match: {
                    courses: { $in: courseIds },
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    enrollments: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top courses
        const topCourses = courses
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5)
            .map(c => ({
                title: c.title,
                students: c.totalStudents,
                revenue: c.totalRevenue,
                rating: c.averageRating
            }));

        // Student satisfaction
        const reviews = await Review.find({ course: { $in: courseIds } });
        const avgSatisfaction = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                metrics: {
                    totalCourses: courses.length,
                    totalStudents,
                    totalRevenue,
                    avgRating
                },
                enrollmentTrend,
                topCourses,
                studentSatisfaction: {
                    avgRating: avgSatisfaction,
                    totalReviews: reviews.length
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// ===================== WITHDRAW EARNINGS =====================

// @desc   Request withdrawal
// @route  POST /api/v1/instructor/withdraw
exports.requestWithdrawal = async (req, res, next) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.isApprovedInstructor) {
            return next(new ErrorResponse('You are not an approved instructor', 403));
        }

        if (amount > user.pendingEarnings) {
            return next(new ErrorResponse('Insufficient pending earnings', 400));
        }

        // Create withdrawal record (you may want a separate Withdrawal model)
        user.pendingEarnings -= amount;
        user.withdrawnEarnings += amount;

        // In production, integrate with payment gateway (Stripe, PayPal, etc.)
        // For now, we'll just update the user

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            data: {
                amount,
                previousPending: user.pendingEarnings + amount,
                newPending: user.pendingEarnings,
                totalWithdrawn: user.withdrawnEarnings
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Get withdrawal history
// @route  GET /api/v1/instructor/withdrawals
exports.getWithdrawalHistory = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                totalEarnings: user.totalEarnings,
                pendingEarnings: user.pendingEarnings,
                withdrawnEarnings: user.withdrawnEarnings,
                bankDetails: user.bankDetails || null
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Update bank details for withdrawal
// @route  PUT /api/v1/instructor/bank-details
exports.updateBankDetails = async (req, res, next) => {
    try {
        const { accountNumber, ifscCode, bankName, accountHolderName } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                bankDetails: {
                    accountNumber,
                    ifscCode,
                    bankName,
                    accountHolderName
                }
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Bank details updated successfully',
            data: user.bankDetails
        });
    } catch (error) {
        next(error);
    }
};
