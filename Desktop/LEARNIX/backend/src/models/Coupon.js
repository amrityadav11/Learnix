const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        description: { type: String },
        type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
        discount: { type: Number, required: true },
        maxDiscount: { type: Number },
        minOrderAmount: { type: Number, default: 0 },
        maxUsage: { type: Number, default: 100 },
        usedCount: { type: Number, default: 0 },
        usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        validFrom: { type: Date, default: Date.now },
        validUntil: { type: Date, required: true },
        applicableCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
        applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

couponSchema.methods.isValid = function () {
    const now = new Date();
    return (
        this.isActive &&
        this.usedCount < this.maxUsage &&
        now >= this.validFrom &&
        now <= this.validUntil
    );
};

module.exports = mongoose.model('Coupon', couponSchema);
