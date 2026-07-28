import { useState } from 'react';
import { Search, Users, BookOpen, Star, MessageSquare } from 'lucide-react';

const MOCK_STUDENTS = [
    { id: 1, name: 'Alice Kumar', email: 'alice@example.com', course: 'Complete React.js Developer Course', progress: 85, enrolled: '2024-01-01', lastActive: '2 hours ago' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', course: 'TypeScript Patterns', progress: 60, enrolled: '2024-01-05', lastActive: '1 day ago' },
    { id: 3, name: 'Carol Johnson', email: 'carol@example.com', course: 'Complete React.js Developer Course', progress: 100, enrolled: '2024-01-10', lastActive: '3 days ago' },
    { id: 4, name: 'David Lee', email: 'david@example.com', course: 'TypeScript Patterns', progress: 30, enrolled: '2024-01-12', lastActive: '1 week ago' },
    { id: 5, name: 'Eve Williams', email: 'eve@example.com', course: 'Complete React.js Developer Course', progress: 45, enrolled: '2024-01-15', lastActive: '5 hours ago' },
];

export default function InstructorStudentsPage() {
    const [search, setSearch] = useState('');
    const students = MOCK_STUDENTS.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">My Students</h1>
                <span className="text-muted-foreground text-sm">{MOCK_STUDENTS.length} total students</span>
            </div>

            {/* Overview stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Students', value: MOCK_STUDENTS.length, icon: Users },
                    { label: 'Completed', value: MOCK_STUDENTS.filter(s => s.progress === 100).length, icon: BookOpen },
                    { label: 'Active Today', value: 2, icon: Star },
                    { label: 'Avg Progress', value: `${Math.round(MOCK_STUDENTS.reduce((sum, s) => sum + s.progress, 0) / MOCK_STUDENTS.length)}%`, icon: BookOpen },
                ].map((s, i) => (
                    <div key={i} className="bg-card p-5 rounded-2xl">
                        <h3 className="text-2xl font-bold mb-1">{s.value}</h3>
                        <p className="text-sm text-muted-foreground">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search students..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                />
            </div>

            {/* Students Table */}
            <div className="bg-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 text-sm">
                            <tr>
                                <th className="p-4 font-medium">Student</th>
                                <th className="p-4 font-medium">Course</th>
                                <th className="p-4 font-medium">Progress</th>
                                <th className="p-4 font-medium">Enrolled</th>
                                <th className="p-4 font-medium">Last Active</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s.id} className="border-t border-border hover:bg-muted/20">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">{s.name[0]}</div>
                                            <div>
                                                <p className="font-medium text-sm">{s.name}</p>
                                                <p className="text-xs text-muted-foreground">{s.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground max-w-40">
                                        <span className="line-clamp-1">{s.course}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-muted rounded-full h-2">
                                                <div className={`h-2 rounded-full ${s.progress === 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${s.progress}%` }} />
                                            </div>
                                            <span className="text-xs text-muted-foreground">{s.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">{s.enrolled}</td>
                                    <td className="p-4 text-sm text-muted-foreground">{s.lastActive}</td>
                                    <td className="p-4">
                                        <button className="p-1.5 rounded-lg hover:bg-muted" title="Message">
                                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                        </button>
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
