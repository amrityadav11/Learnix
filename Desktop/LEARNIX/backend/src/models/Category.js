const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String },
        icon: { type: String, default: '📚' },
        image: { type: String },
        color: { type: String, default: '#6366f1' },
        parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
        subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        totalCourses: { type: Number, default: 0 },
    },
    { timestamps: true }
);

categorySchema.index({ parent: 1 });

module.exports = mongoose.model('Category', categorySchema);
