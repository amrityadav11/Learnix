import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, Search, User, ShoppingBag, GraduationCap } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { toggleMobileSidebar } from '../../redux/slices/uiSlice';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useSelector((s) => s.auth);
    const cartCount = useSelector((s) => s.cart.items.length);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const navLinks = [
        { label: 'Home', to: '/' },
        { label: 'Courses', to: '/courses' },
        { label: 'Blogs', to: '/blogs' },
        { label: 'About', to: '/about' },
        { label: 'Contact', to: '/contact' },
    ];

    return (
        <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg gradient-text">LEARNIX</span>
                </NavLink>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.label}
                            to={link.to}
                            className={({ isActive }) =>
                                `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center bg-muted/50 rounded-lg px-3 py-1.5">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="ml-2 bg-transparent border-none focus:ring-0 text-sm w-40"
                        />
                    </div>
                    <ThemeToggle />
                    {user ? (
                        <div className="flex items-center gap-2">
                            {user.role === 'student' && (
                                <NavLink
                                    to="/cart"
                                    className="relative p-2 rounded-lg hover:bg-muted"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    {cartCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </NavLink>
                            )}
                            <button
                                onClick={() => dispatch(toggleMobileSidebar())}
                                className="md:hidden p-2 rounded-lg hover:bg-muted"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <NavLink
                                to={user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/dashboard'}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
                            >
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="hidden md:block text-sm font-medium">{user.name}</span>
                            </NavLink>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <NavLink
                                to="/login"
                                className="px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                            >
                                Login
                            </NavLink>
                            <NavLink
                                to="/register"
                                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                Get Started
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-40 bg-background">
                        <div className="p-4 flex items-center justify-between border-b border-border">
                            <span className="font-bold text-lg gradient-text">LEARNIX</span>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-lg hover:bg-muted">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="flex flex-col p-4 space-y-2">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.label}
                                    to={link.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="px-4 py-2 rounded-lg hover:bg-muted"
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                            {user ? (
                                <button
                                    onClick={() => {
                                        dispatch(toggleMobileSidebar());
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted"
                                >
                                    <User className="w-5 h-5" />
                                    {user.role === 'admin' ? 'Admin Panel' : user.role === 'instructor' ? 'Instructor Panel' : 'Dashboard'}
                                </button>
                            ) : (
                                <div className="flex flex-col gap-2 mt-4">
                                    <NavLink to="/login" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 rounded-lg hover:bg-muted text-center">
                                        Login
                                    </NavLink>
                                    <NavLink to="/register" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-center">
                                        Get Started
                                    </NavLink>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
