const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const certificateSchema = new mongoose.Schema(
    {
        certificateId: { type: String, unique: true, default: () => `CERT-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}` },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        studentName: { type: String, required: true },
        courseName: { type: String, required: true },
        instructorName: { type: String, required: true },
        completionDate: { type: Date, default: Date.now },
        grade: { type: String, default: 'Pass' },
        pdfUrl: { type: String },
        qrCode: { type: String },
        isValid: { type: Boolean, default: true },
        revokedReason: { type: String },
    },
    { timestamps: true }
);

certificateSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
