const Course = require('../models/Course');
const Category = require('../models/Category');
const Progress = require('../models/Progress');
const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const APIFeatures = require('../utils/apiFeatures');
const { uploadToCloudinary, deleteFromCloudinary, uploadVideoToCloudinary } = require('../config/cloudinary');
const fs = require('fs');

// @desc   Get all courses
// @route  GET /api/v1/courses
exports.getCourses = async (req, res, next) => {
    try {
        let query = Course.find({ status: 'published', isPublished: true })
            .populate('instructor', 'name avatar headline')
            .populate('category', 'name slug');

        // Search
        if (req.query.search) {
            query = query.find({ $text: { $search: req.query.search } });
        }

        // Filters
        if (req.query.category) query = query.find({ category: req.query.category });
        if (req.query.level) query = query.find({ level: req.query.level });
        if (req.query.language) query = query.find({ language: req.query.language });
        if (req.query.free === 'true') query = query.find({ isFree: true });
        if (req.query.rating) query = query.find({ averageRating: { $gte: parseFloat(req.query.rating) } });
        if (req.query.minPrice) query = query.find({ finalPrice: { $gte: parseFloat(req.query.minPrice) } });
        if (req.query.maxPrice) query = query.find({ finalPrice: { $lte: parseFloat(req.query.maxPrice) } });
        if (req.query.duration) {
            const [min, max] = req.query.duration.split('-').map(Number);
            if (max) query = query.find({ duration: { $gte: min * 3600, $lte: max * 3600 } });
            else query = query.find({ duration: { $gte: min * 3600 } });
        }

        // Sort
        const sortMap = {
            newest: '-createdAt',
            popular: '-totalStudents',
            rating: '-averageRating',
            price_low: 'finalPrice',
            price_high: '-finalPrice',
        };
        const sortBy = sortMap[req.query.sort] || '-createdAt';
        query = query.sort(sortBy);

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const total = await Course.countDocuments({ status: 'published', isPublished: true });

        query = query.skip(skip).limit(limit);
        const courses = await query;

        res.status(200).json({
            success: true,
            count: courses.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            courses,
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Get single course
// @route  GET /api/v1/courses/:slug
exports.getCourse = async (req, res, next) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug })
            .populate('instructor', 'name avatar headline bio totalStudents totalEarnings')
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug');

        if (!course) return next(new ErrorResponse('Course not found.', 404));

        // Increment views
        course.views += 1;
        await course.save({ validateBeforeSave: false });

        // Check if enrolled
        let isEnrolled = false;
        let progress = null;
        if (req.user) {
            isEnrolled = course.studentsEnrolled.includes(req.user.id);
            if (isEnrolled) {
                progress = await Progress.findOne({ user: req.user.id, course: course._id });
            }
        }

        // Get reviews
        const reviews = await Review.find({ course: course._id, isApproved: true })
            .populate('user', 'name avatar')
            .sort('-createdAt')
            .limit(10);

        res.status(200).json({ success: true, course, isEnrolled, progress, reviews });
    } catch (error) {
        next(error);
    }
};

// @desc   Create course
// @route  POST /api/v1/courses
exports.createCourse = async (req, res, next) => {
    try {
        // Admin can create course; instructors must be approved
        if (req.user.role === 'instructor' && !req.user.isApprovedInstructor) {
            return next(new ErrorResponse('Your instructor account is not yet approved.', 403));
        }
        req.body.instructor = req.body.instructor || req.user.id;

        // Auto-publish if admin creates it
        if (req.user.role === 'admin') {
            req.body.status = 'published';
            req.body.isPublished = true;
            req.body.isApproved = true;
            req.body.publishedAt = Date.now();
            req.body.approvedAt = Date.now();
        } else {
            // Instructors create in draft
            req.body.status = 'draft';
            req.body.isPublished = false;
        }

        const course = await Course.create(req.body);
        res.status(201).json({ success: true, message: 'Course created.', course });
    } catch (error) {
        next(error);
    }
};

// @desc   Update course
// @route  PUT /api/v1/courses/:id
exports.updateCourse = async (req, res, next) => {
    try {
        let course = await Course.findById(req.params.id);
        if (!course) return next(new ErrorResponse('Course not found.', 404));

        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized to update this course.', 403));
        }

        course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, message: 'Course updated.', course });
    } catch (error) {
        next(error);
    }
};

