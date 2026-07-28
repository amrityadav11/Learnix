import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
                    <GraduationCap className="w-16 h-16 text-muted-foreground" />
                </div>
                <h1 className="text-8xl font-bold text-primary/20 mb-4">404</h1>
                <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link to="/" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all">
                        Go Home
                    </Link>
                    <Link to="/courses" className="px-6 py-3 rounded-xl border border-border hover:bg-muted font-medium transition-all">
                        Browse Courses
                    </Link>
                </div>
            </div>
        </div>
    );
}
