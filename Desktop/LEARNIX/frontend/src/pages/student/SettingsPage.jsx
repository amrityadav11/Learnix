import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, setTheme } from '../../redux/slices/uiSlice';
import { Bell, Mail, Shield, Globe, Moon, Sun, CheckCircle, AlertCircle, GraduationCap } from 'lucide-react';

export default function SettingsPage() {
    const dispatch = useDispatch();
    const { user } = useSelector((s) => s.auth);
    const { theme } = useSelector((s) => s.ui);

    const [notifications, setNotifications] = useState({
        email: user?.emailNotifications !== false,
        push: user?.pushNotifications !== false,
        marketing: true,
        updates: true,
        recommendations: true,
    });

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <h1 className="text-3xl font-bold">Settings</h1>

            <div className="space-y-6">
                {/* Appearance */}
                <div className="bg-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold">Appearance</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                            <div className="flex items-center gap-3">
                                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                <div>
                                    <h4 className="font-medium">Dark Mode</h4>
                                    <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                                </div>
                            </div>
                            <button
                                onClick={() => dispatch(toggleTheme())}
                                className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <Bell className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold">Notifications</h2>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(notifications).map(([key, enabled]) => (
                            <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </div>
                                <button
                                    onClick={() => toggleNotification(key)}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security */}
                <div className="bg-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold">Security</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <h4 className="font-medium">Two-Factor Authentication</h4>
                                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                                </div>
                            </div>
                            <button className="w-12 h-6 rounded-full bg-muted relative transition-colors">
                                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <h4 className="font-medium">Active Sessions</h4>
                                    <p className="text-sm text-muted-foreground">Manage your active logins</p>
                                </div>
                            </div>
                            <button className="text-primary hover:underline text-sm">Manage</button>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-2xl">
                    <h2 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
                    <p className="text-muted-foreground text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <button className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm font-medium">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}
