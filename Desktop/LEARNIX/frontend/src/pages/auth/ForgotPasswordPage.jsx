import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, GraduationCap } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                    <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                    <p className="text-muted-foreground">Enter your email and we'll send you a reset link</p>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="bg-card p-6 md:p-8 rounded-2xl shadow-xl">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Remember your password?{' '}
                            <Link to="/login" className="text-primary font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </form>
                ) : (
                    <div className="bg-card p-8 rounded-2xl shadow-xl text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Check Your Email</h3>
                        <p className="text-muted-foreground mb-4">
                            We've sent a password reset link to {email}. Please check your inbox.
                        </p>
                        <p className="text-sm text-muted-foreground animate-pulse">
                            Redirecting to login...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
