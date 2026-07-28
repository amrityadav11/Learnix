import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, CheckCircle, X, Filter, Search } from 'lucide-react';
import { fetchNotifications, markAsRead, deleteNotification, markAllAsRead } from '../../redux/slices/notificationSlice';
import LoadingScreen from '../../components/common/LoadingScreen';

const NotificationsPage = () => {
    const dispatch = useDispatch();
    const { notifications, loading, unreadCount } = useSelector((state) => state.notifications);

    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const filteredNotifications = notifications.filter((notification) => {
        const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' ||
            (filterType === 'unread' && !notification.read) ||
            (filterType === 'read' && notification.read) ||
            notification.type === filterType;
        return matchesSearch && matchesFilter;
    });

    const handleMarkAsRead = (notificationId) => {
        dispatch(markAsRead(notificationId));
    };

    const handleDelete = (notificationId) => {
        dispatch(deleteNotification(notificationId));
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'course': return '📚';
            case 'payment': return '💳';
            case 'system': return '⚙️';
            case 'achievement': return '🏆';
            default: return '📢';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'course': return 'bg-blue-100 text-blue-600';
            case 'payment': return 'bg-green-100 text-green-600';
            case 'system': return 'bg-gray-100 text-gray-600';
            case 'achievement': return 'bg-yellow-100 text-yellow-600';
            default: return 'bg-purple-100 text-purple-600';
        }
    };

    if (loading && notifications.length === 0) return <LoadingScreen />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Bell className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                            <p className="text-gray-600">
                                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                            </p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => dispatch(markAllAsRead())}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Mark All Read
                        </button>
                    )}
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        >
                            <option value="all">All Notifications</option>
                            <option value="unread">Unread</option>
                            <option value="read">Read</option>
                            <option value="course">Course Updates</option>
                            <option value="payment">Payments</option>
                            <option value="system">System</option>
                            <option value="achievement">Achievements</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications Found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterType !== 'all'
                                ? 'No notifications match your search criteria.'
                                : 'You\'re all caught up! New notifications will appear here.'
                            }
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${notification.read ? 'border-gray-200' : 'border-blue-500'
                                } hover:shadow-md transition-shadow`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4 flex-1">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                {notification.title}
                                            </h3>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            )}
                                        </div>
                                        <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-600'} mb-2`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    {!notification.read && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification._id)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Mark as read"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notification._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;