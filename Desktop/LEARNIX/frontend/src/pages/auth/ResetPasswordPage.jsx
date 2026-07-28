import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, GraduationCap } from 'lucide-react';

export default function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match");
            return;
        }
        setLoading(true);
        // TODO: Implement API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
                    <p className="text-muted-foreground">Enter your new password below</p>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="bg-card p-6 md:p-8 rounded-2xl shadow-xl">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-card p-8 rounded-2xl shadow-xl text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Password Updated!</h3>
                        <p className="text-muted-foreground mb-4">Your password has been successfully changed.</p>
                        <p className="text-sm text-muted-foreground animate-pulse">
                            Redirecting to login...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
