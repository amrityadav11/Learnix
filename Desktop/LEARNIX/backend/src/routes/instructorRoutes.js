const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { uploadVideo } = require('../middlewares/upload');
const {
    // Dashboard
    getDashboardOverview,
    // Videos
    uploadLessonVideo,
    deleteLessonVideo,
    // Assignments
    getInstructorAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    gradeSubmission,
    // Quizzes
    getInstructorQuizzes,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    addQuizQuestion,
    // Reviews
    getInstructorReviews,
    updateReviewStatus,
    // Analytics
    getCourseAnalytics,
    getInstructorAnalytics,
    // Withdrawals
    requestWithdrawal,
    getWithdrawalHistory,
    updateBankDetails
} = require('../controllers/instructorController');

// Protect all routes - must be authenticated and have instructor or admin role
router.use(protect, authorize('instructor', 'admin'));

// Dashboard
router.get('/overview', getDashboardOverview);

// Videos
router.post('/courses/:courseId/modules/:moduleId/lessons/:lessonId/video', uploadVideo, uploadLessonVideo);
router.delete('/courses/:courseId/modules/:moduleId/lessons/:lessonId/video', deleteLessonVideo);

// Assignments
router.get('/assignments', getInstructorAssignments);
router.post('/assignments', createAssignment);
router.put('/assignments/:id', updateAssignment);
router.delete('/assignments/:id', deleteAssignment);
router.post('/assignments/:id/submissions/:submissionId/grade', gradeSubmission);

// Quizzes
router.get('/quizzes', getInstructorQuizzes);
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);
router.post('/quizzes/:id/questions', addQuizQuestion);

// Reviews
router.get('/reviews', getInstructorReviews);
router.put('/reviews/:id', updateReviewStatus);

// Analytics
router.get('/analytics', getInstructorAnalytics);
router.get('/analytics/:courseId', getCourseAnalytics);

// Withdrawals
router.post('/withdraw', requestWithdrawal);
router.get('/withdrawals', getWithdrawalHistory);
router.put('/bank-details', updateBankDetails);

module.exports = router;
