import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Calendar, Clock, Search } from 'lucide-react';

export default function BlogsPage() {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Implement API call
        setLoading(false);
    }, []);

    const filteredBlogs = blogs.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Latest Articles & Resources</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Expert insights, tutorials, and news from the education community</p>
            </div>

            <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search articles..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.map((blog) => (
                        <div
                            key={blog._id}
                            onClick={() => navigate(`/blogs/${blog.slug}`)}
                            className="bg-card rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute top-3 left-3 bg-primary/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                    {blog.category}
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{blog.readTime} min read</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{blog.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
