import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, GraduationCap, Star, PlayCircle, TrendingUp } from 'lucide-react';

export default function StudentDashboard() {
    const navigate = useNavigate();
    const { user } = useSelector((s) => s.auth);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, {user?.name}! 👋</h1>
                    <p className="text-muted-foreground mt-2">Continue your learning journey</p>
                </div>
                <button onClick={() => navigate('/courses')} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                    Browse Courses
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Enrolled Courses', value: user?.enrolledCourses?.length || 0, icon: BookOpen, color: 'bg-blue-500' },
                    { label: 'Completed', value: user?.completedCourses?.length || 0, icon: Award, color: 'bg-green-500' },
                    { label: 'In Progress', value: 0, icon: Clock, color: 'bg-orange-500' },
                    { label: 'Avg Rating', value: '4.8', icon: Star, color: 'bg-yellow-500' },
                ].map((stat, i) => (
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

            {/* Continue Learning */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Continue Learning</h2>
                    <button onClick={() => navigate('/dashboard/my-learning')} className="text-primary hover:underline text-sm">View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card p-4 rounded-2xl flex gap-4">
                            <div className="w-24 h-16 bg-muted rounded-lg flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Complete React.js Developer Course</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    <Clock className="w-3 h-3" />
                                    <span>Lesson 12 of 45</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 mb-2">
                                    <div className="bg-primary h-2 rounded-full w-3/4" />
                                </div>
                                <button onClick={() => navigate('/dashboard/my-learning')} className="text-primary text-sm font-medium flex items-center gap-1">
                                    Resume <PlayCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            <div>
                <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-card rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
                            <div className="relative h-40 overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5" />
                                <div className="absolute top-3 right-3 bg-primary text-white text-xs font-semibold px-2 py-1 rounded">
                                    New
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold mb-1 line-clamp-2">Advanced Python Programming</h3>
                                <p className="text-xs text-muted-foreground mb-3">Dr. Sarah Johnson</p>
                                <div className="flex items-center gap-1 text-xs text-yellow-500">
                                    <Star className="w-3 h-3 fill-yellow-500" />
                                    <span className="font-medium">4.9</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
