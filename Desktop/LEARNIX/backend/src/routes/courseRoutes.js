const express = require('express');
const router = express.Router();
const {
    getInstructorCourses, getCourses, getCourse, createCourse, updateCourse, deleteCourse,
    uploadThumbnail, uploadLessonVideo, getFeaturedCourses, publishCourse, duplicateCourse,
    addModule, updateModule, deleteModule, addLesson, updateLesson, deleteLesson, attachQuizToLesson
} = require('../controllers/courseController');
const { getReviews, createReview } = require('../controllers/reviewController');
const { protect, authorize, optionalAuth } = require('../middlewares/auth');
const { uploadThumbnail: uploadThumbnailMiddleware, uploadVideo } = require('../middlewares/upload');

// Instructor courses - must be before /:slug route
router.get('/instructor', protect, authorize('instructor', 'admin'), getInstructorCourses);

router.get('/', optionalAuth, getCourses);
router.get('/featured', getFeaturedCourses);
router.get('/:slug', optionalAuth, getCourse);

router.post('/', protect, authorize('instructor', 'admin'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);
router.put('/:id/thumbnail', protect, authorize('instructor', 'admin'), uploadThumbnailMiddleware, uploadThumbnail);
router.put('/:id/publish', protect, authorize('instructor', 'admin'), publishCourse);
router.post('/:id/duplicate', protect, authorize('instructor', 'admin'), duplicateCourse);

// Module management
router.post('/:id/modules', protect, authorize('instructor', 'admin'), addModule);
router.put('/:id/modules/:moduleId', protect, authorize('instructor', 'admin'), updateModule);
router.delete('/:id/modules/:moduleId', protect, authorize('instructor', 'admin'), deleteModule);

// Lesson management
router.post('/:id/modules/:moduleId/lessons', protect, authorize('instructor', 'admin'), addLesson);
router.put('/:id/modules/:moduleId/lessons/:lessonId', protect, authorize('instructor', 'admin'), updateLesson);
router.delete('/:id/modules/:moduleId/lessons/:lessonId', protect, authorize('instructor', 'admin'), deleteLesson);
router.put('/:id/modules/:moduleId/lessons/:lessonId/quiz', protect, authorize('instructor', 'admin'), attachQuizToLesson);

router.post('/:courseId/modules/:moduleId/lessons/:lessonId/video',
    protect, authorize('instructor', 'admin'), uploadVideo, uploadLessonVideo);

// Reviews
router.get('/:courseId/reviews', getReviews);
router.post('/:courseId/reviews', protect, createReview);

module.exports = router;
