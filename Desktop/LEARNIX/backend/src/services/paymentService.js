const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Stripe checkout session
 */
const createStripeSession = async ({ courseIds, couponCode, userId, successUrl, cancelUrl }) => {
    const lineItems = courseIds.map(courseId => ({
        price_data: {
            currency: 'usd',
            product_data: { name: `Course: ${courseId}` },
            unit_amount: Math.round(1000 * 100), // $1000 example
        },
        quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: 'customer@example.com',
        metadata: { userId, couponCode },
    });

    return session;
};

/**
 * Verify Stripe webhook signature
 */
const verifyStripeWebhook = (payload, signature) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    return stripe.webhooks.constructEvent(payload, signature, secret);
};

/**
 * Create Razorpay order
 */
const createRazorpayOrder = async ({ amount, currency = 'INR', receipt }) => {
    const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency,
        receipt,
    });
    return order;
};

/**
 * Verify Razorpay payment signature
 */
const verifyRazorpayPayment = (orderId, paymentId, signature) => {
    const hmac = require('crypto').createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');
    return generatedSignature === signature;
};

/**
 * Process refund
 */
const processRefund = async (paymentId, amount = null) => {
    const refund = await stripe.refunds.create({
        payment_intent: paymentId,
        amount: amount || undefined,
    });
    return refund;
};

module.exports = {
    createStripeSession,
    verifyStripeWebhook,
    createRazorpayOrder,
    verifyRazorpayPayment,
    processRefund,
};
