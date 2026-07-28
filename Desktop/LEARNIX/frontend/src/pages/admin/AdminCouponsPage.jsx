import { useState } from 'react';
import { Plus, Trash2, Ticket } from 'lucide-react';

const MOCK_COUPONS = [
    { id: 1, code: 'WELCOME50', type: 'percentage', discount: 50, maxDiscount: 30, minOrder: 0, used: 45, maxUsage: 100, validUntil: '2025-12-31', status: 'active' },
    { id: 2, code: 'FLAT20', type: 'fixed', discount: 20, maxDiscount: null, minOrder: 50, used: 120, maxUsage: 200, validUntil: '2025-06-30', status: 'active' },
    { id: 3, code: 'NEWUSER30', type: 'percentage', discount: 30, maxDiscount: 15, minOrder: 0, used: 200, maxUsage: 200, validUntil: '2024-12-31', status: 'expired' },
];

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState(MOCK_COUPONS);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ code: '', type: 'percentage', discount: '', maxDiscount: '', minOrder: 0, maxUsage: 100, validUntil: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        setCoupons([...coupons, { ...form, id: coupons.length + 1, used: 0, status: 'active' }]);
        setShowForm(false);
        setForm({ code: '', type: 'percentage', discount: '', maxDiscount: '', minOrder: 0, maxUsage: 100, validUntil: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Manage Coupons</h1>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                    <Plus className="w-4 h-4" /> Create Coupon
                </button>
            </div>

            {showForm && (
                <div className="bg-card p-6 rounded-2xl border border-border">
                    <h2 className="font-semibold mb-4">New Coupon</h2>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="COUPON CODE" className="px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none uppercase font-mono" />
                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-4 py-2 rounded-xl border border-border bg-background focus:outline-none">
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount ($)</option>
                        </select>
                        <input required type="number" min="1" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="Discount value" className="px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                        <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="Max discount ($, optional)" className="px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                        <input type="number" min="0" value={form.maxUsage} onChange={(e) => setForm({ ...form, maxUsage: e.target.value })} placeholder="Max usage" className="px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                        <input required type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                        <div className="md:col-span-3 flex gap-3">
                            <button type="submit" className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium">Create Coupon</button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl border border-border hover:bg-muted">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coupon) => (
                    <div key={coupon.id} className="bg-card p-6 rounded-2xl border border-dashed border-border hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <Ticket className="w-5 h-5 text-primary" />
                                </div>
                                <span className="font-bold font-mono text-lg">{coupon.code}</span>
                            </div>
                            <button onClick={() => setCoupons(prev => prev.filter(c => c.id !== coupon.id))} className="p-1.5 rounded-lg hover:bg-muted">
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="font-medium">{coupon.discount}{coupon.type === 'percentage' ? '%' : '$'} off</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Used</span>
                                <span className="font-medium">{coupon.used}/{coupon.maxUsage}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Valid until</span>
                                <span className="font-medium">{coupon.validUntil}</span>
                            </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mb-3">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, (coupon.used / coupon.maxUsage) * 100)}%` }} />
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {coupon.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
