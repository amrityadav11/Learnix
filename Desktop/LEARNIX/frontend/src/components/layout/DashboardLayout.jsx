import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, BookOpen, Heart, Award, Bell, MessageSquare,
    ShoppingBag, User, Settings, LogOut, Menu, X, GraduationCap
} from 'lucide-react';
import { logoutUser } from '../../redux/slices/authSlice';
import { toggleMobileSidebar, closeMobileSidebar } from '../../redux/slices/uiSlice';
import ThemeToggle from '../common/ThemeToggle';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/dashboard/my-learning', icon: BookOpen, label: 'My Learning' },
    { to: '/dashboard/wishlist', icon: Heart, label: 'Wishlist' },
    { to: '/dashboard/certificates', icon: Award, label: 'Certificates' },
    { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
    { to: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/dashboard/orders', icon: ShoppingBag, label: 'Order History' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

function SidebarContent({ onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((s) => s.auth);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-base gradient-text">LEARNIX</span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="md:hidden p-1.5 rounded-lg hover:bg-muted">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* User info */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff`}
                        alt={user?.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
                    />
                    <div className="overflow-hidden">
                        <p className="font-semibold text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 p-3 overflow-y-auto space-y-1">
                {navItems.map(({ to, icon: Icon, label, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`
                        }
                    >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-border space-y-2">
                {user?.role !== 'student' && (
                    <button
                        onClick={() => { navigate(`/${user.role}`); onClose?.(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        {user?.role === 'admin' ? 'Admin Panel' : 'Instructor Panel'}
                    </button>
                )}
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

export default function DashboardLayout() {
    const dispatch = useDispatch();
    const { mobileSidebarOpen } = useSelector((s) => s.ui);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                            onClick={() => dispatch(closeMobileSidebar())}
                        />
                        <motion.aside
                            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-card border-r border-border"
                        >
                            <SidebarContent onClose={() => dispatch(closeMobileSidebar())} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
                    <button
                        onClick={() => dispatch(toggleMobileSidebar())}
                        className="md:hidden p-2 rounded-lg hover:bg-muted"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
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
