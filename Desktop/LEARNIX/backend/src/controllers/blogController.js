const Blog = require('../models/Blog');
const ErrorResponse = require('../utils/errorResponse');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc   Get all published blogs
// @route  GET /api/v1/blogs
exports.getBlogs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = { isPublished: true };
        if (req.query.category) query.category = req.query.category;
        if (req.query.tag) query.tags = req.query.tag;
        if (req.query.search) query.$or = [
            { title: new RegExp(req.query.search, 'i') },
            { excerpt: new RegExp(req.query.search, 'i') },
        ];

        const blogs = await Blog.find(query)
            .populate('author', 'name avatar')
            .sort('-publishedAt')
            .skip(skip)
            .limit(limit)
            .select('-content');

        const total = await Blog.countDocuments(query);
        res.status(200).json({ success: true, blogs, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        next(error);
    }
};

// @desc   Get single blog
// @route  GET /api/v1/blogs/:slug
exports.getBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true })
            .populate('author', 'name avatar bio')
            .populate('comments.user', 'name avatar');

        if (!blog) return next(new ErrorResponse('Blog not found.', 404));
        blog.views += 1;
        await blog.save({ validateBeforeSave: false });

        res.status(200).json({ success: true, blog });
    } catch (error) {
        next(error);
    }
};

// @desc   Create blog (admin)
// @route  POST /api/v1/blogs
exports.createBlog = async (req, res, next) => {
    try {
        req.body.author = req.user.id;
        if (req.body.isPublished) req.body.publishedAt = new Date();
        const blog = await Blog.create(req.body);
        res.status(201).json({ success: true, blog });
    } catch (error) {
        next(error);
    }
};

// @desc   Update blog (admin)
// @route  PUT /api/v1/blogs/:id
exports.updateBlog = async (req, res, next) => {
    try {
        if (req.body.isPublished) req.body.publishedAt = new Date();
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!blog) return next(new ErrorResponse('Blog not found.', 404));
        res.status(200).json({ success: true, blog });
    } catch (error) {
        next(error);
    }
};

// @desc   Delete blog (admin)
// @route  DELETE /api/v1/blogs/:id
exports.deleteBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return next(new ErrorResponse('Blog not found.', 404));
        if (blog.thumbnailPublicId) await deleteFromCloudinary(blog.thumbnailPublicId);
        res.status(200).json({ success: true, message: 'Blog deleted.' });
    } catch (error) {
        next(error);
    }
};

// @desc   Add comment
// @route  POST /api/v1/blogs/:id/comments
exports.addComment = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return next(new ErrorResponse('Blog not found.', 404));
        blog.comments.push({ user: req.user.id, content: req.body.content });
        blog.totalComments += 1;
        await blog.save();
        await blog.populate('comments.user', 'name avatar');
        res.status(201).json({ success: true, comments: blog.comments });
    } catch (error) {
        next(error);
    }
};

// @desc   Like/unlike blog
// @route  PUT /api/v1/blogs/:id/like
exports.likeBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return next(new ErrorResponse('Blog not found.', 404));
        const idx = blog.likes.indexOf(req.user.id);
        if (idx === -1) {
            blog.likes.push(req.user.id);
            blog.totalLikes += 1;
        } else {
            blog.likes.splice(idx, 1);
            blog.totalLikes = Math.max(0, blog.totalLikes - 1);
        }
        await blog.save();
        res.status(200).json({ success: true, totalLikes: blog.totalLikes });
    } catch (error) {
        next(error);
    }
};
