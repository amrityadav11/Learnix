import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, PlayCircle, CheckCircle, Clock, Award, Search, Filter, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function MyLearningPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyLearning();
    }, []);

    const fetchMyLearning = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/progress/my-learning');
            const formattedCourses = data.progresses.map(p => ({
                _id: p.course._id,
                title: p.course.title,
                instructor: p.course.instructor?.name,
                progress: p.totalProgress || 0,
                currentLesson: p.currentLesson,
                thumbnail: p.course.thumbnail || `https://ui-avatars.com/api/?name=${p.course.title}&background=6366f1&color=fff`,
                status: p.isCompleted ? 'completed' : 'in-progress',
                certificateId: p.certificateId,
            }));
            setCourses(formattedCourses);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">My Learning</h1>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search your courses..."
                            className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                        />
                    </div>
                    <button onClick={fetchMyLearning} className="p-2 rounded-lg border border-border hover:bg-muted">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="bg-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-lg font-semibold">Your Courses</h2>
                    <span className="text-sm text-muted-foreground">({filteredCourses.length} courses)</span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No courses found. Start learning today!</p>
                        <button onClick={() => navigate('/courses')} className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                            Browse Courses
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCourses.map((course) => (
                            <div key={course._id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors border border-border">
                                <img src={course.thumbnail} alt={course.title} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>

                                    {course.status === 'completed' ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-green-500">
                                                <Award className="w-4 h-4" />
                                                <span className="text-sm font-medium">Course Completed!</span>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/dashboard/certificates`)}
                                                className="flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                View Certificate
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                                <span>Progress</span>
                                                <span>{course.progress}%</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2 mb-2">
                                                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                                            </div>
                                            <button
                                                onClick={() => navigate(`/learn/${course._id}`)}
                                                className="flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                                            >
                                                <PlayCircle className="w-4 h-4" />
                                                Continue Learning
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
