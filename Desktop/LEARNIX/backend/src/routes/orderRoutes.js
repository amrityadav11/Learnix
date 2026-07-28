const express = require('express');
const router = express.Router();
const {
    createStripeSession, stripeWebhook, createRazorpayOrder,
    verifyRazorpayPayment, getMyOrders, applyCoupon,
} = require('../controllers/orderController');
const { protect } = require('../middlewares/auth');

// Stripe webhook (raw body needed - handled in server.js)
router.post('/stripe/webhook', stripeWebhook);

router.use(protect);

router.post('/stripe/create-session', createStripeSession);
router.post('/razorpay/create', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);
router.get('/my-orders', getMyOrders);
router.post('/apply-coupon', applyCoupon);

module.exports = router;
