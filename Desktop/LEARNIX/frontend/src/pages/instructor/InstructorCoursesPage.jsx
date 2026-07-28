import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, MoreHorizontal, BookOpen, Users, Star } from 'lucide-react';

const MOCK_COURSES = [
    { id: 1, title: 'Complete React.js Developer Course', students: 450, revenue: '$18K', rating: 4.9, status: 'published', thumbnail: 'https://ui-avatars.com/api/?name=React&background=6366f1&color=fff' },
    { id: 2, title: 'Advanced TypeScript Patterns', students: 230, revenue: '$9.5K', rating: 4.7, status: 'published', thumbnail: 'https://ui-avatars.com/api/?name=TypeScript&background=3b82f6&color=fff' },
    { id: 3, title: 'Next.js Full Stack Development', students: 0, revenue: '$0', rating: 0, status: 'draft', thumbnail: 'https://ui-avatars.com/api/?name=Next&background=18181b&color=fff' },
    { id: 4, title: 'Node.js Microservices Architecture', students: 0, revenue: '$0', rating: 0, status: 'pending', thumbnail: 'https://ui-avatars.com/api/?name=Node&background=84cc16&color=fff' },
];

export default function InstructorCoursesPage() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState(MOCK_COURSES);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            setCourses(prev => prev.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">My Courses</h1>
                <button onClick={() => navigate('create')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90">
                    <Plus className="w-4 h-4" /> Create New Course
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Courses', value: courses.length },
                    { label: 'Published', value: courses.filter(c => c.status === 'published').length },
                    { label: 'Total Students', value: courses.reduce((s, c) => s + c.students, 0) },
                    { label: 'Pending Review', value: courses.filter(c => c.status === 'pending').length },
                ].map((s, i) => (
                    <div key={i} className="bg-card p-5 rounded-2xl">
                        <h3 className="text-2xl font-bold mb-1">{s.value}</h3>
                        <p className="text-sm text-muted-foreground">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="bg-card rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                        <div className="relative h-40 overflow-hidden">
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                            <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${course.status === 'published' ? 'bg-green-500 text-white' :
                                    course.status === 'pending' ? 'bg-yellow-500 text-white' :
                                        'bg-gray-500 text-white'
                                }`}>
                                {course.status}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold mb-3 line-clamp-2">{course.title}</h3>
                            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                                <div className="bg-muted/40 p-2 rounded-lg">
                                    <Users className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                                    <p className="text-sm font-semibold">{course.students}</p>
                                    <p className="text-[10px] text-muted-foreground">Students</p>
                                </div>
                                <div className="bg-muted/40 p-2 rounded-lg">
                                    <Star className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                                    <p className="text-sm font-semibold">{course.rating || 'N/A'}</p>
                                    <p className="text-[10px] text-muted-foreground">Rating</p>
                                </div>
                                <div className="bg-muted/40 p-2 rounded-lg">
                                    <BookOpen className="w-4 h-4 mx-auto mb-1 text-green-500" />
                                    <p className="text-sm font-semibold">{course.revenue}</p>
                                    <p className="text-[10px] text-muted-foreground">Revenue</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => navigate(`${course.id}/edit`)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium">
                                    <Edit className="w-4 h-4" /> Edit
                                </button>
                                <button className="p-2 rounded-lg border border-border hover:bg-muted">
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(course.id)} className="p-2 rounded-lg border border-border hover:bg-red-50 text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
