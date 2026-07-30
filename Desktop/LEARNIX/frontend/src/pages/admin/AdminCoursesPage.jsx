import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, CheckCircle, XCircle, Eye, Trash2, BookOpen, PlusCircle,
    RefreshCw, Filter, ChevronLeft, ChevronRight, Star, Users, AlertCircle,
    Globe, Lock
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
    published: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    unpublished: 'bg-orange-100 text-orange-700',
};

export default function AdminCoursesPage() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [createForm, setCreateForm] = useState({
        title: '', description: '', category: '', price: '', level: 'Beginner', language: 'English',
        whatYouLearn: ['', '', ''], requirements: ['']
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [createLoading, setCreateLoading] = useState(false);
    const [rejectModal, setRejectModal] = useState({ open: false, courseId: null, reason: '' });

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (search) params.search = search;
            const { data } = await api.get('/admin/courses', { params });
            setCourses(data.courses || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, search]);

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const { data } = await api.get('/categories');
            setCategories(data.categories || []);
        } catch (err) {
            toast.error('Failed to load categories');
            console.error(err);
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => { fetchCourses(); }, [fetchCourses]);
    useEffect(() => { fetchCategories(); }, []);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setPage(1); fetchCourses(); }, 500);
        return () => clearTimeout(t);
    }, [search]);

    const handleApprove = async (id) => {
        try {
            await api.put(`/admin/courses/${id}/approve`, { approve: true });
            toast.success('Course approved and published!');
            fetchCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve');
        }
    };

    const handleTogglePublish = async (id, currentlyPublished) => {
        const action = currentlyPublished ? 'delist' : 'list';
        if (!window.confirm(`Are you sure you want to ${action} this course?`)) return;

        try {
            await api.put(`/admin/courses/${id}/toggle-publish`);
            toast.success(`Course ${currentlyPublished ? 'delisted' : 'listed'} successfully!`);
            fetchCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${action} course`);
        }
    };

    const handleReject = async () => {
        try {
            await api.put(`/admin/courses/${rejectModal.courseId}/approve`, {
                approve: false, reason: rejectModal.reason
            });
            toast.success('Course rejected');
            setRejectModal({ open: false, courseId: null, reason: '' });
            fetchCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject');
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete course "${title}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/courses/${id}`);
            toast.success('Course deleted');
            fetchCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!createForm.title || !createForm.description || !createForm.category || !createForm.price) {
            return toast.error('Fill all required fields');
        }
        setCreateLoading(true);
        try {
            // Create course first
            const courseData = {
                ...createForm,
                price: parseFloat(createForm.price),
                whatYouLearn: createForm.whatYouLearn.filter(w => w.trim()),
                requirements: createForm.requirements.filter(r => r.trim()),
            };
            const { data } = await api.post('/courses', courseData);

            // Upload thumbnail if provided
            if (thumbnailFile) {
                const formData = new FormData();
                formData.append('thumbnail', thumbnailFile);
                await api.put(`/courses/${data.course._id}/thumbnail`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            toast.success('Course created and published with thumbnail!');
            setShowCreateModal(false);
            setCreateForm({ title: '', description: '', category: '', price: '', level: 'Beginner', language: 'English', whatYouLearn: ['', '', ''], requirements: [''] });
            setThumbnailFile(null);
            setThumbnailPreview(null);
            fetchCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Creation failed');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            const preview = URL.createObjectURL(file);
            setThumbnailPreview(preview);
        }
    };

    const pendingCount = courses.filter(c => c.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Manage Courses</h1>
                    <p className="text-muted-foreground text-sm mt-1">{total} total courses</p>
                </div>
                <div className="flex items-center gap-3">
                    {pendingCount > 0 && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                            ⚠️ {pendingCount} pending
                        </span>
                    )}
                    <button
                        onClick={() => {
                            fetchCategories();
                            setShowCreateModal(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all"
                    >
                        <PlusCircle className="w-5 h-5" /> Add Course
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card p-4 rounded-2xl border border-border flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2 rounded-xl border border-border bg-background focus:outline-none text-sm"
                >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="pending">Pending</option>
                    <option value="draft">Draft</option>
                    <option value="rejected">Rejected</option>
                </select>
                <button onClick={fetchCourses} className="p-2 rounded-xl border border-border hover:bg-muted">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : courses.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No courses found</p>
                        <button onClick={() => setShowCreateModal(true)} className="mt-3 text-sm text-primary hover:underline">
                            Create the first one →
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 font-medium">Course</th>
                                    <th className="p-4 font-medium">Instructor</th>
                                    <th className="p-4 font-medium">Price</th>
                                    <th className="p-4 font-medium">Students</th>
                                    <th className="p-4 font-medium">Rating</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {courses.map((course) => (
                                    <tr key={course._id} className="hover:bg-muted/20 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {course.thumbnail ? (
                                                    <img src={course.thumbnail} alt="" className="w-12 h-9 rounded-lg object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-12 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <BookOpen className="w-5 h-5 text-primary" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold line-clamp-1 max-w-44">{course.title}</p>
                                                    <p className="text-xs text-muted-foreground">{course.category?.name || 'Uncategorized'} · {course.level}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm">{course.instructor?.name || '—'}</p>
                                            <p className="text-xs text-muted-foreground">{course.instructor?.email || ''}</p>
                                        </td>
                                        <td className="p-4 font-semibold">
                                            {course.isFree ? <span className="text-green-600">Free</span> : `$${course.finalPrice?.toFixed(2) || course.price?.toFixed(2)}`}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span>{course.totalStudents || 0}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                                <span>{course.averageRating?.toFixed(1) || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[course.status] || STATUS_COLORS.draft}`}>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5">
                                                {course.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(course._id)}
                                                            title="Approve"
                                                            className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 text-green-600"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectModal({ open: true, courseId: course._id, reason: '' })}
                                                            title="Reject"
                                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {(course.status === 'published' || course.status === 'unpublished') && (
                                                    <button
                                                        onClick={() => handleTogglePublish(course._id, course.isPublished)}
                                                        title={course.isPublished ? 'Delist Course' : 'List Course'}
                                                        className={`p-1.5 rounded-lg ${course.isPublished
                                                            ? 'hover:bg-orange-50 dark:hover:bg-orange-950/30 text-orange-600'
                                                            : 'hover:bg-green-50 dark:hover:bg-green-950/30 text-green-600'}`}
                                                    >
                                                        {course.isPublished ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/courses/${course.slug}`)}
                                                    title="View"
                                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(course._id, course.title)}
                                                    title="Delete"
                                                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-between text-sm">
                        <p className="text-muted-foreground">Page {page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Course Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
                    <div className="bg-card rounded-2xl border border-border w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <PlusCircle className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">Create New Course</h2>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground">✕</button>
                        </div>
                        <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
                            {/* Thumbnail Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Course Thumbnail/Logo</label>
                                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                        className="hidden"
                                        id="thumbnail-input"
                                    />
                                    <label htmlFor="thumbnail-input" className="cursor-pointer">
                                        {thumbnailPreview ? (
                                            <div className="space-y-2">
                                                <img src={thumbnailPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg mx-auto" />
                                                <p className="text-xs text-muted-foreground">Click to change image</p>
                                            </div>
                                        ) : (
                                            <div className="py-6">
                                                <div className="text-4xl mb-2">📸</div>
                                                <p className="font-medium text-sm">Click to upload course thumbnail</p>
                                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 5MB</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Title & Description */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Course Title *</label>
                                <input
                                    type="text"
                                    value={createForm.title}
                                    onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g. Complete React Developer Course"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Description *</label>
                                <textarea
                                    value={createForm.description}
                                    onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Describe what students will learn..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                                    required
                                />
                            </div>

                            {/* Category, Price, Level, Language */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Category *</label>
                                    <select
                                        value={createForm.category}
                                        onChange={e => setCreateForm(p => ({ ...p, category: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none"
                                        required
                                        disabled={categoriesLoading}
                                    >
                                        <option value="">{categoriesLoading ? 'Loading categories...' : 'Select category'}</option>
                                        {categories.length > 0 ? (
                                            categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))
                                        ) : (
                                            <option disabled>No categories available</option>
                                        )}
                                    </select>
                                    {categories.length === 0 && !categoriesLoading && (
                                        <p className="text-xs text-red-500 mt-1">No categories found. Please create categories first.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Price ($) *</label>
                                    <input
                                        type="number"
                                        value={createForm.price}
                                        onChange={e => setCreateForm(p => ({ ...p, price: e.target.value }))}
                                        placeholder="e.g. 49.99"
                                        min="0" step="0.01"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Level</label>
                                    <select
                                        value={createForm.level}
                                        onChange={e => setCreateForm(p => ({ ...p, level: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none"
                                    >
                                        {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map(l => <option key={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Language</label>
                                    <select
                                        value={createForm.language}
                                        onChange={e => setCreateForm(p => ({ ...p, language: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none"
                                    >
                                        {['English', 'Hindi', 'Spanish', 'French', 'German'].map(l => <option key={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* What you'll learn */}
                            <div>
                                <label className="block text-sm font-medium mb-2">What Students Will Learn</label>
                                <div className="space-y-2">
                                    {createForm.whatYouLearn.map((item, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            value={item}
                                            onChange={e => {
                                                const updated = [...createForm.whatYouLearn];
                                                updated[idx] = e.target.value;
                                                setCreateForm(p => ({ ...p, whatYouLearn: updated }));
                                            }}
                                            placeholder={`Learning point ${idx + 1}...`}
                                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                                        />
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCreateForm(p => ({ ...p, whatYouLearn: [...p.whatYouLearn, ''] }))}
                                    className="mt-2 text-xs text-primary hover:underline"
                                >
                                    + Add more learning points
                                </button>
                            </div>

                            {/* Instructor Info - Read Only */}
                            <div className="bg-muted/50 p-4 rounded-xl">
                                <p className="text-xs text-muted-foreground mb-2">Instructor</p>
                                <p className="font-semibold">Admin User</p>
                                <p className="text-sm text-muted-foreground">This course will be created by and assigned to the admin account</p>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted font-medium">
                                    Cancel
                                </button>
                                <button type="submit" disabled={createLoading}
                                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {createLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                                    {createLoading ? 'Creating...' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-card rounded-2xl border border-border w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-600">
                            <XCircle className="w-5 h-5" /> Reject Course
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">Provide a reason so the instructor can improve their course.</p>
                        <textarea
                            value={rejectModal.reason}
                            onChange={e => setRejectModal(r => ({ ...r, reason: e.target.value }))}
                            placeholder="e.g. Course content needs improvement, videos are low quality..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-red-400 focus:outline-none resize-none mb-4"
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setRejectModal({ open: false, courseId: null, reason: '' })}
                                className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted font-medium">
                                Cancel
                            </button>
                            <button onClick={handleReject}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700">
                                Reject Course
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
