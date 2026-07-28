import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GraduationCap, Calendar, Clock, Share2, MessageSquare, ThumbsUp } from 'lucide-react';

export default function BlogDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Implement API call
        setLoading(false);
    }, [slug]);

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (!blog) return <div className="text-center py-20">Blog not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/blogs')} className="text-primary hover:underline mb-6">← Back to Blog</button>
                <h1 className="text-3xl md:text-4xl font-bold mb-6">{blog.title}</h1>

                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
                    <div className="flex items-center gap-2">
                        <img src={blog.author?.avatar} className="w-8 h-8 rounded-full" />
                        <span>{blog.author?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{blog.readTime} min read</span>
                    </div>
                </div>

                <img src={blog.thumbnail} alt={blog.title} className="w-full rounded-2xl mb-8" />

                <div className="prose max-w-none mb-12">
                    <p className="text-lg text-muted-foreground mb-6">{blog.excerpt}</p>
                    {blog.content}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-6">
                    <div className="flex gap-2">
                        {blog.tags?.map(tag => (
                            <span key={tag} className="bg-muted px-3 py-1 rounded-full text-xs">#{tag}</span>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                            <ThumbsUp className="w-5 h-5" />
                            <span>{blog.totalLikes} Likes</span>
                        </button>
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                            <MessageSquare className="w-5 h-5" />
                            <span>{blog.totalComments} Comments</span>
                        </button>
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                            <Share2 className="w-5 h-5" />
                            Share
                        </button>
                    </div>
                </div>

                {/* Author */}
                <div className="mt-12 p-6 bg-muted/30 rounded-2xl flex items-center gap-4">
                    <img src={blog.author?.avatar} className="w-16 h-16 rounded-full" />
                    <div>
                        <h3 className="font-bold text-lg">{blog.author?.name}</h3>
                        <p className="text-sm text-muted-foreground">{blog.author?.bio}</p>
                    </div>
                </div>

                {/* Comments */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Comments ({blog.totalComments})</h2>
                    <div className="space-y-4">
                        {/* Add comment form */}
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                U
                            </div>
                            <div className="flex-1">
                                <textarea className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:outline-none" rows="3" placeholder="Add a comment..." />
                                <button className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Post Comment</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
