const express = require('express');
const router = express.Router();
const { updateReview, deleteReview, likeReview, reportReview } = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.put('/:id/like', likeReview);
router.put('/:id/report', reportReview);

module.exports = router;
