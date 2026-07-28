import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourses } from '../../redux/slices/courseSlice';
import { useDispatch, useSelector } from 'react-redux';
import { GraduationCap, Star, Clock, Users, Search } from 'lucide-react';

export default function CategoryPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { courses, total, totalPages, currentPage, loading } = useSelector((s) => s.courses);
    const [search, setSearch] = useState('');

    useEffect(() => {
        dispatch(fetchCourses({ search, category: slug, page: 1, limit: 12 }));
    }, [dispatch, slug, search]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 capitalize">{slug.replace(/-/g, ' ')}</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Discover top-rated courses in {slug.replace(/-/g, ' ')}. Learn from industry experts and advance your career.
                </p>
            </div>

            <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses in this category..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course, i) => (
                    <div
                        key={i}
                        onClick={() => navigate(`/courses/${course.slug}`)}
                        className="bg-card rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group"
                    >
                        <div className="relative h-40 overflow-hidden">
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute top-3 left-3 bg-primary/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                {course.level}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{course.subtitle || course.description?.substring(0, 80) + '...'}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <GraduationCap className="w-3 h-3" />
                                    <span>{course.instructor?.name || 'Instructor'}</span>
                                </div>
                                <span className="text-sm font-bold text-primary">${course.finalPrice}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {courses.length === 0 && !loading && (
                <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                        <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                    <p className="text-muted-foreground">Try adjusting your search terms</p>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => dispatch(fetchCourses({ search, category: slug, page: currentPage - 1 }))}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => dispatch(fetchCourses({ search, category: slug, page: currentPage + 1 }))}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
