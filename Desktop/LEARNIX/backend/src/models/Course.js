const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['video', 'pdf', 'quiz', 'assignment', 'text', 'zip', 'link', 'coding'], default: 'video' },
    videoUrl: { type: String },
    videoPublicId: { type: String },
    duration: { type: Number, default: 0 }, // in seconds
    pdfUrl: { type: String },
    pdfPublicId: { type: String },
    content: { type: String },
    externalLink: { type: String },
    resources: [{ title: String, url: String, type: String }],
    isPreview: { type: Boolean, default: false },
    isFree: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    subtitles: [{ language: String, url: String }],
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    notes: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, content: String, timestamp: Number }],
}, { timestamps: true });

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    lessons: [lessonSchema],
    duration: { type: Number, default: 0 },
}, { timestamps: true });

const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, trim: true },
        description: { type: String, required: true },
        slug: { type: String, unique: true, lowercase: true },
        thumbnail: { type: String },
        thumbnailPublicId: { type: String },
        previewVideo: { type: String },
        previewVideoPublicId: { type: String },
        trailer: { type: String },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        price: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0, min: 0, max: 100 },
        finalPrice: { type: Number },
        currency: { type: String, default: 'USD' },
        isFree: { type: Boolean, default: false },
        language: { type: String, default: 'English' },
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'All Levels' },
        duration: { type: Number, default: 0 }, // total in seconds
        totalLessons: { type: Number, default: 0 },
        totalModules: { type: Number, default: 0 },
        certificate: { type: Boolean, default: true },
        requirements: [{ type: String }],
        whatYouLearn: [{ type: String }],
        tags: [{ type: String }],
        modules: [moduleSchema],
        studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        totalStudents: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
        totalRatings: { type: Number, default: 0 },
        status: { type: String, enum: ['draft', 'pending', 'published', 'unpublished', 'rejected'], default: 'draft' },
        isPublished: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
        isTrending: { type: Boolean, default: false },
        isApproved: { type: Boolean, default: false },
        approvedAt: { type: Date },
        publishedAt: { type: Date },
        views: { type: Number, default: 0 },
        lastUpdated: { type: Date },
        seoTitle: { type: String },
        seoDescription: { type: String },
        totalSales: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Calculate final price before saving
courseSchema.pre('save', function (next) {
    if (this.isFree) {
        this.finalPrice = 0;
    } else {
        this.finalPrice = this.price - (this.price * this.discount) / 100;
    }
    // Generate slug
    if (this.isModified('title') || !this.slug) {
        this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    }
    next();
});

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ instructor: 1 });

module.exports = mongoose.model('Course', courseSchema);
