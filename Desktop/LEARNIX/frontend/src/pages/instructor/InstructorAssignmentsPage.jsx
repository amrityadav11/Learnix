import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

export default function InstructorAssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [formData, setFormData] = useState({
        courseId: '',
        title: '',
        description: '',
        dueDate: '',
        maxScore: 100
    });
    const [courses, setCourses] = useState([]);

    // Fetch assignments and courses
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assignRes, courseRes] = await Promise.all([
                    axios.get('/api/v1/instructor/assignments', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get('/api/v1/courses/instructor', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);
                setAssignments(assignRes.data.data);
                setCourses(courseRes.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load assignments');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (editingId) {
                await axios.put(`/api/v1/instructor/assignments/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            } else {
                await axios.post('/api/v1/instructor/assignments', formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            }
            // Refresh assignments
            const res = await axios.get('/api/v1/instructor/assignments', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAssignments(res.data.data);
            setFormData({ courseId: '', title: '', description: '', dueDate: '', maxScore: 100 });
            setShowForm(false);
            setEditingId(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save assignment');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        try {
            await axios.delete(`/api/v1/instructor/assignments/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAssignments(assignments.filter(a => a._id !== id));
        } catch (err) {
            setError('Failed to delete assignment');
        }
    };

    const handleEdit = (assignment) => {
        setEditingId(assignment._id);
        setFormData({
            courseId: assignment.course._id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate?.split('T')[0],
            maxScore: assignment.maxScore
        });
        setShowForm(true);
    };

    if (loading && !showForm) return <div className="flex items-center justify-center p-8"><Loader className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Assignments</h1>
                    <p className="text-muted-foreground mt-2">Create and manage course assignments</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setFormData({ courseId: '', title: '', description: '', dueDate: '', maxScore: 100 });
                    }}
                    className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> New Assignment
                </button>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{error}</span>
                </motion.div>
            )}

            {/* Create/Edit Form */}
            {showForm && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Assignment' : 'Create New Assignment'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Course</label>
                            <select
                                value={formData.courseId}
                                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                required
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Select a course...</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c._id}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Assignment title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Assignment description"
                                rows="4"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Due Date</label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Max Score</label>
                                <input
                                    type="number"
                                    value={formData.maxScore}
                                    onChange={(e) => setFormData({ ...formData, maxScore: parseFloat(e.target.value) })}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium">
                                {editingId ? 'Update' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                }}
                                className="flex-1 px-6 py-3 rounded-lg bg-muted font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Assignments List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assignments.length === 0 ? (
                    <p className="col-span-full text-muted-foreground text-center py-8">No assignments yet. Create one to get started!</p>
                ) : (
                    assignments.map((assignment, i) => (
                        <motion.div
                            key={assignment._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-card rounded-xl p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold">{assignment.title}</h3>
                                    <p className="text-sm text-muted-foreground">{assignment.course.title}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(assignment)}
                                        className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-600"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(assignment._id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-600"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Max Score: {assignment.maxScore}</span>
                                </div>
                            </div>

                            {assignment.submissions && assignment.submissions.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm font-medium mb-2">
                                        Submissions: {assignment.submissions.filter(s => s.isGraded).length} / {assignment.submissions.length}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
