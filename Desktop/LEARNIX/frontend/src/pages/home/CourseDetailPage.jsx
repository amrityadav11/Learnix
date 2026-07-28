import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourseDetail, clearCurrentCourse } from '../../redux/slices/courseSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { BookOpen, GraduationCap, Star, Award, Clock, Users, PlayCircle, FileText, ChevronDown, ChevronUp, ShoppingBag, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseDetailPage() {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentCourse, loading } = useSelector((s) => s.courses);
    const [expandedModules, setExpandedModules] = useState({});

    useEffect(() => {
        dispatch(fetchCourseDetail(slug));
        return () => dispatch(clearCurrentCourse());
    }, [dispatch, slug]);

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (!currentCourse) return <div className="text-center py-20">Course not found</div>;

    const { course, isEnrolled, reviews } = currentCourse;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <button onClick={() => navigate(-1)} className="text-primary hover:underline mb-4">← Back</button>
                <div className="flex flex-wrap gap-3 mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">{course.category?.name}</span>
                    {course.isFree && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Free</span>}
                    <span className="bg-muted px-3 py-1 rounded-full text-sm">{course.level}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-xl text-muted-foreground mb-6">{course.subtitle}</p>

                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        <span>{course.instructor?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{course.averageRating}</span>
                        <span>({course.totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span>{course.totalStudents} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span>{Math.round(course.duration / 3600)} hours</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* About */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">About this course</h2>
                        <div className="prose prose-muted max-w-none text-muted-foreground">
                            <p>{course.description}</p>
                        </div>
                    </section>

                    {/* What you'll learn */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {course.whatYouLearn?.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                    <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                                    <span className="text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Requirements */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                        <ul className="space-y-2">
                            {course.requirements?.map((req, i) => (
                                <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                                    <span className="w-2 h-2 rounded-full bg-primary mt-2" />
                                    {req}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Course Content */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Course Content</h2>
                        <div className="space-y-3">
                            {course.modules?.map((module, i) => (
                                <div key={i} className="border border-border rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => toggleModule(module._id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
                                    >
                                        <div>
                                            <h3 className="font-semibold">{module.title}</h3>
                                            <p className="text-xs text-muted-foreground">{module.lessons?.length || 0} lessons • {Math.round((module.duration || 0) / 60)} min</p>
                                        </div>
                                        {expandedModules[module._id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>
                                    {expandedModules[module._id] && (
                                        <div className="bg-muted/20 px-4 pb-4">
                                            {module.lessons?.map((lesson, j) => (
                                                <div key={j} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg ml-4 mb-1">
                                                    <div className="flex items-center gap-3">
                                                        <PlayCircle className="w-5 h-5 text-muted-foreground" />
                                                        <span className="text-sm">{lesson.title}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{Math.round(lesson.duration / 60)} min</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Reviews */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
                        <div className="space-y-4">
                            {reviews?.map((review, i) => (
                                <div key={i} className="p-4 border border-border rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold">{review.user?.name || 'Anonymous'}</div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, j) => (
                                                <Star key={j} className={`w-4 h-4 ${j < Math.round(review.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    {review.title && <h4 className="font-medium mb-2">{review.title}</h4>}
                                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Price Card */}
                    <div className="bg-card p-6 rounded-2xl shadow-lg">
                        <div className="text-4xl font-bold mb-2">
                            {course.isFree ? 'Free' : `$${course.finalPrice}`}
                            {course.discount > 0 && (
                                <span className="text-lg text-muted-foreground line-through">/${course.price}</span>
                            )}
                        </div>
                        {course.discount > 0 && (
                            <div className="text-green-500 font-semibold mb-4">Save {course.discount}% today</div>
                        )}

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <BookOpen className="w-4 h-4" />
                                <span>{course.totalLessons || 0} lectures • {Math.round(course.duration / 3600)} total hours</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{course.isFree ? 'Lifetime access' : 'Access on mobile and TV'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Award className="w-4 h-4" />
                                <span>Certificate of completion</span>
                            </div>
                        </div>

                        {isEnrolled ? (
                            <button
                                onClick={() => navigate(`/learn/${course._id}`)}
                                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                            >
                                Start Learning
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        dispatch(addToCart(course));
                                        toast.success('Added to cart!');
                                    }}
                                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mb-3"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                                >
                                    Buy Now
                                </button>
                            </>
                        )}

                        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> 30-day money-back guarantee</span>
                        </div>
                    </div>

                    {/* Instructor */}
                    <div className="bg-card p-6 rounded-2xl">
                        <h3 className="font-bold mb-4">Instructor</h3>
                        <div className="flex items-start gap-4">
                            <img src={course.instructor?.avatar || `https://ui-avatars.com/api/?name=${course.instructor?.name}`} className="w-16 h-16 rounded-full object-cover" />
                            <div>
                                <h4 className="font-semibold">{course.instructor?.name}</h4>
                                <p className="text-sm text-muted-foreground">{course.instructor?.headline || 'Instructor'}</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">{course.instructor?.bio?.substring(0, 200)}...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
