import { useState } from 'react';
import { Star, Trash2, CheckCircle, Flag } from 'lucide-react';

const MOCK_REVIEWS = [
    { id: 1, user: 'Alice Kumar', course: 'Complete React.js Course', rating: 5, comment: 'Excellent course! Learned so much.', date: '2024-01-20', status: 'approved', reported: false },
    { id: 2, user: 'Bob Smith', course: 'Python for Data Science', rating: 4, comment: 'Great content, very well structured.', date: '2024-01-18', status: 'approved', reported: false },
    { id: 3, user: 'Carol Johnson', course: 'Node.js Backend', rating: 2, comment: 'Content is outdated and hard to follow.', date: '2024-01-15', status: 'pending', reported: true },
    { id: 4, user: 'David Lee', course: 'AWS Cloud Practitioner', rating: 5, comment: 'Perfect preparation for the exam!', date: '2024-01-12', status: 'approved', reported: false },
];

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState(MOCK_REVIEWS);
    const [filter, setFilter] = useState('all');

    const filtered = reviews.filter(r => filter === 'all' || (filter === 'reported' ? r.reported : r.status === filter));

    const handleDelete = (id) => {
        if (window.confirm('Delete this review?')) setReviews(prev => prev.filter(r => r.id !== id));
    };

    const handleApprove = (id) => {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'approved', reported: false } : r));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Manage Reviews</h1>
                <span className="text-sm text-muted-foreground">{reviews.filter(r => r.reported).length} reported</span>
            </div>

            <div className="flex gap-2 flex-wrap">
                {['all', 'approved', 'pending', 'reported'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'}`}>
                        {f}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filtered.map((review) => (
                    <div key={review.id} className={`bg-card p-5 rounded-2xl border ${review.reported ? 'border-red-200' : 'border-border'}`}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">{review.user[0]}</div>
                                    <div>
                                        <span className="font-semibold text-sm">{review.user}</span>
                                        <span className="text-muted-foreground text-sm"> on </span>
                                        <span className="font-medium text-sm">{review.course}</span>
                                    </div>
                                    <div className="flex items-center gap-1 ml-auto">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-muted-foreground">{review.date}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${review.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{review.status}</span>
                                    {review.reported && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1"><Flag className="w-3 h-3" /> Reported</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {review.status !== 'approved' && (
                                    <button onClick={() => handleApprove(review.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"><CheckCircle className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => handleDelete(review.id)} className="p-1.5 rounded-lg hover:bg-muted"><Trash2 className="w-4 h-4 text-destructive" /></button>
                            </div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">No reviews found</div>}
            </div>
        </div>
    );
}
