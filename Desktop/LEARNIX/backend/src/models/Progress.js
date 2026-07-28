const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
        currentLesson: { type: mongoose.Schema.Types.ObjectId },
        currentModule: { type: mongoose.Schema.Types.ObjectId },
        lastWatchPosition: { type: Number, default: 0 }, // seconds
        totalProgress: { type: Number, default: 0 }, // percentage
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date },
        certificateIssued: { type: Boolean, default: false },
        certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
        notes: [
            {
                lesson: mongoose.Schema.Types.ObjectId,
                content: String,
                timestamp: Number,
                createdAt: { type: Date, default: Date.now },
            },
        ],
        bookmarks: [
            {
                lesson: mongoose.Schema.Types.ObjectId,
                timestamp: Number,
                note: String,
                createdAt: { type: Date, default: Date.now },
            },
        ],
        quizResults: [
            {
                quiz: mongoose.Schema.Types.ObjectId,
                score: Number,
                passed: Boolean,
                completedAt: Date,
            },
        ],
        watchTime: { type: Number, default: 0 }, // total seconds watched
        lastAccessedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

progressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
