const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Course = require('../models/Course');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const { sendPurchaseConfirmationEmail, sendEnrollmentEmail } = require('../utils/email');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper: enroll user in courses after payment
const enrollUserInCourses = async (order) => {
    const user = await User.findById(order.user);
    for (const item of order.courses) {
        const course = await Course.findById(item.course);
        if (course && !course.studentsEnrolled.includes(order.user)) {
            course.studentsEnrolled.push(order.user);
            course.totalStudents += 1;
            course.totalSales += 1;
            course.totalRevenue += item.finalPrice;
            await course.save();
        }
        if (!user.enrolledCourses.includes(item.course)) {
            user.enrolledCourses.push(item.course);
        }
        // Initialize progress
        await Progress.findOneAndUpdate(
            { user: order.user, course: item.course },
            { user: order.user, course: item.course },
            { upsert: true, new: true }
        );
    }
    await user.save();

    // Send notification
    await Notification.create({
        recipient: order.user,
        type: 'course_enrolled',
        title: 'Enrollment Successful!',
        message: `You have been enrolled in ${order.courses.length} course(s).`,
        link: '/dashboard/my-learning',
    });

    // Send email confirmation
    try {
        await sendPurchaseConfirmationEmail(user, order);
        console.log('[PURCHASE CONFIRMATION] Email sent to:', user.email);
    } catch (err) {
        console.error('[PURCHASE EMAIL ERROR]:', err.message);
    }

    // Send enrollment emails for each course
    try {
        for (const item of order.courses) {
            const course = await Course.findById(item.course).populate('instructor', 'name');
            const courseLink = `${process.env.CLIENT_URL}/learn/${item.course}`;
            await sendEnrollmentEmail(user, course, courseLink);
            console.log('[ENROLLMENT] Email sent to:', user.email, 'for course:', course.title);
        }
    } catch (err) {
        console.error('[ENROLLMENT EMAIL ERROR]:', err.message);
    }
};

