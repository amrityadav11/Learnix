import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Eye, RefreshCw, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('all');
    const [customDates, setCustomDates] = useState({ startDate: '', endDate: '' });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, completedOrders: 0, completedRevenue: 0 });

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (periodFilter !== 'all' && periodFilter !== 'custom') params.period = periodFilter;
            if (periodFilter === 'custom' && customDates.startDate && customDates.endDate) {
                params.period = 'custom';
                params.startDate = customDates.startDate;
                params.endDate = customDates.endDate;
            }

            const { data } = await api.get('/admin/orders', { params });
            setOrders(data.orders || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
            setStats(data.stats || { totalRevenue: 0, totalOrders: 0, completedOrders: 0, completedRevenue: 0 });
        } catch (err) {
            toast.error('Failed to load orders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, periodFilter, customDates]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleDownload = async () => {
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (periodFilter !== 'all' && periodFilter !== 'custom') params.period = periodFilter;
            if (periodFilter === 'custom' && customDates.startDate && customDates.endDate) {
                params.period = 'custom';
                params.startDate = customDates.startDate;
                params.endDate = customDates.endDate;
            }

            const response = await api.get('/admin/orders/download', {
                params,
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orders-report-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Report downloaded successfully!');
        } catch (err) {
            toast.error('Failed to download report');
            console.error(err);
        }
    };

    const filteredOrders = orders.filter(o =>
    (o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        o._id?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Manage Orders</h1>
                <div className="text-sm text-muted-foreground">
                    Total Revenue: <span className="font-bold text-foreground text-base">${stats.completedRevenue.toFixed(2)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Orders', value: stats.totalOrders, color: 'bg-blue-500' },
                    { label: 'Completed', value: stats.completedOrders, color: 'bg-green-500' },
                    { label: 'All Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: 'bg-purple-500' },
                    { label: 'Completed Revenue', value: `$${stats.completedRevenue.toFixed(2)}`, color: 'bg-emerald-500' },
                ].map((s, i) => (
                    <div key={i} className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4">
                        <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                            {typeof s.value === 'number' ? s.value : s.value.substring(1, 5)}
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className="font-semibold">{typeof s.value === 'number' ? s.value : s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-card p-4 rounded-2xl border border-border space-y-3">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by customer, email, or order ID..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                    <select
                        value={periodFilter}
                        onChange={(e) => { setPeriodFilter(e.target.value); setPage(1); }}
                        className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none text-sm"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                        <option value="custom">Custom Range</option>
                    </select>
                    <button
                        onClick={fetchOrders}
                        className="p-2 rounded-lg border border-border hover:bg-muted"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>

                {periodFilter === 'custom' && (
                    <div className="flex gap-3 items-center">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <input
                            type="date"
                            value={customDates.startDate}
                            onChange={(e) => setCustomDates(prev => ({ ...prev, startDate: e.target.value }))}
                            className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
                        />
                        <span className="text-muted-foreground text-sm">to</span>
                        <input
                            type="date"
                            value={customDates.endDate}
                            onChange={(e) => setCustomDates(prev => ({ ...prev, endDate: e.target.value }))}
                            className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
                        />
                        <button
                            onClick={() => { setPage(1); fetchOrders(); }}
                            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                        >
                            Apply
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground">
                        <p className="font-medium">No orders found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 font-medium">Order ID</th>
                                    <th className="p-4 font-medium">Customer</th>
                                    <th className="p-4 font-medium">Amount</th>
                                    <th className="p-4 font-medium">Method</th>
                                    <th className="p-4 font-medium">Courses</th>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-muted/20">
                                        <td className="p-4 font-mono text-xs">{order._id?.substring(0, 8)}...</td>
                                        <td className="p-4">
                                            <p className="font-medium text-sm">{order.user?.name || 'N/A'}</p>
                                            <p className="text-xs text-muted-foreground">{order.user?.email || 'N/A'}</p>
                                        </td>
                                        <td className="p-4 font-semibold">${order.finalAmount?.toFixed(2) || '0.00'}</td>
                                        <td className="p-4 text-sm capitalize text-muted-foreground">{order.paymentMethod || 'N/A'}</td>
                                        <td className="p-4 text-sm text-muted-foreground">{order.courses?.length || 0}</td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' :
                                                    order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' :
                                                        'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                                }`}>
                                                {order.paymentStatus || 'unknown'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    title="View Details"
                                                    className="p-1.5 rounded-lg hover:bg-muted"
                                                >
                                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-between text-sm">
                        <p className="text-muted-foreground">
                            Page {page} of {totalPages} ({total} total orders)
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
