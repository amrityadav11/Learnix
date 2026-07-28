import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, X, Mail, RefreshCw } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { verifyEmail, resendVerificationEmail } from '../../redux/slices/authSlice';
import { toast } from 'react-hot-toast';

const VerifyEmailPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [status, setStatus] = useState('verifying');
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (token) {
            handleVerification();
        }
    }, [token]);

    const handleVerification = async () => {
        try {
            await dispatch(verifyEmail(token)).unwrap();
            setStatus('success');
            toast.success('Email verified successfully!');
            setTimeout(() => {
                navigate('/auth/login');
            }, 3000);
        } catch (error) {
            setStatus('error');
            toast.error(error.message || 'Verification failed');
        }
    };

    const handleResendVerification = async () => {
        setResending(true);
        try {
            await dispatch(resendVerificationEmail()).unwrap();
            toast.success('Verification email sent!');
        } catch (error) {
            toast.error(error.message || 'Failed to send verification email');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center">
                    {status === 'verifying' && (
                        <>
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Verifying Email
                            </h1>
                            <p className="text-gray-600">
                                Please wait while we verify your email address...
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Email Verified!
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Your email has been successfully verified. You can now log in to your account.
                            </p>
                            <button
                                onClick={() => navigate('/auth/login')}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Continue to Login
                            </button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X className="w-8 h-8 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Verification Failed
                            </h1>
                            <p className="text-gray-600 mb-6">
                                The verification link is invalid or has expired. Please request a new verification email.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={handleResendVerification}
                                    disabled={resending}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Mail className="w-4 h-4" />
                                    {resending ? 'Sending...' : 'Resend Verification Email'}
                                </button>
                                <button
                                    onClick={() => navigate('/auth/login')}
                                    className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;