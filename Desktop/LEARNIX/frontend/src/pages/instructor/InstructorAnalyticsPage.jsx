import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Star, AlertCircle, Loader, BarChart3 } from 'lucide-react';
import axios from 'axios';

export default function InstructorAnalyticsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState('30');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courses, setCourses] = useState([]);
    const [courseAnalytics, setCourseAnalytics] = useState(null);

    // Fetch overall analytics
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get(`/api/v1/instructor/analytics?dateRange=${dateRange}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setAnalytics(res.data.data);

                // Also fetch courses for selection
                const courseRes = await axios.get('/api/v1/courses/instructor', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setCourses(courseRes.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [dateRange]);

    // Fetch course-specific analytics
    useEffect(() => {
        if (selectedCourse) {
            const fetchCourseAnalytics = async () => {
                try {
                    const res = await axios.get(`/api/v1/instructor/analytics/${selectedCourse}?dateRange=${dateRange}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    setCourseAnalytics(res.data.data);
                } catch (err) {
                    setError('Failed to load course analytics');
                }
            };
            fetchCourseAnalytics();
        } else {
            setCourseAnalytics(null);
        }
    }, [selectedCourse, dateRange]);

    if (loading) return <div className="flex items-center justify-center p-8"><Loader className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground mt-2">Track your course performance and student engagement</p>
                </div>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="365">Last Year</option>
                </select>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{error}</span>
                </motion.div>
            )}

            {/* Overall Metrics */}
            {analytics && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Courses</p>
                                    <p className="text-3xl font-bold mt-2">{analytics.metrics?.totalCourses || 0}</p>
                                </div>
                                <BarChart3 className="w-8 h-8 text-blue-500" />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Students</p>
                                    <p className="text-3xl font-bold mt-2">{analytics.metrics?.totalStudents || 0}</p>
                                </div>
                                <Users className="w-8 h-8 text-green-500" />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                                    <p className="text-3xl font-bold mt-2">${(analytics.metrics?.totalRevenue || 0).toLocaleString()}</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-purple-500" />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                                    <p className="text-3xl font-bold mt-2">{analytics.metrics?.avgRating || 0}</p>
                                </div>
                                <Star className="w-8 h-8 text-yellow-500" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Top Courses */}
                    <div className="bg-card rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Top Performing Courses</h2>
                        <div className="space-y-3">
                            {analytics.topCourses?.map((course, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{course.title}</p>
                                        <p className="text-sm text-muted-foreground">{course.students} students</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">${course.revenue?.toLocaleString()}</p>
                                        <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                            <Star className="w-4 h-4 fill-yellow-500" /> {course.rating}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Student Satisfaction */}
                    <div className="bg-card rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Student Satisfaction</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-muted/50 rounded-lg p-6 text-center">
                                <p className="text-sm text-muted-foreground">Average Rating</p>
                                <p className="text-4xl font-bold mt-2 text-yellow-500">{analytics.studentSatisfaction?.avgRating || 0}</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Based on {analytics.studentSatisfaction?.totalReviews || 0} reviews
                                </p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-6 flex items-center justify-center">
                                <div>
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-white">
                                            {Math.round((analytics.studentSatisfaction?.avgRating || 0) * 20)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Course-Specific Analytics */}
            <div className="bg-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Course-Specific Analytics</h2>
                <select
                    value={selectedCourse || ''}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-6"
                >
                    <option value="">Select a course...</option>
                    {courses.map(c => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                </select>

                {courseAnalytics && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">Total Enrollments</p>
                                <p className="text-2xl font-bold mt-2">{courseAnalytics.completionStats?.total || 0}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold mt-2 text-green-600">{courseAnalytics.completionStats?.completed || 0}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">Completion Rate</p>
                                <p className="text-2xl font-bold mt-2">{courseAnalytics.completionStats?.rate || 0}%</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">Avg Progress</p>
                                <p className="text-2xl font-bold mt-2">{Math.round(courseAnalytics.engagement?.avgProgress || 0)}%</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold mt-2 text-green-600">${(courseAnalytics.revenue?.total || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                                <p className="text-2xl font-bold mt-2">${courseAnalytics.revenue?.avgOrderValue || 0}</p>
                            </div>
                        </div>

                        {/* Enrollment Trend Chart */}
                        {courseAnalytics.enrollmentTrend && courseAnalytics.enrollmentTrend.length > 0 && (
                            <div className="bg-muted/50 rounded-lg p-4">
                                <p className="font-medium mb-4">Enrollment Trend</p>
                                <div className="space-y-2">
                                    {courseAnalytics.enrollmentTrend.map((data, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <p className="text-sm text-muted-foreground w-24">{data._id}</p>
                                            <div className="flex-1 bg-primary/20 rounded-full h-6 flex items-center overflow-hidden">
                                                <div
                                                    className="bg-primary h-6 flex items-center justify-end pr-2"
                                                    style={{ width: `${Math.min(data.enrollments * 10, 100)}%` }}
                                                >
                                                    <span className="text-xs font-bold text-primary-foreground">{data.enrollments}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
