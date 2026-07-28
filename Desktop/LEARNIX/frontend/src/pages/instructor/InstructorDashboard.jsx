import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { GraduationCap, DollarSign, TrendingUp, BookOpen, Users, Star, BarChart3 } from 'lucide-react';

export default function InstructorDashboard() {
    const navigate = useNavigate();
    const { user } = useSelector((s) => s.auth);

    const stats = [
        { label: 'Total Students', value: '1,250', icon: Users, color: 'bg-blue-500' },
        { label: 'Total Revenue', value: '$12.5K', icon: DollarSign, color: 'bg-green-500' },
        { label: 'Course Completion', value: '92%', icon: TrendingUp, color: 'bg-purple-500' },
        { label: 'Average Rating', value: '4.8', icon: Star, color: 'bg-yellow-500' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Welcome back, {user?.name}! Here's your overview</p>
                </div>
                <button onClick={() => navigate('courses/create')} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium">
                    Create New Course
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-card p-6 rounded-2xl"
                    >
                        <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                            <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { icon: BookOpen, title: 'My Courses', desc: 'Manage your existing courses', action: () => navigate('courses'), count: 5 },
                    { icon: TrendingUp, title: 'Student Analytics', desc: 'View your top performing courses', action: () => navigate('students'), color: 'bg-blue-500' },
                    { icon: DollarSign, title: 'Earnings', desc: 'Track your revenue and payouts', action: () => navigate('earnings'), color: 'bg-green-500' },
                ].map((item, i) => (
                    <div key={i} onClick={item.action} className="bg-card p-6 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                        <div className={`w-12 h-12 ${item.color || 'bg-primary'} rounded-xl flex items-center justify-center mb-4`}>
                            <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                        <div className="flex items-center text-primary font-medium">
                            <span>View Details</span>
                            <TrendingUp className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
                <div className="space-y-3">
                    {[
                        { action: 'New student enrolled', target: 'Complete React.js Course', time: '2 hours ago' },
                        { action: 'Course completed', target: 'Python for Data Science', time: '5 hours ago' },
                        { action: 'New review received', target: 'Node.js Backend Course', rating: 5, time: '1 day ago' },
                        { action: 'Revenue payout processed', target: 'January Earnings', amount: '$2.5K', time: '2 days ago' },
                    ].map((activity, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-card rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium">{activity.action}</h4>
                                    <p className="text-sm text-muted-foreground">{activity.target}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {activity.amount && <span className="text-green-600 font-medium">{activity.amount}</span>}
                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Courses in Progress */}
            <div>
                <h2 className="text-2xl font-bold mb-6">Top Performing Courses</h2>
                <div className="bg-card rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="p-4 font-medium">Course</th>
                                <th className="p-4 font-medium">Students</th>
                                <th className="p-4 font-medium">Revenue</th>
                                <th className="p-4 font-medium">Rating</th>
                                <th className="p-4 font-medium">Completion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Complete React.js Developer', students: 450, revenue: '$18K', rating: '4.9', completion: '85%' },
                                { name: 'Python for Data Science', students: 320, revenue: '$12K', rating: '4.8', completion: '78%' },
                                { name: 'Node.js Backend', students: 280, revenue: '$10K', rating: '4.7', completion: '82%' },
                            ].map((course, i) => (
                                <tr key={i} className="border-t hover:bg-muted/30">
                                    <td className="p-4 font-medium">{course.name}</td>
                                    <td className="p-4 text-muted-foreground">{course.students}</td>
                                    <td className="p-4 text-muted-foreground">{course.revenue}</td>
                                    <td className="p-4 text-muted-foreground">{course.rating}</td>
                                    <td className="p-4">
                                        <div className="w-24 bg-muted rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: course.completion }} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
