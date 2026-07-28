import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Download, CheckCircle, GraduationCap, Clock, Calendar, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function OrderHistoryPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/orders/my-orders');
            const formattedOrders = data.orders.map(order => ({
                _id: order._id,
                invoice: order.invoiceNumber || order._id.substring(0, 8).toUpperCase(),
                date: new Date(order.createdAt).toLocaleDateString(),
                amount: order.finalAmount || 0,
                status: order.paymentStatus || 'pending',
                items: order.courses.map(c => ({
                    courseId: c.course?._id,
                    name: c.course?.title || 'Course',
                    instructor: c.course?.instructor?.name || 'Instructor'
                })),
                paymentMethod: order.paymentMethod || 'Unknown',
                refundReason: order.refundReason,
            }));
            setOrders(formattedOrders);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Order History</h1>
                <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{orders.length} orders</span>
                    <button onClick={fetchOrders} className="p-2 rounded-lg border border-border hover:bg-muted">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-2xl">
                    <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-6">Start exploring courses to make your first purchase</p>
                    <button onClick={() => navigate('/courses')} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium">
                        Browse Courses
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-card p-6 rounded-2xl border border-border">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-lg">Invoice #{order.invoice}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' :
                                                order.status === 'refunded' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{order.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CreditCard className="w-4 h-4" />
                                            <span>{order.paymentMethod}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">${order.amount.toFixed(2)}</div>
                                    {order.refundReason && (
                                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">Refund: {order.refundReason}</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                                        <div className="flex items-center gap-4 flex-1">
                                            <GraduationCap className="w-10 h-10 text-primary/20 rounded-lg" />
                                            <div>
                                                <h4 className="font-medium">{item.name}</h4>
                                                <p className="text-sm text-muted-foreground">{item.instructor}</p>
                                            </div>
                                        </div>
                                        {order.status === 'completed' && (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => navigate(`/learn/${item.courseId}`)}
                                                    className="flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Learn
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4">
                                <button className="flex items-center gap-1 hover:text-primary">
                                    <Download className="w-4 h-4" />
                                    Download Invoice
                                </button>
                                <span>•</span>
                                <button className="hover:text-primary">Contact Support</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
