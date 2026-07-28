import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../../redux/slices/courseSlice';
import { Search, GraduationCap, Star, Clock, Users, Filter, ChevronDown, PlayCircle } from 'lucide-react';

export default function CoursesPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { courses, total, totalPages, currentPage, loading } = useSelector((s) => s.courses);

    const [filters, setFilters] = useState({
        search: '',
        category: '',
        level: '',
        language: '',
        price: 'all', // all, free, paid
        sort: 'newest',
    });

    useEffect(() => {
        dispatch(fetchCourses({ ...filters, page: 1, limit: 12 }));
    }, [dispatch, location.search]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(fetchCourses({ ...filters, page: 1, limit: 12 }));
    };

    const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
    const languages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Mandarin'];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Master new skills with our comprehensive course library. Learn at your own pace from industry experts.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-card p-6 rounded-2xl mb-8 space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Search courses..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                    >
                        Search
                    </button>
                </form>

                <div className="flex flex-wrap gap-3">
                    <select
                        value={filters.level}
                        onChange={(e) => handleFilterChange('level', e.target.value)}
                        className="px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    >
                        <option value="">All Levels</option>
                        {levels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>

                    <select
                        value={filters.price}
                        onChange={(e) => handleFilterChange('price', e.target.value)}
                        className="px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    >
                        <option value="all">All Prices</option>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                    </select>

                    <select
                        value={filters.sort}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        className="px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    >
                        <option value="newest">Newest First</option>
                        <option value="popular">Most Popular</option>
                        <option value="rating">Highest Rated</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course, i) => (
                    <div
                        key={i}
                        onClick={() => navigate(`/courses/${course.slug}`)}
                        className="bg-card rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group"
                    >
                        <div className="relative h-48 overflow-hidden">
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 right-3 bg-primary/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                {course.level}
                            </div>
                            {course.isFree && (
                                <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                    Free
                                </div>
                            )}
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-primary">{course.category?.name || 'Uncategorized'}</span>
                            </div>
                            <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{course.subtitle || course.description?.substring(0, 80) + '...'}</p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                <div className="flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3" />
                                    <span>{course.instructor?.name || 'Instructor'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span>{course.averageRating || '0.0'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex items-center gap-1 text-xs">
                                    <Clock className="w-3 h-3" />
                                    <span>{Math.round((course.duration || 0) / 3600)}h</span>
                                    <Users className="w-3 h-3 ml-2" />
                                    <span>{course.totalStudents || 0}</span>
                                </div>
                                <span className="text-lg font-bold text-primary">
                                    {course.isFree ? 'Free' : `$${course.finalPrice}`}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => dispatch(fetchCourses({ ...filters, page: currentPage - 1 }))}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => dispatch(fetchCourses({ ...filters, page: currentPage + 1 }))}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}

            {courses.length === 0 && !loading && (
                <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                        <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                </div>
            )}
        </div>
    );
}
