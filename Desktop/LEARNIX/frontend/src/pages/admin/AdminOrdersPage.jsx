import { useState } from 'react';
import { Search, Download, Eye, RefreshCw } from 'lucide-react';

const MOCK_ORDERS = [
    { id: 'INV-001', user: 'Alice Kumar', email: 'alice@example.com', amount: 47.99, method: 'Stripe', status: 'completed', date: '2024-01-20', courses: 1 },
    { id: 'INV-002', user: 'Bob Smith', email: 'bob@example.com', amount: 53.99, method: 'Razorpay', status: 'completed', date: '2024-01-19', courses: 1 },
    { id: 'INV-003', user: 'Carol Johnson', email: 'carol@example.com', amount: 71.99, method: 'Stripe', status: 'refunded', date: '2024-01-18', courses: 2 },
    { id: 'INV-004', user: 'David Lee', email: 'david@example.com', amount: 0, method: 'Free', status: 'completed', date: '2024-01-17', courses: 1 },
    { id: 'INV-005', user: 'Eve Williams', email: 'eve@example.com', amount: 39.99, method: 'Stripe', status: 'pending', date: '2024-01-16', courses: 1 },
];

export default function AdminOrdersPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const orders = MOCK_ORDERS.filter(o =>
        (statusFilter === 'all' || o.status === statusFilter) &&
        (o.user.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()))
    );

    const totalRevenue = MOCK_ORDERS.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Manage Orders</h1>
                <div className="text-sm text-muted-foreground">
                    Total Revenue: <span className="font-bold text-foreground text-base">${totalRevenue.toFixed(2)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Orders', value: MOCK_ORDERS.length, color: 'bg-blue-500' },
                    { label: 'Completed', value: MOCK_ORDERS.filter(o => o.status === 'completed').length, color: 'bg-green-500' },
                    { label: 'Pending', value: MOCK_ORDERS.filter(o => o.status === 'pending').length, color: 'bg-yellow-500' },
                    { label: 'Refunded', value: MOCK_ORDERS.filter(o => o.status === 'refunded').length, color: 'bg-red-500' },
                ].map((s, i) => (
                    <div key={i} className="bg-card p-4 rounded-2xl flex items-center gap-4">
                        <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-white font-bold`}>{s.value}</div>
                        <span className="text-sm text-muted-foreground">{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="bg-card p-4 rounded-2xl flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none text-sm">
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="refunded">Refunded</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            <div className="bg-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 text-sm">
                            <tr>
                                <th className="p-4 font-medium">Invoice</th>
                                <th className="p-4 font-medium">Customer</th>
                                <th className="p-4 font-medium">Amount</th>
                                <th className="p-4 font-medium">Method</th>
                                <th className="p-4 font-medium">Courses</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="border-t border-border hover:bg-muted/20">
                                    <td className="p-4 font-mono text-sm">{order.id}</td>
                                    <td className="p-4">
                                        <p className="font-medium text-sm">{order.user}</p>
                                        <p className="text-xs text-muted-foreground">{order.email}</p>
                                    </td>
                                    <td className="p-4 font-medium">${order.amount.toFixed(2)}</td>
                                    <td className="p-4 text-sm text-muted-foreground">{order.method}</td>
                                    <td className="p-4 text-sm text-muted-foreground">{order.courses}</td>
                                    <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>{order.status}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-1.5 rounded-lg hover:bg-muted"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                                            <button className="p-1.5 rounded-lg hover:bg-muted"><Download className="w-4 h-4 text-muted-foreground" /></button>
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
