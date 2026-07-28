import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', icon: '📚', color: '#6366f1' });
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/categories');
            setCategories(data.categories || []);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            return toast.error('Category name is required');
        }
        setSubmitLoading(true);
        try {
            const { data } = await api.post('/admin/categories', {
                name: formData.name,
                icon: formData.icon,
                color: formData.color,
                slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
            });
            setCategories([...categories, data.category]);
            setFormData({ name: '', icon: '📚', color: '#6366f1' });
            setShowForm(false);
            toast.success('Category created!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create category');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            setCategories(prev => prev.filter(c => c._id !== id));
            toast.success('Category deleted!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Manage Categories</h1>
                <div className="flex items-center gap-2">
                    <button onClick={fetchCategories} className="p-2 rounded-xl border border-border hover:bg-muted">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium">
                        <Plus className="w-4 h-4" /> Add Category
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-card p-6 rounded-2xl border border-border">
                    <h2 className="font-semibold mb-4">New Category</h2>
                    <form onSubmit={handleAdd} className="flex flex-wrap gap-4">
                        <input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Category name"
                            className="flex-1 min-w-40 px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <input
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            placeholder="Icon (emoji)"
                            className="w-24 px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-center text-2xl"
                        />
                        <input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="w-12 h-10 rounded-xl border border-border cursor-pointer"
                        />
                        <button type="submit" disabled={submitLoading} className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50">
                            {submitLoading ? 'Creating...' : 'Save'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl border border-border hover:bg-muted">
                            Cancel
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-2xl">
                    <p className="text-muted-foreground mb-4">No categories yet. Create one to get started!</p>
                    <button onClick={() => setShowForm(true)} className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium">
                        Create First Category
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                        <div key={cat._id} className="bg-card p-5 rounded-2xl hover:shadow-lg transition-all group border border-border">
                            <div className="flex items-start justify-between mb-3">
                                <div className="text-3xl">{cat.icon}</div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDelete(cat._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30">
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-semibold mb-1">{cat.name}</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{cat.slug}</span>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
