const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        courses: [
            {
                course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
                price: { type: Number, required: true },
                discount: { type: Number, default: 0 },
                finalPrice: { type: Number, required: true },
            },
        ],
        totalAmount: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        couponCode: { type: String },
        couponDiscount: { type: Number, default: 0 },
        finalAmount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        paymentMethod: { type: String, enum: ['stripe', 'razorpay', 'free'], required: true },
        paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
        paymentId: { type: String },
        paymentOrderId: { type: String },
        paymentSignature: { type: String },
        stripeSessionId: { type: String },
        stripePaymentIntentId: { type: String },
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String },
        invoiceNumber: { type: String, unique: true },
        invoiceUrl: { type: String },
        status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'], default: 'pending' },
        refundReason: { type: String },
        refundedAt: { type: Date },
        paidAt: { type: Date },
        billingAddress: {
            name: String,
            email: String,
            phone: String,
            address: String,
            city: String,
            state: String,
            country: String,
            zipCode: String,
        },
    },
    { timestamps: true }
);

// Generate invoice number
orderSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const count = await mongoose.model('Order').countDocuments();
        this.invoiceNumber = `INV-${Date.now()}-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
