import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Check, X, AlertCircle, Loader, MessageSquare } from 'lucide-react';
import axios from 'axios';

export default function InstructorReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [stats, setStats] = useState({});

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`/api/v1/instructor/reviews?status=${filter}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setReviews(res.data.data);
                setStats(res.data.stats);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load reviews');
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [filter]);

    const handleApprove = async (reviewId) => {
        try {
            await axios.put(
                `/api/v1/instructor/reviews/${reviewId}`,
                { isApproved: true },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setReviews(reviews.map(r => r._id === reviewId ? { ...r, isApproved: true } : r));
        } catch (err) {
            setError('Failed to approve review');
        }
    };

    const handleReject = async (reviewId) => {
        try {
            await axios.put(
                `/api/v1/instructor/reviews/${reviewId}`,
                { isApproved: false },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setReviews(reviews.map(r => r._id === reviewId ? { ...r, isApproved: false } : r));
        } catch (err) {
            setError('Failed to reject review');
        }
    };

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) return;
        try {
            await axios.put(
                `/api/v1/instructor/reviews/${reviewId}`,
                { replyText },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setReviews(reviews.map(r =>
                r._id === reviewId
                    ? { ...r, instructorReply: { text: replyText, repliedAt: new Date() } }
                    : r
            ));
            setReplyingTo(null);
            setReplyText('');
        } catch (err) {
            setError('Failed to send reply');
        }
    };

    if (loading) return <div className="flex items-center justify-center p-8"><Loader className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Student Reviews</h1>
                <p className="text-muted-foreground mt-2">Manage and respond to student reviews</p>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{error}</span>
                </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                    <p className="text-2xl font-bold">{stats.total || 0}</p>
                </div>
                <div className="bg-card rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
                </div>
                <div className="bg-card rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pending || 0}</p>
                </div>
                <div className="bg-card rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.averageRating || 0}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-3">
                {['all', 'approved', 'pending'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === f
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No reviews found.</p>
                ) : (
                    reviews.map((review, i) => (
                        <motion.div
                            key={review._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-card rounded-xl p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                    <img
                                        src={review.user?.avatar || 'https://via.placeholder.com/50'}
                                        alt={review.user?.name}
                                        className="w-12 h-12 rounded-full"
                                    />
                                    <div>
                                        <h3 className="font-bold">{review.user?.name}</h3>
                                        <p className="text-sm text-muted-foreground">{review.course?.title}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {!review.isApproved && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(review._id)}
                                            className="p-2 hover:bg-green-500/10 rounded-lg text-green-600"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleReject(review._id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-600"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                                {review.isApproved && (
                                    <span className="px-3 py-1 bg-green-500/10 text-green-600 text-xs font-medium rounded-full">
                                        Approved
                                    </span>
                                )}
                            </div>

                            <p className="text-sm mb-4">{review.content}</p>

                            {/* Instructor Reply */}
                            {review.instructorReply ? (
                                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Your Reply</p>
                                    <p className="text-sm">{review.instructorReply.text}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {new Date(review.instructorReply.repliedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {replyingTo !== review._id && (
                                        <button
                                            onClick={() => setReplyingTo(review._id)}
                                            className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                                        >
                                            <MessageSquare className="w-4 h-4" /> Reply
                                        </button>
                                    )}

                                    {replyingTo === review._id && (
                                        <div className="mt-4 space-y-3">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Write your reply..."
                                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                rows="3"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleReply(review._id)}
                                                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
                                                >
                                                    Send Reply
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(null);
                                                        setReplyText('');
                                                    }}
                                                    className="px-4 py-2 rounded-lg bg-muted font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <p className="text-xs text-muted-foreground mt-4">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
