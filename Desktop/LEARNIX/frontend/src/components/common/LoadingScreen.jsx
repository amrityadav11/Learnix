import { GraduationCap } from 'lucide-react';

export default function LoadingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center animate-bounce">
                    <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <p className="text-muted-foreground text-sm">Loading LEARNIX...</p>
            </div>
        </div>
    );
}
