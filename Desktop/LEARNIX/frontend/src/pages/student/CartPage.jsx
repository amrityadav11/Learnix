import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from '../../redux/slices/cartSlice';
import { Trash2, CheckCircle, GraduationCap, Star, Shield, Lock } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function CartPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cart = useSelector((s) => s.cart);

    const [coupon, setCoupon] = useState('');
    const [loading, setLoading] = useState(false);

    const total = cart.items.reduce((sum, item) => sum + item.finalPrice, 0);
    const couponDiscount = cart.couponDiscount || 0;
    const finalAmount = total - couponDiscount;

    const handleApplyCoupon = async () => {
        if (!coupon) return;
        setLoading(true);
        try {
            const { data } = await api.post('/orders/apply-coupon', {
                code: coupon,
                cartTotal: total
            });
            if (data.success) {
                toast.success(`Coupon applied! Save $${data.discount}`);
                // TODO: Update Redux state with coupon
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid coupon');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = (id) => {
        dispatch(removeFromCart(id));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    <h1 className="text-3xl font-bold mb-6">Shopping Cart ({cart.items.length})</h1>

                    {cart.items.map((item) => (
                        <div key={item._id} className="bg-card p-6 rounded-2xl flex gap-4">
                            <div className="w-32 h-20 flex-shrink-0">
                                <img src={item.thumbnail} alt={item.title} className="w-full h-full rounded-lg object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                    <button onClick={() => handleRemoveItem(item._id)} className="p-1 hover:text-destructive">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                                    <div className="flex items-center gap-1">
                                        <GraduationCap className="w-4 h-4" />
                                        <span>{item.instructor?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span>{item.averageRating || '0.0'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold text-primary">${item.finalPrice}</span>
                                    {item.discount > 0 && <span className="text-sm text-muted-foreground line-through">${item.price}</span>}
                                    <div className="flex items-center gap-2 text-green-600 text-sm ml-auto">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>In cart</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="bg-muted/30 p-6 rounded-2xl">
                        <h2 className="font-semibold mb-4">Coupon Code</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                                placeholder="Enter coupon code"
                                className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                            <button
                                onClick={handleApplyCoupon}
                                disabled={loading}
                                className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50"
                            >
                                {loading ? 'Applying...' : 'Apply'}
                            </button>
                        </div>
                        {cart.coupon && (
                            <div className="mt-3 text-green-600 text-sm flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>{cart.coupon.code} applied - ${cart.couponDiscount} off</span>
                            </div>
                        )}
                    </div>

                    <button onClick={() => navigate('/checkout')} disabled={cart.items.length === 0} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50">
                        Proceed to Checkout ({cart.items.length} items)
                    </button>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-card p-6 rounded-2xl sticky top-6">
                        <h2 className="font-semibold text-lg mb-6">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">${total.toFixed(2)}</span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="flex items-center justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-${couponDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Tax (estimated)</span>
                                <span className="font-medium">${(finalAmount * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-border my-4" />
                            <div className="flex items-center justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">${finalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Shield className="w-4 h-4" />
                                <span>Secure payment</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Lock className="w-4 h-4" />
                                <span>256-bit SSL encryption</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            disabled={cart.items.length === 0}
                            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50"
                        >
                            Proceed to Checkout
                        </button>

                        <p className="text-center text-xs text-muted-foreground mt-4">
                            By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
