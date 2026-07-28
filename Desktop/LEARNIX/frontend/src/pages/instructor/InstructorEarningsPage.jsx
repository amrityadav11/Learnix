import { DollarSign, TrendingUp, Users, CreditCard, Download } from 'lucide-react';

const MONTHLY_DATA = [
    { month: 'Aug', revenue: 1200 }, { month: 'Sep', revenue: 1850 },
    { month: 'Oct', revenue: 1640 }, { month: 'Nov', revenue: 2100 },
    { month: 'Dec', revenue: 2800 }, { month: 'Jan', revenue: 2500 },
];

const TRANSACTIONS = [
    { id: 'TXN-001', student: 'Alice Kumar', course: 'React.js Developer Course', amount: 39.99, date: '2024-01-20', status: 'credited' },
    { id: 'TXN-002', student: 'Bob Smith', course: 'TypeScript Patterns', amount: 34.99, date: '2024-01-19', status: 'credited' },
    { id: 'TXN-003', student: 'Carol Johnson', course: 'React.js Developer Course', amount: 39.99, date: '2024-01-18', status: 'credited' },
    { id: 'TXN-004', student: 'David Lee', course: 'React.js Developer Course', amount: 39.99, date: '2024-01-15', status: 'pending' },
];

const maxRevenue = Math.max(...MONTHLY_DATA.map(d => d.revenue));

export default function InstructorEarningsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Earnings & Revenue</h1>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted text-sm">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Earnings', value: '$12,500', icon: DollarSign, color: 'bg-green-500', sub: '+12% this month' },
                    { label: 'Pending Payout', value: '$2,340', icon: TrendingUp, color: 'bg-yellow-500', sub: 'Next payout Jan 31' },
                    { label: 'Withdrawn', value: '$8,200', icon: CreditCard, color: 'bg-blue-500', sub: 'Lifetime total' },
                    { label: 'Total Students', value: '1,250', icon: Users, color: 'bg-purple-500', sub: '+45 this month' },
                ].map((s, i) => (
                    <div key={i} className="bg-card p-5 rounded-2xl">
                        <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                            <s.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{s.value}</h3>
                        <p className="text-sm text-muted-foreground">{s.label}</p>
                        <p className="text-xs text-primary mt-1">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Revenue Chart (simple bar) */}
            <div className="bg-card p-6 rounded-2xl">
                <h2 className="font-semibold mb-6">Monthly Revenue</h2>
                <div className="flex items-end gap-4 h-40">
                    {MONTHLY_DATA.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium">${d.revenue}</span>
                            <div
                                className="w-full rounded-t-lg bg-primary/80 hover:bg-primary transition-colors"
                                style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                            />
                            <span className="text-xs text-muted-foreground">{d.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-card rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold">Recent Transactions</h2>
                    <span className="text-sm text-muted-foreground">{TRANSACTIONS.length} transactions</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 text-sm">
                            <tr>
                                <th className="p-4 font-medium">Transaction ID</th>
                                <th className="p-4 font-medium">Student</th>
                                <th className="p-4 font-medium">Course</th>
                                <th className="p-4 font-medium">Amount</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {TRANSACTIONS.map((txn) => (
                                <tr key={txn.id} className="border-t border-border hover:bg-muted/20">
                                    <td className="p-4 font-mono text-sm">{txn.id}</td>
                                    <td className="p-4 text-sm font-medium">{txn.student}</td>
                                    <td className="p-4 text-sm text-muted-foreground line-clamp-1 max-w-40">{txn.course}</td>
                                    <td className="p-4 text-sm font-semibold text-green-600">+${txn.amount}</td>
                                    <td className="p-4 text-sm text-muted-foreground">{txn.date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${txn.status === 'credited' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Withdraw */}
            <div className="bg-card p-6 rounded-2xl">
                <h2 className="font-semibold mb-4">Request Withdrawal</h2>
                <p className="text-sm text-muted-foreground mb-4">Available balance: <span className="font-bold text-foreground">$2,340.00</span></p>
                <div className="flex gap-4">
                    <input type="number" placeholder="Amount to withdraw" className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                    <button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90">
                        Request Payout
                    </button>
                </div>
            </div>
        </div>
    );
}
