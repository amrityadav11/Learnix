import { useNavigate } from 'react-router-dom';
import { CheckCircle, GraduationCap } from 'lucide-react';

export default function PaymentSuccessPage() {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Payment Successful! 🎉</h1>
                <p className="text-muted-foreground mb-8">
                    Your payment was processed successfully. You've been enrolled in all selected courses.
                </p>
                <div className="bg-card p-6 rounded-2xl mb-8 text-left">
                    <h3 className="font-semibold mb-4">Order Details</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className="text-green-600 font-medium">Completed</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Payment Method</span>
                            <span className="font-medium">Stripe</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-medium">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={() => navigate('/dashboard/my-learning')} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                        Start Learning
                    </button>
                    <button onClick={() => navigate('/')} className="px-8 py-3 rounded-xl border border-border hover:bg-muted font-medium">
                        Browse More Courses
                    </button>
                </div>
            </div>
        </div>
    );
}
