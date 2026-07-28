import { useState } from 'react';
import { Save, Globe, DollarSign, Mail, Shield, GraduationCap } from 'lucide-react';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        siteName: 'LEARNIX',
        siteDescription: 'Learn anything, anywhere.',
        contactEmail: 'support@learnix.com',
        currency: 'USD',
        instructorCommission: 70,
        platformFee: 30,
        requireEmailVerification: true,
        requireInstructorApproval: true,
        enableStripe: true,
        enableRazorpay: true,
        maintenanceMode: false,
        enableChat: true,
        enableCertificates: true,
        enableReferral: true,
        referralBonus: 10,
    });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const Toggle = ({ field, label, desc }) => (
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30">
            <div>
                <p className="font-medium text-sm">{label}</p>
                {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
            </div>
            <button
                onClick={() => setSettings(prev => ({ ...prev, [field]: !prev[field] }))}
                className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${settings[field] ? 'bg-primary' : 'bg-muted'}`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${settings[field] ? 'left-6' : 'left-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Site Settings</h1>
                <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${saved ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                    <Save className="w-4 h-4" />
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* General */}
            <div className="bg-card p-6 rounded-2xl space-y-4">
                <h2 className="font-semibold flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> General</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Site Name</label>
                        <input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Contact Email</label>
                        <input value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Site Description</label>
                        <textarea value={settings.siteDescription} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" rows={2} />
                    </div>
                </div>
            </div>

            {/* Payment */}
            <div className="bg-card p-6 rounded-2xl space-y-4">
                <h2 className="font-semibold flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500" /> Payment & Revenue</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Currency</label>
                        <select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none">
                            <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Instructor Commission (%)</label>
                        <input type="number" min="0" max="100" value={settings.instructorCommission} onChange={(e) => setSettings({ ...settings, instructorCommission: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Platform Fee (%)</label>
                        <input type="number" min="0" max="100" value={settings.platformFee} onChange={(e) => setSettings({ ...settings, platformFee: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Toggle field="enableStripe" label="Enable Stripe" desc="Accept Stripe payments" />
                    <Toggle field="enableRazorpay" label="Enable Razorpay" desc="Accept Razorpay payments" />
                </div>
            </div>

            {/* Security & Features */}
            <div className="bg-card p-6 rounded-2xl space-y-2">
                <h2 className="font-semibold flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-blue-500" /> Security & Features</h2>
                <Toggle field="requireEmailVerification" label="Require Email Verification" desc="Users must verify their email after signup" />
                <Toggle field="requireInstructorApproval" label="Require Instructor Approval" desc="New instructor accounts require admin approval" />
                <Toggle field="maintenanceMode" label="Maintenance Mode" desc="Take the site offline for maintenance" />
                <Toggle field="enableChat" label="Enable Messaging" desc="Allow student-instructor messaging" />
                <Toggle field="enableCertificates" label="Enable Certificates" desc="Issue completion certificates" />
                <Toggle field="enableReferral" label="Enable Referral Program" desc="Allow users to earn referral bonuses" />
            </div>
        </div>
    );
}
