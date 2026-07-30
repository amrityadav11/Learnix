import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, HelpCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

export default function InstructorQuizzesPage() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [expandedQuiz, setExpandedQuiz] = useState(null);
    const [formData, setFormData] = useState({
        courseId: '',
        title: '',
        description: '',
        timeLimit: 60,
        passingScore: 60
    });
    const [courses, setCourses] = useState([]);

    // Fetch quizzes and courses
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quizRes, courseRes] = await Promise.all([
                    axios.get('/api/v1/instructor/quizzes', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get('/api/v1/courses/instructor', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);
                setQuizzes(quizRes.data.data);
                setCourses(courseRes.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load quizzes');
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
                await axios.put(`/api/v1/instructor/quizzes/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            } else {
                await axios.post('/api/v1/instructor/quizzes', formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            }
            // Refresh quizzes
            const res = await axios.get('/api/v1/instructor/quizzes', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setQuizzes(res.data.data);
            setFormData({ courseId: '', title: '', description: '', timeLimit: 60, passingScore: 60 });
            setShowForm(false);
            setEditingId(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;
        try {
            await axios.delete(`/api/v1/instructor/quizzes/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setQuizzes(quizzes.filter(q => q._id !== id));
        } catch (err) {
            setError('Failed to delete quiz');
        }
    };

    const handleEdit = (quiz) => {
        setEditingId(quiz._id);
        setFormData({
            courseId: quiz.course._id,
            title: quiz.title,
            description: quiz.description,
            timeLimit: quiz.timeLimit,
            passingScore: quiz.passingScore
        });
        setShowForm(true);
    };

    if (loading && !showForm) return <div className="flex items-center justify-center p-8"><Loader className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Quizzes</h1>
                    <p className="text-muted-foreground mt-2">Create and manage course quizzes</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setFormData({ courseId: '', title: '', description: '', timeLimit: 60, passingScore: 60 });
                    }}
                    className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> New Quiz
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
                    <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Quiz' : 'Create New Quiz'}</h2>
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
                            <label className="block text-sm font-medium mb-2">Quiz Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Quiz title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Quiz description"
                                rows="3"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
                                <input
                                    type="number"
                                    value={formData.timeLimit}
                                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                                    min="1"
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
                                <input
                                    type="number"
                                    value={formData.passingScore}
                                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                                    min="0"
                                    max="100"
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

            {/* Quizzes List */}
            <div className="space-y-4">
                {quizzes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No quizzes yet. Create one to get started!</p>
                ) : (
                    quizzes.map((quiz, i) => (
                        <motion.div
                            key={quiz._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-card rounded-xl p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <HelpCircle className="w-5 h-5 text-primary" />
                                        <h3 className="text-lg font-bold">{quiz.title}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">{quiz.course.title}</p>
                                    <p className="text-sm mb-4">{quiz.description}</p>

                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div className="bg-muted/50 rounded-lg p-3">
                                            <p className="text-muted-foreground text-xs">Time Limit</p>
                                            <p className="font-bold">{quiz.timeLimit} min</p>
                                        </div>
                                        <div className="bg-muted/50 rounded-lg p-3">
                                            <p className="text-muted-foreground text-xs">Passing Score</p>
                                            <p className="font-bold">{quiz.passingScore}%</p>
                                        </div>
                                        <div className="bg-muted/50 rounded-lg p-3">
                                            <p className="text-muted-foreground text-xs">Questions</p>
                                            <p className="font-bold">{quiz.questions?.length || 0}</p>
                                        </div>
                                    </div>

                                    {expandedQuiz === quiz._id && quiz.questions && quiz.questions.length > 0 && (
                                        <div className="mt-4 pt-4 border-t space-y-3">
                                            <h4 className="font-bold">Questions</h4>
                                            {quiz.questions.map((q, idx) => (
                                                <div key={idx} className="bg-muted/30 p-3 rounded-lg text-sm">
                                                    <p className="font-medium">{idx + 1}. {q.question}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Type: {q.type} | Points: {q.points}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => setExpandedQuiz(expandedQuiz === quiz._id ? null : quiz._id)}
                                        className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-600"
                                    >
                                        <HelpCircle className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(quiz)}
                                        className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-600"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(quiz._id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-600"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
