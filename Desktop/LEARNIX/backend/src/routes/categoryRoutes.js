const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const { protect, authorize } = require('../middlewares/auth');

// @desc   Get all categories
router.get('/', async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true, parent: null })
            .populate('subcategories')
            .sort('order name');
        res.status(200).json({ success: true, categories });
    } catch (error) {
        next(error);
    }
});

// @desc   Create category (admin only)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { name, icon, color, slug } = req.body;
        if (!name) return next(new ErrorResponse('Category name is required.', 400));

        const category = await Category.create({
            name,
            icon: icon || '📚',
            color: color || '#6366f1',
            slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
            isActive: true,
        });

        res.status(201).json({ success: true, message: 'Category created.', category });
    } catch (error) {
        next(error);
    }
});

// @desc   Get single category with courses
router.get('/:slug', async (req, res, next) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug }).populate('subcategories');
        if (!category) return next(new ErrorResponse('Category not found.', 404));

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const courses = await Course.find({ category: category._id, status: 'published', isPublished: true })
            .populate('instructor', 'name avatar')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        const total = await Course.countDocuments({ category: category._id, status: 'published', isPublished: true });
        res.status(200).json({ success: true, category, courses, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        next(error);
    }
});

// Admin: update category
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!category) return next(new ErrorResponse('Category not found.', 404));
        res.status(200).json({ success: true, category });
    } catch (error) {
        next(error);
    }
});

// Admin: delete category
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Category deleted.' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
