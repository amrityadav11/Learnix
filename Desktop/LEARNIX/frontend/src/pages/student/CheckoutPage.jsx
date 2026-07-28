import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Shield, Lock, CheckCircle, Tag, X, Loader2, IndianRupee } from 'lucide-react';
import { applyCoupon, removeCoupon, clearCart } from '../../redux/slices/cartSlice';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { items, coupon, couponDiscount } = useSelector((s) => s.cart);
    const { user } = useSelector((s) => s.auth);

    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const subtotal = items.reduce((sum, item) => sum + (item.finalPrice || item.price || 0), 0);
    const discount = couponDiscount || 0;
    const finalAmount = Math.max(0, subtotal - discount);

    // Load Razorpay script
    const loadRazorpay = () => new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return toast.error('Enter a coupon code');
        setCouponLoading(true);
        try {
            const { data } = await api.post('/orders/apply-coupon', {
                code: couponCode.trim().toUpperCase(),
                totalAmount: subtotal,
            });
            dispatch(applyCoupon({ coupon: data.coupon, discount: data.discount }));
            toast.success(`Coupon applied! You saved $${data.discount.toFixed(2)}`);
            setCouponCode('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid coupon');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        dispatch(removeCoupon());
        toast.success('Coupon removed');
    };

    const handleStripeCheckout = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/orders/stripe/create-session', {
                courseIds: items.map(i => i._id),
                couponCode: coupon?.code,
            });
            window.location.href = data.sessionUrl;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Stripe checkout failed');
            setLoading(false);
        }
    };

    const handleRazorpayCheckout = async () => {
        setLoading(true);
        try {
            const loaded = await loadRazorpay();
            if (!loaded) {
                toast.error('Razorpay failed to load. Check your connection.');
                setLoading(false);
                return;
            }

            const { data } = await api.post('/orders/razorpay/create', {
                courseIds: items.map(i => i._id),
                couponCode: coupon?.code,
            });

            const options = {
                key: data.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: 'LEARNIX',
                description: `${items.length} Course(s)`,
                order_id: data.razorpayOrderId,
                handler: async (response) => {
                    try {
                        await api.post('/orders/razorpay/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: data.orderId,
                        });
                        dispatch(clearCart());
                        toast.success('Payment successful! Enrolling you now...');
                        navigate('/payment/success');
                    } catch {
                        toast.error('Payment verification failed. Contact support.');
                    }
                },
                prefill: { name: user?.name, email: user?.email },
                theme: { color: '#6366f1' },
                modal: { ondismiss: () => { setLoading(false); toast.error('Payment cancelled'); } },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => {
                toast.error('Payment failed. Try again.');
                setLoading(false);
            });
            rzp.open();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment init failed');
            setLoading(false);
        }
    };

    const handleCheckout = () => {
        if (items.length === 0) return toast.error('Your cart is empty');
        if (paymentMethod === 'stripe') handleStripeCheckout();
        else handleRazorpayCheckout();
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <CreditCard className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold">Your cart is empty</h2>
                <button onClick={() => navigate('/courses')} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl">
                    Browse Courses
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Cart Items */}
                    <div className="bg-card p-6 rounded-2xl border border-border">
                        <h2 className="font-semibold text-lg mb-4">Your Courses ({items.length})</h2>
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item._id} className="flex gap-4 p-3 rounded-xl bg-muted/30">
                                    <img
                                        src={item.thumbnail || 'https://via.placeholder.com/80x60?text=Course'}
                                        alt={item.title}
                                        className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm line-clamp-2">{item.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">by {item.instructor?.name || 'Instructor'}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-primary">${(item.finalPrice || item.price || 0).toFixed(2)}</p>
                                        {item.discount > 0 && (
                                            <p className="text-xs text-muted-foreground line-through">${item.price?.toFixed(2)}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Coupon */}
                    <div className="bg-card p-6 rounded-2xl border border-border">
                        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-primary" /> Coupon Code
                        </h2>
                        {coupon ? (
                            <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="font-semibold text-green-700 dark:text-green-400">{coupon.code}</span>
                                    <span className="text-sm text-green-600">— You saved ${discount.toFixed(2)}!</span>
                                </div>
                                <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                    placeholder="Enter coupon code (e.g. WELCOME50)"
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={couponLoading}
                                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Apply
                                </button>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">Try: <span className="font-mono font-medium">WELCOME50</span> for 50% off</p>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-card p-6 rounded-2xl border border-border">
                        <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Razorpay */}
                            <button
                                onClick={() => setPaymentMethod('razorpay')}
                                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${paymentMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                            >
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <IndianRupee className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-sm">Razorpay</p>
                                    <p className="text-xs text-muted-foreground">UPI, Cards, Net Banking</p>
                                </div>
                                {paymentMethod === 'razorpay' && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                            </button>

                            {/* Stripe */}
                            <button
                                onClick={() => setPaymentMethod('stripe')}
                                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                            >
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-sm">Stripe</p>
                                    <p className="text-xs text-muted-foreground">International Cards</p>
                                </div>
                                {paymentMethod === 'stripe' && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                            </button>
                        </div>

                        {paymentMethod === 'razorpay' && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                                ✓ Supports UPI, Google Pay, PhonePe, Paytm, Net Banking, Debit/Credit Cards
                            </div>
                        )}
                        {paymentMethod === 'stripe' && (
                            <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl text-xs text-indigo-700 dark:text-indigo-300">
                                ✓ Visa, Mastercard, Amex, and all major international cards
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-card p-6 rounded-2xl border border-border sticky top-6">
                        <h2 className="font-semibold text-lg mb-5">Order Summary</h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal ({items.length} courses)</span>
                                <span className="font-medium">${subtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Coupon discount</span>
                                    <span className="font-semibold">-${discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t border-border pt-3 flex justify-between text-base font-bold">
                                <span>Total</span>
                                <span className="text-primary text-xl">${finalAmount.toFixed(2)}</span>
                            </div>
                            {paymentMethod === 'razorpay' && (
                                <p className="text-xs text-muted-foreground">
                                    ≈ ₹{(finalAmount * 83).toFixed(0)} INR (approx.)
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={loading || items.length === 0}
                            className="w-full mt-6 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                            ) : (
                                <><CreditCard className="w-5 h-5" /> Pay ${finalAmount.toFixed(2)}</>
                            )}
                        </button>

                        <div className="mt-4 space-y-2">
                            {[
                                { icon: Shield, text: 'Secure encrypted payment' },
                                { icon: Lock, text: '256-bit SSL encryption' },
                                { icon: CheckCircle, text: '30-day money-back guarantee' },
                            ].map(({ icon: Icon, text }) => (
                                <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Icon className="w-3.5 h-3.5 text-green-500" />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 border-t border-border pt-4">
                            <p className="text-xs text-muted-foreground text-center">
                                By completing purchase you agree to our{' '}
                                <a href="/terms" className="text-primary hover:underline">Terms</a> &{' '}
                                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
