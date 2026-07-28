const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String },
        fileUrl: { type: String },
        grade: { type: Number, min: 0, max: 100 },
        feedback: { type: String },
        status: { type: String, enum: ['pending', 'submitted', 'graded', 'returned'], default: 'pending' },
        submittedAt: { type: Date },
        gradedAt: { type: Date },
    },
    { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        lesson: { type: mongoose.Schema.Types.ObjectId },
        instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        dueDate: { type: Date },
        maxPoints: { type: Number, default: 100 },
        instructions: { type: String },
        attachments: [{ name: String, url: String }],
        submissions: [submissionSchema],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
