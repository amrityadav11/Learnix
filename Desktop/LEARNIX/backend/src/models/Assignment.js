const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submittedAt: { type: Date, default: Date.now },
    fileUrl: { type: String },
    filePublicId: { type: String },
    content: { type: String },
    score: { type: Number },
    feedback: { type: String },
    isGraded: { type: Boolean, default: false },
    gradedAt: { type: Date },
}, { timestamps: true });

const assignmentSchema = new mongoose.Schema(
    {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        title: { type: String, required: true },
        description: { type: String },
        instructions: { type: String },
        dueDate: { type: Date },
        maxScore: { type: Number, default: 100 },
        attachments: [
            {
                title: String,
                url: String,
                publicId: String,
            }
        ],
        submissions: [submissionSchema],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
