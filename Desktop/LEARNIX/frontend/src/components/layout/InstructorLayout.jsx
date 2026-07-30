import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, BookOpen, PlusCircle, DollarSign, Users,
    LogOut, Menu, X, GraduationCap, ChevronRight
} from 'lucide-react';
import { logoutUser } from '../../redux/slices/authSlice';
import ThemeToggle from '../common/ThemeToggle';

const navItems = [
    { to: '/instructor', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/instructor/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/instructor/courses/create', icon: PlusCircle, label: 'Create Course' },
    { to: '/instructor/upload-videos', icon: BookOpen, label: 'Upload Videos' },
    { to: '/instructor/assignments', icon: BookOpen, label: 'Assignments' },
    { to: '/instructor/quizzes', icon: BookOpen, label: 'Quizzes' },
    { to: '/instructor/reviews', icon: BookOpen, label: 'Reviews' },
    { to: '/instructor/analytics', icon: BookOpen, label: 'Analytics' },
    { to: '/instructor/students', icon: Users, label: 'Students' },
    { to: '/instructor/earnings', icon: DollarSign, label: 'Earnings' },
    { to: '/instructor/withdraw', icon: DollarSign, label: 'Withdraw' },
];

function InstructorSidebar({ onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/');
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-sm block gradient-text">LEARNIX</span>
                        <span className="text-xs text-muted-foreground">Instructor</span>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="md:hidden p-1.5 rounded-lg hover:bg-muted">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map(({ to, icon: Icon, label, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`
                        }
                    >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1">{label}</span>
                        <ChevronRight className="w-3 h-3 opacity-40" />
                    </NavLink>
                ))}
            </nav>
            <div className="p-3 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}

export default function InstructorLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card/50">
                <InstructorSidebar />
            </aside>
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 z-40 bg-black/50"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-card border-r border-border"
                        >
                            <InstructorSidebar onClose={() => setMobileOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
                    <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-muted">
                        <Menu className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-semibold hidden md:block">Instructor Panel</h1>
                    <div className="flex items-center gap-2 ml-auto">
                        <ThemeToggle />
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
