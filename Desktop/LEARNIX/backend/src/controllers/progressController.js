const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const { generateCertificate } = require('../utils/certificate');

// @desc   Get progress for a course
// @route  GET /api/v1/progress/:courseId
exports.getCourseProgress = async (req, res, next) => {
    try {
        const progress = await Progress.findOne({
            user: req.user.id,
            course: req.params.courseId,
        });
        if (!progress) return next(new ErrorResponse('Progress not found. Are you enrolled?', 404));
        res.status(200).json({ success: true, progress });
    } catch (error) {
        next(error);
    }
};

// @desc   Mark lesson complete
// @route  POST /api/v1/progress/:courseId/complete-lesson
exports.markLessonComplete = async (req, res, next) => {
    try {
        const { lessonId, watchPosition, moduleId } = req.body;
        const course = await Course.findById(req.params.courseId);
        if (!course) return next(new ErrorResponse('Course not found.', 404));

        let progress = await Progress.findOne({ user: req.user.id, course: req.params.courseId });
        if (!progress) return next(new ErrorResponse('Not enrolled in this course.', 403));

        if (!progress.completedLessons.includes(lessonId)) {
            progress.completedLessons.push(lessonId);
        }

        progress.currentLesson = lessonId;
        if (moduleId) progress.currentModule = moduleId;
        if (watchPosition !== undefined) progress.lastWatchPosition = watchPosition;
        progress.lastAccessedAt = Date.now();

        // Calculate total progress
        const totalLessons = course.totalLessons || 1;
        progress.totalProgress = Math.round((progress.completedLessons.length / totalLessons) * 100);

        // Check course completion
        if (progress.totalProgress >= 100 && !progress.isCompleted) {
            progress.isCompleted = true;
            progress.completedAt = Date.now();

            // Generate certificate
            if (course.certificate && !progress.certificateIssued) {
                const instructor = await User.findById(course.instructor);
                const student = await User.findById(req.user.id);
                const certData = await generateCertificate({
                    studentName: student.name,
                    courseName: course.title,
                    instructorName: instructor?.name || 'Instructor',
                    courseId: course._id,
                    userId: req.user.id,
                    instructorId: course.instructor,
                });
                const cert = await Certificate.create(certData);
                progress.certificateIssued = true;
                progress.certificateId = cert._id;

                // Update student
                await User.findByIdAndUpdate(req.user.id, {
                    $addToSet: { completedCourses: req.params.courseId },
                    $inc: { points: 100 },
                });

                await Notification.create({
                    recipient: req.user.id,
                    type: 'certificate_issued',
                    title: '🎉 Certificate Earned!',
                    message: `Congratulations! You've completed "${course.title}" and earned a certificate.`,
                    link: '/dashboard/certificates',
                });
            }
        }

        await progress.save();
        res.status(200).json({ success: true, progress });
    } catch (error) {
        next(error);
    }
};

// @desc   Update watch position
// @route  PUT /api/v1/progress/:courseId/watch-position
exports.updateWatchPosition = async (req, res, next) => {
    try {
        const { lessonId, position, watchTime } = req.body;
        const progress = await Progress.findOneAndUpdate(
            { user: req.user.id, course: req.params.courseId },
            {
                currentLesson: lessonId,
                lastWatchPosition: position,
                lastAccessedAt: Date.now(),
                $inc: { watchTime: watchTime || 0 },
            },
            { new: true }
        );
        if (!progress) return next(new ErrorResponse('Progress not found.', 404));
        res.status(200).json({ success: true, progress });
    } catch (error) {
        next(error);
    }
};

// @desc   Add note to lesson
// @route  POST /api/v1/progress/:courseId/notes
exports.addNote = async (req, res, next) => {
    try {
        const { lessonId, content, timestamp } = req.body;
        const progress = await Progress.findOne({ user: req.user.id, course: req.params.courseId });
        if (!progress) return next(new ErrorResponse('Progress not found.', 404));

        progress.notes.push({ lesson: lessonId, content, timestamp: timestamp || 0 });
        await progress.save();
        res.status(201).json({ success: true, notes: progress.notes });
    } catch (error) {
        next(error);
    }
};

// @desc   Add bookmark
// @route  POST /api/v1/progress/:courseId/bookmarks
exports.addBookmark = async (req, res, next) => {
    try {
        const { lessonId, timestamp, note } = req.body;
        const progress = await Progress.findOne({ user: req.user.id, course: req.params.courseId });
        if (!progress) return next(new ErrorResponse('Progress not found.', 404));

        progress.bookmarks.push({ lesson: lessonId, timestamp, note: note || '' });
        await progress.save();
        res.status(201).json({ success: true, bookmarks: progress.bookmarks });
    } catch (error) {
        next(error);
    }
};

// @desc   Get all enrolled courses with progress (my learning)
// @route  GET /api/v1/progress/my-learning
exports.getMyLearning = async (req, res, next) => {
    try {
        const progresses = await Progress.find({ user: req.user.id })
            .populate({
                path: 'course',
                select: 'title thumbnail instructor category duration totalLessons averageRating',
                populate: [
                    { path: 'instructor', select: 'name avatar' },
                    { path: 'category', select: 'name' },
                ],
            })
            .sort('-lastAccessedAt');

        res.status(200).json({ success: true, progresses });
    } catch (error) {
        next(error);
    }
};