// @desc   Delete course
// @route  DELETE /api/v1/courses/:id
exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return next(new ErrorResponse('Course not found.', 404));

        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized.', 403));
        }

        if (course.thumbnailPublicId) await deleteFromCloudinary(course.thumbnailPublicId);
        if (course.previewVideoPublicId) await deleteFromCloudinary(course.previewVideoPublicId, 'video');

        await Course.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Course deleted.' });
    } catch (error) {
        next(error);
    }
};

// @desc   Upload course thumbnail
// @route  PUT /api/v1/courses/:id/thumbnail
exports.uploadThumbnail = async (req, res, next) => {
    try {
        if (!req.file) return next(new ErrorResponse('Please upload an image.', 400));
        const course = await Course.findById(req.params.id);
        if (!course) return next(new ErrorResponse('Course not found.', 404));

        if (course.thumbnailPublicId) await deleteFromCloudinary(course.thumbnailPublicId);

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const { url, publicId } = await uploadToCloudinary(dataURI, 'learnix/thumbnails');

        course.thumbnail = url;
        course.thumbnailPublicId = publicId;
        await course.save();

        res.status(200).json({ success: true, thumbnail: url });
    } catch (error) {
        next(error);
    }
};

// @desc   Upload lesson video
// @route  POST /api/v1/courses/:courseId/modules/:moduleId/lessons/:lessonId/video
exports.uploadLessonVideo = async (req, res, next) => {
    try {
        if (!req.file) return next(new ErrorResponse('Please upload a video.', 400));
        const course = await Course.findById(req.params.courseId);
        if (!course) return next(new ErrorResponse('Course not found.', 404));

        const module = course.modules.id(req.params.moduleId);
        if (!module) return next(new ErrorResponse('Module not found.', 404));

        const lesson = module.lessons.id(req.params.lessonId);
        if (!lesson) return next(new ErrorResponse('Lesson not found.', 404));

        // Delete old video
        if (lesson.videoPublicId) await deleteFromCloudinary(lesson.videoPublicId, 'video');

        const { url, publicId } = await uploadVideoToCloudinary(req.file.path);

        // Clean up temp file
        fs.unlink(req.file.path, () => { });

        lesson.videoUrl = url;
        lesson.videoPublicId = publicId;
        await course.save();

        res.status(200).json({ success: true, videoUrl: url });
    } catch (error) {
        if (req.file?.path) fs.unlink(req.file.path, () => { });
        next(error);
    }
};

// @desc   Get featured/trending courses
// @route  GET /api/v1/courses/featured
exports.getFeaturedCourses = async (req, res, next) => {
    try {
        const featured = await Course.find({ isFeatured: true, isPublished: true })
            .populate('instructor', 'name avatar')
            .populate('category', 'name')
            .limit(8);

        const trending = await Course.find({ isTrending: true, isPublished: true })
            .populate('instructor', 'name avatar')
            .populate('category', 'name')
            .limit(8);

        res.status(200).json({ success: true, featured, trending });
    } catch (error) {
        next(error);
    }
};

// @desc   Publish/unpublish course (instructor/admin)
// @route  PUT /api/v1/courses/:id/publish
exports.publishCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return next(new ErrorResponse('Course not found.', 404));

        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized.', 403));
        }

        course.status = req.body.publish ? 'pending' : 'unpublished';
        if (req.user.role === 'admin' && req.body.publish) {
            course.status = 'published';
            course.isPublished = true;
            course.isApproved = true;
            course.approvedAt = Date.now();
            course.publishedAt = Date.now();
        }
        await course.save();

        res.status(200).json({ success: true, message: `Course ${req.body.publish ? 'submitted for review' : 'unpublished'}.`, course });
    } catch (error) {
        next(error);
    }
};

// @desc   Duplicate course
// @route  POST /api/v1/courses/:id/duplicate
exports.duplicateCourse = async (req, res, next) => {
    try {
        const original = await Course.findById(req.params.id);
        if (!original) return next(new ErrorResponse('Course not found.', 404));

        const courseData = original.toObject();
        delete courseData._id;
        delete courseData.slug;
        delete courseData.studentsEnrolled;
        delete courseData.totalStudents;
        delete courseData.averageRating;
        delete courseData.totalReviews;
        courseData.title = `${courseData.title} (Copy)`;
        courseData.status = 'draft';
        courseData.isPublished = false;
        courseData.isApproved = false;

        const newCourse = await Course.create(courseData);
        res.status(201).json({ success: true, course: newCourse });
    } catch (error) {
        next(error);
    }
};