// @desc   Create Stripe checkout session
// @route  POST /api/v1/orders/stripe/create-session
exports.createStripeSession = async (req, res, next) => {
    try {
        const { courseIds, couponCode } = req.body;
        const courses = await Course.find({ _id: { $in: courseIds }, isPublished: true });
        if (!courses.length) return next(new ErrorResponse('No valid courses found.', 400));

        let totalAmount = 0;
        let couponDiscount = 0;
        let coupon = null;

        const lineItems = courses.map((course) => {
            totalAmount += course.finalPrice;
            return {
                price_data: {
                    currency: 'usd',
                    product_data: { name: course.title, images: [course.thumbnail].filter(Boolean) },
                    unit_amount: Math.round(course.finalPrice * 100),
                },
                quantity: 1,
            };
        });

        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (coupon && coupon.isValid()) {
                if (!coupon.usedBy.includes(req.user.id)) {
                    couponDiscount = coupon.type === 'percentage'
                        ? (totalAmount * coupon.discount) / 100
                        : coupon.discount;
                    if (coupon.maxDiscount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
                }
            }
        }

        const finalAmount = Math.max(0, totalAmount - couponDiscount);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cart`,
            metadata: {
                userId: req.user.id.toString(),
                courseIds: courseIds.join(','),
                couponCode: couponCode || '',
                couponDiscount: couponDiscount.toString(),
            },
        });

        // Create pending order
        const orderData = {
            user: req.user.id,
            courses: courses.map((c) => ({ course: c._id, price: c.price, discount: c.discount, finalPrice: c.finalPrice })),
            totalAmount,
            couponCode: couponCode || undefined,
            couponDiscount,
            finalAmount,
            paymentMethod: 'stripe',
            stripeSessionId: session.id,
        };

        const order = await Order.create(orderData);

        res.status(200).json({ success: true, sessionId: session.id, sessionUrl: session.url, orderId: order._id });
    } catch (error) {
        next(error);
    }
};

// @desc   Stripe webhook
// @route  POST /api/v1/orders/stripe/webhook
exports.stripeWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const order = await Order.findOne({ stripeSessionId: session.id });
        if (order) {
            order.paymentStatus = 'completed';
            order.status = 'completed';
            order.paymentId = session.payment_intent;
            order.paidAt = Date.now();
            await order.save();
            await enrollUserInCourses(order);
        }
    }
    res.status(200).json({ received: true });
};

// @desc   Create Razorpay order
// @route  POST /api/v1/orders/razorpay/create
exports.createRazorpayOrder = async (req, res, next) => {
    try {
        const { courseIds, couponCode } = req.body;
        const courses = await Course.find({ _id: { $in: courseIds }, isPublished: true });
        if (!courses.length) return next(new ErrorResponse('No valid courses found.', 400));

        let totalAmount = courses.reduce((sum, c) => sum + c.finalPrice, 0);
        let couponDiscount = 0;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (coupon && coupon.isValid() && !coupon.usedBy.includes(req.user.id)) {
                couponDiscount = coupon.type === 'percentage'
                    ? (totalAmount * coupon.discount) / 100
                    : coupon.discount;
                if (coupon.maxDiscount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
            }
        }

        const finalAmount = Math.max(0, totalAmount - couponDiscount);
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(finalAmount * 100),
            currency: 'INR',
            receipt: `order_${Date.now()}`,
        });

        const order = await Order.create({
            user: req.user.id,
            courses: courses.map((c) => ({ course: c._id, price: c.price, discount: c.discount, finalPrice: c.finalPrice })),
            totalAmount,
            couponCode: couponCode || undefined,
            couponDiscount,
            finalAmount,
            currency: 'INR',
            paymentMethod: 'razorpay',
            razorpayOrderId: razorpayOrder.id,
        });

        res.status(200).json({
            success: true,
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Verify Razorpay payment
// @route  POST /api/v1/orders/razorpay/verify
exports.verifyRazorpayPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return next(new ErrorResponse('Invalid payment signature.', 400));
        }

        const order = await Order.findById(orderId);
        if (!order) return next(new ErrorResponse('Order not found.', 404));

        order.paymentStatus = 'completed';
        order.status = 'completed';
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.paidAt = Date.now();
        await order.save();
        await enrollUserInCourses(order);

        res.status(200).json({ success: true, message: 'Payment verified and enrollment complete!', order });
    } catch (error) {
        next(error);
    }
};

// @desc   Get user orders
// @route  GET /api/v1/orders/my-orders
exports.getMyOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ user: req.user.id })
            .populate('courses.course', 'title thumbnail instructor')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments({ user: req.user.id });
        res.status(200).json({ success: true, orders, total, totalPages: Math.ceil(total / limit), currentPage: page });
    } catch (error) {
        next(error);
    }
};

// @desc   Apply coupon
// @route  POST /api/v1/orders/apply-coupon
exports.applyCoupon = async (req, res, next) => {
    try {
        const { code, totalAmount } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) return next(new ErrorResponse('Invalid coupon code.', 400));
        if (!coupon.isValid()) return next(new ErrorResponse('Coupon has expired or reached usage limit.', 400));
        if (coupon.usedBy.includes(req.user.id)) return next(new ErrorResponse('You have already used this coupon.', 400));
        if (totalAmount < coupon.minOrderAmount) {
            return next(new ErrorResponse(`Minimum order amount is $${coupon.minOrderAmount}.`, 400));
        }

        let discount = coupon.type === 'percentage'
            ? (totalAmount * coupon.discount) / 100
            : coupon.discount;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

        res.status(200).json({
            success: true,
            discount,
            finalAmount: Math.max(0, totalAmount - discount),
            coupon: { code: coupon.code, type: coupon.type, value: coupon.discount },
        });
    } catch (error) {
        next(error);
    }
};
