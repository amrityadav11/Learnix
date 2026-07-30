const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    type: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'], default: 'multiple-choice' },
    options: [{ type: String }],
    correctAnswer: { type: String },
    points: { type: Number, default: 1 },
}, { timestamps: true });

const quizSchema = new mongoose.Schema(
    {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        title: { type: String, required: true },
        description: { type: String },
        timeLimit: { type: Number, default: 60 }, // in minutes
        passingScore: { type: Number, default: 60 }, // percentage
        questions: [questionSchema],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        attempts: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                score: { type: Number },
                percentage: { type: Number },
                passed: { type: Boolean },
                answers: [{ type: String }],
                startedAt: { type: Date },
                completedAt: { type: Date },
            }
        ],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
