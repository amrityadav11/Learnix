import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, GraduationCap, CheckCircle } from 'lucide-react';

export default function WishlistPage() {
    const navigate = useNavigate();
    const wishlist = [
        {
            title: 'Advanced Python Programming',
            instructor: 'Prof. Michael Chen',
            price: 59.99,
            discount: 20,
            finalPrice: 47.99,
            rating: 4.8,
            thumbnail: 'https://ui-avatars.com/api/?name=Python&background=06b6d4&color=fff',
        },
        {
            title: 'Full Stack Web Development',
            instructor: 'Dr. Sarah Johnson',
            price: 79.99,
            discount: 0,
            finalPrice: 79.99,
            rating: 4.9,
            thumbnail: 'https://ui-avatars.com/api/?name=Full+Stack&background=6366f1&color=fff',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">My Wishlist</h1>
                <span className="text-muted-foreground">{wishlist.length} saved courses</span>
            </div>

            {wishlist.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-2xl">
                    <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No saved courses</h3>
                    <p className="text-muted-foreground mb-6">Courses you save will appear here</p>
                    <button onClick={() => navigate('/courses')} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium">
                        Browse Courses
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((course, i) => (
                        <div key={i} className="bg-card rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
                            <div className="relative h-40 overflow-hidden">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute top-3 right-3">
                                    <button className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
                                        <Heart className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold mb-2">{course.title}</h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{course.instructor}</span>
                                </div>
                                <div className="flex items-center gap-1 mb-3">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-medium">{course.rating}</span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <span className="text-lg font-bold text-primary">${course.finalPrice}</span>
                                    {course.discount > 0 && <span className="text-sm text-muted-foreground line-through">${course.price}</span>}
                                    <button
                                        onClick={() => navigate(`/courses/${course.title.toLowerCase().replace(/\s+/g, '-')}`)}
                                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                                    >
                                        Enroll Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
