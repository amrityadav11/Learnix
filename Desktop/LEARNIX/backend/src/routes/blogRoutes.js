const express = require('express');
const router = express.Router();
const {
    getBlogs, getBlog, createBlog, updateBlog, deleteBlog, addComment, likeBlog,
} = require('../controllers/blogController');
const { protect, authorize, optionalAuth } = require('../middlewares/auth');

router.get('/', getBlogs);
router.get('/:slug', optionalAuth, getBlog);

router.post('/', protect, authorize('admin'), createBlog);
router.put('/:id', protect, authorize('admin'), updateBlog);
router.delete('/:id', protect, authorize('admin'), deleteBlog);
router.post('/:id/comments', protect, addComment);
router.put('/:id/like', protect, likeBlog);

module.exports = router;
