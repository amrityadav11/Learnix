import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, BookOpen, GraduationCap } from 'lucide-react';

export default function EditCoursePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: 'Complete React.js Developer Course',
        subtitle: 'Build modern web apps with React, Redux, and Next.js',
        description: 'Master React.js from the ground up. This comprehensive course covers everything from React basics to advanced patterns.',
        price: '49.99',
        discount: '20',
        level: 'Beginner',
        language: 'English',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        navigate('/instructor/courses');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <button onClick={() => navigate('/instructor/courses')} className="text-primary hover:underline text-sm mb-2 block">
                        ← Back to Courses
                    </button>
                    <h1 className="text-3xl font-bold">Edit Course</h1>
                    <p className="text-muted-foreground">Course ID: {id}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-card p-6 rounded-2xl space-y-4">
                    <h2 className="font-semibold flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" /> Basic Information
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Course Title</label>
                            <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Subtitle</label>
                            <input value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Price ($)</label>
                                <input type="number" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Discount (%)</label>
                                <input type="number" min="0" max="100" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Level</label>
                                <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none">
                                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All Levels</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Language</label>
                                <select value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none">
                                    <option>English</option><option>Hindi</option><option>Spanish</option><option>French</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50">
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => navigate('/instructor/courses')} className="px-6 py-3 rounded-xl border border-border hover:bg-muted font-medium">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
