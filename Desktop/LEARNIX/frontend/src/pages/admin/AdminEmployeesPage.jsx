import { useState, useEffect, useCallback } from 'react';
import {
    Search, Edit, Trash2, Plus, ChevronLeft, ChevronRight, RefreshCw,
    X, UserPlus, Mail, Phone, Briefcase, Building2
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminEmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        departmentId: '',
        roleId: '',
        managerId: '',
        dob: '',
        gender: 'other',
        address: '',
        city: '',
        state: '',
        pinCode: '',
        country: '',
    });

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (deptFilter !== 'all') params.departmentId = deptFilter;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (search) params.search = search;
            const { data } = await api.get('/employee', { params });
            setEmployees(data.employees || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (err) {
            toast.error('Failed to load employees');
        } finally {
            setLoading(false);
        }
    }, [page, deptFilter, statusFilter, search]);

    const fetchDepartments = async () => {
        try {
            const { data } = await api.get('/admin/departments');
            setDepartments(data.departments || []);
        } catch (err) {
            console.error('Failed to fetch departments', err);
            toast.error(err.response?.data?.message || 'Failed to fetch departments');
        }
    };

    const fetchRoles = async () => {
        try {
            const { data } = await api.get('/admin/roles');
            setRoles(data.roles || []);
        } catch (err) {
            console.error('Failed to fetch roles', err);
            toast.error(err.response?.data?.message || 'Failed to fetch roles');
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        fetchDepartments();
        fetchRoles();
    }, []);

    useEffect(() => {
        const t = setTimeout(() => { setPage(1); }, 500);
        return () => clearTimeout(t);
    }, [search]);

    const handleOpenModal = (employee = null) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                firstName: employee.firstName || '',
                lastName: employee.lastName || '',
                email: employee.email || '',
                phone: employee.phone || '',
                jobTitle: employee.jobTitle || '',
                departmentId: employee.department?._id || '',
                roleId: employee.role?._id || '',
                managerId: employee.manager?._id || '',
                dob: employee.dob?.split('T')[0] || '',
                gender: employee.gender || 'other',
                address: employee.address || '',
                city: employee.city || '',
                state: employee.state || '',
                pinCode: employee.pinCode || '',
                country: employee.country || '',
            });
        } else {
            setEditingEmployee(null);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                jobTitle: '',
                departmentId: '',
                roleId: '',
                managerId: '',
                dob: '',
                gender: 'other',
                address: '',
                city: '',
                state: '',
                pinCode: '',
                country: '',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingEmployee(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.departmentId || !formData.roleId) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            if (editingEmployee) {
                await api.put(`/employee/${editingEmployee._id}`, formData);
                toast.success('Employee updated successfully');
            } else {
                await api.post('/employee', formData);
                toast.success('Employee created successfully');
            }
            handleCloseModal();
            fetchEmployees();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (employee) => {
        if (!window.confirm(`Delete employee "${employee.firstName} ${employee.lastName}"?`)) return;
        try {
            await api.delete(`/employee/${employee._id}`);
            toast.success('Employee deleted');
            fetchEmployees();
        } catch (err) {
            toast.error('Failed to delete employee');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Employee Management</h1>
                <p className="text-slate-400">Create and manage employee profiles</p>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4 md:p-6 mb-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-slate-200 text-sm">Total Employees</p>
                        <p className="text-3xl font-bold">{total}</p>
                    </div>
                    <UserPlus size={40} className="opacity-50" />
                </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-800 rounded-lg shadow-lg p-4 md:p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                        />
                    </div>

                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                    >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                        <option value="resigned">Resigned</option>
                    </select>

                    <button
                        onClick={() => fetchEmployees()}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded border border-slate-600 flex items-center justify-center gap-2 transition"
                    >
                        <RefreshCw size={18} /> Refresh
                    </button>

                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition"
                    >
                        <Plus size={18} /> Add Employee
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm md:text-base">
                        <thead className="bg-slate-700">
                            <tr className="text-left text-slate-300">
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Job Title</th>
                                <th className="p-4">Department</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-4 text-center text-slate-400">Loading...</td>
                                </tr>
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-4 text-center text-slate-400">No employees found</td>
                                </tr>
                            ) : (
                                employees.map(emp => (
                                    <tr key={emp._id} className="border-t border-slate-700 hover:bg-slate-700/50 transition">
                                        <td className="p-4 text-white">{emp.firstName} {emp.lastName}</td>
                                        <td className="p-4 text-slate-300 flex items-center gap-2">
                                            <Mail size={14} /> {emp.email}
                                        </td>
                                        <td className="p-4 text-slate-300 flex items-center gap-2">
                                            <Briefcase size={14} /> {emp.jobTitle}
                                        </td>
                                        <td className="p-4 text-slate-300 flex items-center gap-2">
                                            <Building2 size={14} /> {emp.department?.name || 'N/A'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${emp.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                emp.status === 'on_leave' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(emp)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp)}
                                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-slate-700 p-4 flex items-center justify-between">
                        <span className="text-slate-400 text-sm">
                            Page {page} of {totalPages} • Total: {total} employees
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white px-3 py-1 rounded transition"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white px-3 py-1 rounded transition"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
                            <h2 className="text-xl font-bold text-white">
                                {editingEmployee ? 'Edit Employee' : 'Create New Employee'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name *"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name *"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                />
                            </div>

                            {/* Contact Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email *"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone *"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                />
                            </div>

                            {/* Job Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="jobTitle"
                                    placeholder="Job Title *"
                                    value={formData.jobTitle}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                />
                                <select
                                    name="departmentId"
                                    value={formData.departmentId}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                >
                                    <option value="">Select Department *</option>
                                    {departments.map(dept => (
                                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Role & Manager */}
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    name="roleId"
                                    value={formData.roleId}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                >
                                    <option value="">Select Role *</option>
                                    {roles.map(role => (
                                        <option key={role._id} value={role._id}>{role.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    name="managerId"
                                    placeholder="Manager ID (optional)"
                                    value={formData.managerId}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                />
                            </div>

                            {/* Personal Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    name="dob"
                                    placeholder="Date of Birth"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                />
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                >
                                    <option value="other">Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Address Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                />
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                />
                                <input
                                    type="text"
                                    name="pinCode"
                                    placeholder="Pin Code"
                                    value={formData.pinCode}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                />
                                <input
                                    type="text"
                                    name="country"
                                    placeholder="Country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
                                >
                                    {editingEmployee ? 'Update Employee' : 'Create Employee'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-semibold transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
