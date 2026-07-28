import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    BookOpen, Users, Award, Star, Play, Search, GraduationCap, ChevronRight,
    Code, Globe, BarChart3, Shield, Microscope, LayoutTemplate
} from 'lucide-react';
import { fetchFeaturedCourses } from '../../redux/slices/courseSlice';

const categories = [
    { name: 'Programming', icon: Code, color: 'bg-blue-500', count: 1250 },
    { name: 'Web Development', icon: Globe, color: 'bg-purple-500', count: 890 },
    { name: 'Data Science', icon: BarChart3, color: 'bg-green-500', count: 450 },
    { name: 'AI & ML', icon: Microscope, color: 'bg-pink-500', count: 320 },
    { name: 'Cyber Security', icon: Shield, color: 'bg-red-500', count: 280 },
    { name: 'Design', icon: LayoutTemplate, color: 'bg-orange-500', count: 410 },
];

const stats = [
    { label: 'Active Students', value: '150K+', icon: Users },
    { label: 'Courses', value: '5K+', icon: BookOpen },
    { label: 'Instructors', value: '500+', icon: GraduationCap },
    { label: 'Completion Rate', value: '95%', icon: Award },
];

const testimonials = [
    { name: 'Alice Kumar', role: 'Web Developer', content: 'The platform completely transformed my career. Best learning experience ever!', rating: 5 },
    { name: 'Bob Smith', role: 'Data Analyst', content: 'Highly recommended! The courses are detailed, engaging, and practical.', rating: 5 },
    { name: 'Carol Johnson', role: 'ML Engineer', content: 'Excellent instructors and well-structured curriculum. Highly professional!', rating: 5 },
];

export default function HomePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { featured, trending } = useSelector((s) => s.courses);

    useEffect(() => {
        dispatch(fetchFeaturedCourses());
    }, [dispatch]);

    return (
        <div className="space-y-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&w=2070&q=80')] opacity-10 bg-cover bg-center" />
                <div className="container mx-auto px-4 relative">
                    <div className="max-w-3xl mx-auto text-center space-y-8 py-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                                Master Any Skill with <span className="text-primary">Expert-Led</span> Courses
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Join millions of learners worldwide. Access thousands of courses in programming, business, design, and more from industry experts.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <div className="flex items-center gap-2 w-full sm:w-96 bg-background rounded-full px-4 py-3 shadow-lg shadow-primary/20">
                                    <Search className="text-muted-foreground w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search for courses, skills, and more..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-base"
                                        onClick={() => navigate('/courses')}
                                    />
                                </div>
                                <button
                                    onClick={() => navigate('/courses')}
                                    className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all w-full sm:w-auto"
                                >
                                    Explore Courses
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-card rounded-2xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1"
                        >
                            <stat.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                            <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Categories */}
            <section className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Browse by Category</h2>
                    <button onClick={() => navigate('/courses')} className="flex items-center gap-2 text-primary hover:underline">
                        View All <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={i}
                            onClick={() => navigate(`/category/${cat.name.toLowerCase().replace(' ', '-')}`)}
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                            className="bg-card p-6 rounded-2xl text-center cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group"
                        >
                            <div className={`w-14 h-14 ${cat.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                <cat.icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="font-semibold mb-1">{cat.name}</h3>
                            <p className="text-sm text-muted-foreground">{cat.count} courses</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Featured Courses */}
            {featured.length > 0 && (
                <section className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8">Featured Courses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {featured.slice(0, 4).map((course, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className="bg-card rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-3 right-3 bg-primary/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                        {course.level}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold mb-2 line-clamp-2">{course.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-3">by {course.instructor?.name}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-medium">{course.averageRating}</span>
                                        </div>
                                        <span className="text-lg font-bold text-primary">
                                            {course.isFree ? 'Free' : `$${course.finalPrice}`}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <button onClick={() => navigate('/courses')} className="px-8 py-3 rounded-lg bg-background border border-border hover:bg-muted font-medium transition-colors">
                            View All Courses
                        </button>
                    </div>
                </section>
            )}

            {/* Testimonials */}
            <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
                    <p className="text-muted-foreground">Trusted by over 150,000 learners worldwide</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-card p-6 rounded-2xl"
                        >
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, j) => (
                                    <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                ))}
                            </div>
                            <p className="text-muted-foreground mb-6">"{t.content}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {t.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-semibold">{t.name}</h4>
                                    <p className="text-xs text-muted-foreground">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="container mx-auto px-4 py-20">
                <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Your Learning Journey Today</h2>
                    <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">Join thousands of students who are already mastering new skills with LEARNIX.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => navigate('/register')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-primary font-bold hover:bg-gray-100 transition-colors">
                            Create Free Account
                        </button>
                        <button onClick={() => navigate('/courses')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary-foreground/20 hover:bg-primary-foreground/30 font-bold transition-colors">
                            Browse Courses
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-muted/50 border-t border-border py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold mb-4">Product</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">Courses</a></li>
                                <li><a href="#" className="hover:text-foreground">Paths</a></li>
                                <li><a href="#" className="hover:text-foreground">Certificates</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Company</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">About</a></li>
                                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Resources</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                                <li><a href="#" className="hover:text-foreground">Docs</a></li>
                                <li><a href="#" className="hover:text-foreground">Support</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Legal</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                                <li><a href="#" className="hover:text-foreground">Cookies</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
                        <p>© 2024 CourseLab. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
