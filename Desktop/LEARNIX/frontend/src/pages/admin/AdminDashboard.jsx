import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users, BookOpen, DollarSign, ShoppingCart, TrendingUp, GraduationCap,
    Clock, Star, ArrowUpRight, RefreshCw, CheckCircle, AlertCircle,
    PlusCircle, Eye, Settings, BarChart3, Award
} from 'lucide-react';
import api from '../../api/axios';
import LoadingScreen from '../../components/common/LoadingScreen';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    if (loading) return <LoadingScreen />;
    if (error) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle className="w-16 h-16 text-red-400" />
            <p className="text-red-500 font-medium">{error}</p>
            <button onClick={fetchStats} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Retry
            </button>
        </div>
    );

    const s = stats?.stats || {};
    const recentOrders = stats?.recentOrders || [];
    const topCourses = stats?.topCourses || [];

    const statCards = [
        { label: 'Total Users', value: s.totalUsers?.toLocaleString() || '0', icon: Users, color: 'bg-blue-500', sub: `${s.totalStudents || 0} students · ${s.totalInstructors || 0} instructors`, href: '/admin/users' },
        { label: 'Total Courses', value: s.totalCourses?.toLocaleString() || '0', icon: BookOpen, color: 'bg-purple-500', sub: `${s.pendingCourses || 0} pending approval`, href: '/admin/courses' },
        { label: 'Total Orders', value: s.totalOrders?.toLocaleString() || '0', icon: ShoppingCart, color: 'bg-green-500', sub: 'Completed payments', href: '/admin/orders' },
        { label: 'Total Revenue', value: `$${(s.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-orange-500', sub: 'All time earnings', href: '/admin/orders' },
    ];

    const quickActions = [
        { label: 'Add Course', icon: PlusCircle, color: 'bg-purple-500', href: '/admin/courses', desc: 'Create new course' },
        { label: 'Manage Users', icon: Users, color: 'bg-blue-500', href: '/admin/users', desc: 'View all users' },
        { label: 'Pending Courses', icon: Clock, color: 'bg-yellow-500', href: '/admin/courses?status=pending', desc: `${s.pendingCourses || 0} awaiting review` },
        { label: 'All Orders', icon: ShoppingCart, color: 'bg-green-500', href: '/admin/orders', desc: 'View transactions' },
        { label: 'Categories', icon: BarChart3, color: 'bg-indigo-500', href: '/admin/categories', desc: 'Manage categories' },
        { label: 'Site Settings', icon: Settings, color: 'bg-gray-500', href: '/admin/settings', desc: 'Configure platform' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back, here's what's happening</p>
                </div>
                <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted text-sm">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        onClick={() => navigate(stat.href)}
                        className="bg-card p-6 rounded-2xl border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                        <p className="text-sm font-medium mb-1">{stat.label}</p>
                        <p className="text-xs text-muted-foreground">{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Users Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Students', value: s.totalStudents || 0, icon: GraduationCap, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
                    { label: 'Instructors', value: s.totalInstructors || 0, icon: Award, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30' },
                    { label: 'Pending Approvals', value: s.pendingCourses || 0, icon: Clock, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30' },
                ].map((item, i) => (
                    <div key={i} className="bg-card p-5 rounded-2xl border border-border flex items-center gap-4">
                        <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center`}>
                            <item.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{item.label}</p>
                            <p className="text-3xl font-bold">{item.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {quickActions.map((action, i) => (
                        <motion.button
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                            onClick={() => navigate(action.href)}
                            className="bg-card p-5 rounded-2xl border border-border hover:shadow-lg hover:-translate-y-1 transition-all group text-center"
                        >
                            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                                <action.icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="font-semibold text-sm">{action.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-5 border-b border-border flex items-center justify-between">
                        <h2 className="font-semibold text-lg">Recent Orders</h2>
                        <button onClick={() => navigate('/admin/orders')} className="text-sm text-primary hover:underline flex items-center gap-1">
                            View all <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p>No orders yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {recentOrders.slice(0, 6).map((order) => (
                                <div key={order._id} className="p-4 flex items-center gap-3 hover:bg-muted/20">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                        {order.user?.name?.[0] || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{order.user?.name || 'Unknown'}</p>
                                        <p className="text-xs text-muted-foreground">{order.courses?.length} course(s)</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-sm text-primary">${order.finalAmount?.toFixed(2)}</p>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Courses */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-5 border-b border-border flex items-center justify-between">
                        <h2 className="font-semibold text-lg">Top Courses</h2>
                        <button onClick={() => navigate('/admin/courses')} className="text-sm text-primary hover:underline flex items-center gap-1">
                            View all <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                    {topCourses.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p>No courses yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {topCourses.map((course, i) => (
                                <div key={course._id} className="p-4 flex items-center gap-3 hover:bg-muted/20">
                                    <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{course.title}</p>
                                        <p className="text-xs text-muted-foreground">by {course.instructor?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-xs text-yellow-500">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span>{course.averageRating?.toFixed(1) || '0.0'}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{course.totalStudents} students</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
