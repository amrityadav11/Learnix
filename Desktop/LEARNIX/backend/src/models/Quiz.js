const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'true_false', 'coding'], default: 'mcq' },
    options: [{ text: String, isCorrect: Boolean }],
    correctAnswer: { type: String },
    explanation: { type: String },
    points: { type: Number, default: 1 },
    codeTemplate: { type: String },
    testCases: [{ input: String, expectedOutput: String }],
});

const quizSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        lesson: { type: mongoose.Schema.Types.ObjectId },
        questions: [questionSchema],
        passingScore: { type: Number, default: 70 },
        timeLimit: { type: Number, default: 0 }, // in minutes, 0 = no limit
        shuffleQuestions: { type: Boolean, default: false },
        shuffleOptions: { type: Boolean, default: false },
        maxAttempts: { type: Number, default: 3 },
        showResults: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
        results: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                score: Number,
                totalPoints: Number,
                percentage: Number,
                passed: Boolean,
                answers: [{ questionId: mongoose.Schema.Types.ObjectId, selectedAnswer: String, isCorrect: Boolean }],
                timeTaken: Number,
                attemptNumber: { type: Number, default: 1 },
                completedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
