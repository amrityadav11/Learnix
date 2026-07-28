import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <main className="pt-20">
                <Outlet />
            </main>
        </div>
    );
}
