const express = require('express');
const router = express.Router();
const {
    getCourses, getCourse, createCourse, updateCourse, deleteCourse,
    uploadThumbnail, uploadLessonVideo, getFeaturedCourses, publishCourse, duplicateCourse,
} = require('../controllers/courseController');
const { getReviews, createReview } = require('../controllers/reviewController');
const { protect, authorize, optionalAuth } = require('../middlewares/auth');
const { uploadThumbnail: uploadThumbnailMiddleware, uploadVideo } = require('../middlewares/upload');

router.get('/', optionalAuth, getCourses);
router.get('/featured', getFeaturedCourses);
router.get('/:slug', optionalAuth, getCourse);

router.post('/', protect, authorize('instructor', 'admin'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);
router.put('/:id/thumbnail', protect, authorize('instructor', 'admin'), uploadThumbnailMiddleware, uploadThumbnail);
router.put('/:id/publish', protect, authorize('instructor', 'admin'), publishCourse);
router.post('/:id/duplicate', protect, authorize('instructor', 'admin'), duplicateCourse);

router.post('/:courseId/modules/:moduleId/lessons/:lessonId/video',
    protect, authorize('instructor', 'admin'), uploadVideo, uploadLessonVideo);

// Reviews
router.get('/:courseId/reviews', getReviews);
router.post('/:courseId/reviews', protect, createReview);

module.exports = router;
