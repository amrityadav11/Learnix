import { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, ChevronLeft, ChevronRight, Calendar, User, LogIn, LogOut } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminActivityPage() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState([]);
    const [loginStats, setLoginStats] = useState({ totalLogins: 0, totalLogouts: 0, stats: [] });
    const [loginPeriod, setLoginPeriod] = useState('today');

    const fetchActivities = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 50 };
            if (actionFilter !== 'all') params.action = actionFilter;

            const { data } = await api.get('/admin/activities', { params });
            setActivities(data.activities || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
            setStats(data.stats || []);
        } catch (err) {
            toast.error('Failed to load activities');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, actionFilter]);

    const fetchLoginStats = useCallback(async () => {
        try {
            const { data } = await api.get('/admin/login-stats', { params: { period: loginPeriod } });
            setLoginStats(data.summary || { totalLogins: 0, totalLogouts: 0 });
        } catch (err) {
            console.error('Failed to load login stats:', err);
        }
    }, [loginPeriod]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    useEffect(() => {
        fetchLoginStats();
    }, [fetchLoginStats]);

    const getActionIcon = (action) => {
        if (action === 'login') return <LogIn className="w-4 h-4" />;
        if (action === 'logout') return <LogOut className="w-4 h-4" />;
        return <Activity className="w-4 h-4" />;
    };

    const getActionColor = (action) => {
        if (action === 'login') return 'text-green-600 bg-green-50 dark:bg-green-950/30';
        if (action === 'logout') return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30';
        if (action.includes('deleted') || action.includes('rejected')) return 'text-red-600 bg-red-50 dark:bg-red-950/30';
        if (action.includes('approved') || action.includes('published') || action.includes('created')) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30';
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950/30';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Activity Logs</h1>
                    <p className="text-sm text-muted-foreground mt-1">Track all admin and user activities</p>
                </div>
                <button
                    onClick={fetchActivities}
                    className="p-2 rounded-lg border border-border hover:bg-muted"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Login/Logout Stats */}
            <div className="bg-card p-6 rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Login/Logout Activity
                    </h2>
                    <select
                        value={loginPeriod}
                        onChange={(e) => setLoginPeriod(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                <LogIn className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Logins</p>
                                <p className="text-2xl font-bold">{loginStats.totalLogins || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Logouts</p>
                                <p className="text-2xl font-bold">{loginStats.totalLogouts || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Stats */}
            {stats.length > 0 && (
                <div className="bg-card p-4 rounded-2xl border border-border">
                    <h3 className="font-semibold mb-3 text-sm">Activity Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {stats.slice(0, 8).map((stat, idx) => (
                            <div key={idx} className="bg-muted/30 px-3 py-2 rounded-lg">
                                <p className="text-xs text-muted-foreground capitalize">{stat._id.replace('_', ' ')}</p>
                                <p className="text-lg font-bold">{stat.count}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-card p-4 rounded-2xl border border-border">
                <div className="flex gap-3">
                    <select
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                        className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none text-sm"
                    >
                        <option value="all">All Actions</option>
                        <option value="login">Login</option>
                        <option value="logout">Logout</option>
                        <option value="course_approved">Course Approved</option>
                        <option value="course_rejected">Course Rejected</option>
                        <option value="course_published">Course Published</option>
                        <option value="course_unpublished">Course Unpublished</option>
                        <option value="course_deleted">Course Deleted</option>
                        <option value="user_updated">User Updated</option>
                        <option value="user_deleted">User Deleted</option>
                        <option value="settings_updated">Settings Updated</option>
                    </select>
                </div>
            </div>

            {/* Activity List */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No activities found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {activities.map((activity) => (
                            <div key={activity._id} className="p-4 hover:bg-muted/20 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActionColor(activity.action)}`}>
                                        {getActionIcon(activity.action)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-medium text-sm">{activity.actionDescription}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    by {activity.user?.name || 'Unknown'} ({activity.user?.role || 'N/A'})
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${getActionColor(activity.action)}`}>
                                                {activity.action.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(activity.createdAt).toLocaleString()}
                                            </span>
                                            {activity.ipAddress && (
                                                <span>IP: {activity.ipAddress}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-between text-sm">
                        <p className="text-muted-foreground">
                            Page {page} of {totalPages} ({total} total activities)
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
