import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';

const MOCK_BLOGS = [
    { id: 1, title: 'Top 10 Programming Languages in 2024', category: 'Technology', views: 12500, status: 'published', date: '2024-01-15' },
    { id: 2, title: 'How to Learn Data Science from Scratch', category: 'Education', views: 8900, status: 'published', date: '2024-01-12' },
    { id: 3, title: 'The Future of AI in Education', category: 'AI', views: 7200, status: 'draft', date: '2024-01-10' },
    { id: 4, title: 'Best Practices for Remote Learning', category: 'Education', views: 5400, status: 'published', date: '2024-01-08' },
];

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState(MOCK_BLOGS);

    const handleDelete = (id) => {
        if (window.confirm('Delete this blog?')) setBlogs(prev => prev.filter(b => b.id !== id));
    };

    const toggleStatus = (id) => {
        setBlogs(prev => prev.map(b => b.id === id ? { ...b, status: b.status === 'published' ? 'draft' : 'published' } : b));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Manage Blogs</h1>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                    <Plus className="w-4 h-4" /> New Blog Post
                </button>
            </div>

            <div className="bg-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 text-sm">
                            <tr>
                                <th className="p-4 font-medium">Title</th>
                                <th className="p-4 font-medium">Category</th>
                                <th className="p-4 font-medium">Views</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.map((blog) => (
                                <tr key={blog.id} className="border-t border-border hover:bg-muted/20">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                            <span className="font-medium text-sm line-clamp-1 max-w-64">{blog.title}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">{blog.category}</td>
                                    <td className="p-4 text-sm text-muted-foreground">{blog.views.toLocaleString()}</td>
                                    <td className="p-4 text-sm text-muted-foreground">{blog.date}</td>
                                    <td className="p-4">
                                        <button onClick={() => toggleStatus(blog.id)} className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${blog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {blog.status}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-1.5 rounded-lg hover:bg-muted"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                                            <button className="p-1.5 rounded-lg hover:bg-muted"><Edit className="w-4 h-4 text-muted-foreground" /></button>
                                            <button onClick={() => handleDelete(blog.id)} className="p-1.5 rounded-lg hover:bg-muted"><Trash2 className="w-4 h-4 text-destructive" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
