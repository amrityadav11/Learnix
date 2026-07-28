import { useState, useEffect, useCallback } from 'react';
import {
    Search, Edit, Trash2, Ban, CheckCircle, Users, GraduationCap,
    Award, ChevronLeft, ChevronRight, RefreshCw, UserPlus, X, Shield
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    instructor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    student: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState({ total: 0, students: 0, instructors: 0, admins: 0 });
    const [editModal, setEditModal] = useState({ open: false, user: null });
    const [editForm, setEditForm] = useState({});
    const [editLoading, setEditLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (roleFilter !== 'all') params.role = roleFilter;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (search) params.search = search;
            const { data } = await api.get('/admin/users', { params });
            setUsers(data.users || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [page, roleFilter, statusFilter, search]);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats({
                total: data.stats?.totalUsers || 0,
                students: data.stats?.totalStudents || 0,
                instructors: data.stats?.totalInstructors || 0,
                admins: data.stats?.totalUsers - (data.stats?.totalStudents || 0) - (data.stats?.totalInstructors || 0),
            });
        } catch { }
    };

    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    useEffect(() => { fetchStats(); }, []);

    useEffect(() => {
        const t = setTimeout(() => { setPage(1); }, 500);
        return () => clearTimeout(t);
    }, [search]);

    const handleSuspend = async (user) => {
        try {
            await api.put(`/admin/users/${user._id}`, { isSuspended: !user.isSuspended });
            toast.success(user.isSuspended ? 'User activated' : 'User suspended');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/users/${user._id}`);
            toast.success('User deleted');
            fetchUsers();
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleOpenEdit = (user) => {
        setEditForm({ name: user.name, role: user.role, isEmailVerified: user.isEmailVerified, isApprovedInstructor: user.isApprovedInstructor });
        setEditModal({ open: true, user });
    };

    const handleEditSave = async () => {
        setEditLoading(true);
        try {
            await api.put(`/admin/users/${editModal.user._id}`, editForm);
            toast.success('User updated');
            setEditModal({ open: false, user: null });
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Manage Users</h1>
                    <p className="text-sm text-muted-foreground mt-1">{total.toLocaleString()} total users</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: stats.total, icon: Users, color: 'bg-gray-500' },
                    { label: 'Students', value: stats.students, icon: GraduationCap, color: 'bg-blue-500' },
                    { label: 'Instructors', value: stats.instructors, icon: Award, color: 'bg-purple-500' },
                    { label: 'Admins', value: stats.admins > 0 ? stats.admins : 1, icon: Shield, color: 'bg-red-500' },
                ].map((s, i) => (
                    <div key={i} className="bg-card p-4 rounded-2xl border border-border flex items-center gap-3">
                        <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <s.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-card p-4 rounded-2xl border border-border flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    />
                </div>
                <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2 rounded-xl border border-border bg-background focus:outline-none text-sm">
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="instructor">Instructors</option>
                    <option value="admin">Admins</option>
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2 rounded-xl border border-border bg-background focus:outline-none text-sm">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>
                <button onClick={fetchUsers} className="p-2 rounded-xl border border-border hover:bg-muted">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>
                ) : users.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 font-medium">User</th>
                                    <th className="p-4 font-medium">Role</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Enrolled</th>
                                    <th className="p-4 font-medium">Joined</th>
                                    <th className="p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-muted/20 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                        {user.name?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[user.role] || ROLE_COLORS.student}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-semibold ${user.isSuspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {user.isSuspended ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                                {user.isSuspended ? 'Suspended' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{user.enrolledCourses?.length || 0}</td>
                                        <td className="p-4 text-muted-foreground">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => handleOpenEdit(user)} title="Edit"
                                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleSuspend(user)} title={user.isSuspended ? 'Activate' : 'Suspend'}
                                                    className={`p-1.5 rounded-lg hover:bg-muted ${user.isSuspended ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {user.isSuspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                </button>
                                                <button onClick={() => handleDelete(user)} title="Delete"
                                                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-between text-sm">
                        <p className="text-muted-foreground">Page {page} of {totalPages} · {total} users</p>
                        <div className="flex gap-2">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit User Modal */}
            {editModal.open && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-card rounded-2xl border border-border w-full max-w-md p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold">Edit User</h2>
                            <button onClick={() => setEditModal({ open: false, user: null })} className="p-2 hover:bg-muted rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Name</label>
                                <input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Role</label>
                                <select value={editForm.role || ''} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none">
                                    <option value="student">Student</option>
                                    <option value="instructor">Instructor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="emailVerified" checked={editForm.isEmailVerified || false}
                                    onChange={e => setEditForm(f => ({ ...f, isEmailVerified: e.target.checked }))}
                                    className="w-4 h-4 accent-primary" />
                                <label htmlFor="emailVerified" className="text-sm font-medium">Email Verified</label>
                            </div>
                            {editForm.role === 'instructor' && (
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="approvedInstructor" checked={editForm.isApprovedInstructor || false}
                                        onChange={e => setEditForm(f => ({ ...f, isApprovedInstructor: e.target.checked }))}
                                        className="w-4 h-4 accent-primary" />
                                    <label htmlFor="approvedInstructor" className="text-sm font-medium">Approved Instructor</label>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setEditModal({ open: false, user: null })}
                                className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted font-medium">Cancel</button>
                            <button onClick={handleEditSave} disabled={editLoading}
                                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                                {editLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
