const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true, maxlength: 500 },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        isApproved: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const blogSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true, lowercase: true },
        excerpt: { type: String, maxlength: 300 },
        content: { type: String, required: true },
        thumbnail: { type: String },
        thumbnailPublicId: { type: String },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        category: { type: String },
        tags: [{ type: String }],
        comments: [commentSchema],
        totalComments: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        totalLikes: { type: Number, default: 0 },
        isPublished: { type: Boolean, default: false },
        publishedAt: { type: Date },
        seoTitle: { type: String },
        seoDescription: { type: String },
        readTime: { type: Number, default: 5 }, // minutes
    },
    { timestamps: true }
);

blogSchema.pre('save', function (next) {
    if (this.isModified('title') || !this.slug) {
        this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    }
    // Estimate read time
    if (this.content) {
        const words = this.content.split(/\s+/).length;
        this.readTime = Math.ceil(words / 200);
    }
    next();
});

blogSchema.index({ isPublished: 1, createdAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
