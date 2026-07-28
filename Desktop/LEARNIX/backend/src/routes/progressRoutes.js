const express = require('express');
const router = express.Router();
const {
    getCourseProgress, markLessonComplete, updateWatchPosition,
    addNote, addBookmark, getMyLearning,
} = require('../controllers/progressController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/my-learning', getMyLearning);
router.get('/:courseId', getCourseProgress);
router.post('/:courseId/complete-lesson', markLessonComplete);
router.put('/:courseId/watch-position', updateWatchPosition);
router.post('/:courseId/notes', addNote);
router.post('/:courseId/bookmarks', addBookmark);

module.exports = router;
