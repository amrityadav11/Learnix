import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingBag, Menu, X, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navigation() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(s => s.auth);
    const { items: cartItems } = useSelector(s => s.cart);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
        window.location.reload();
    };

    return (
        <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                        📚 CourseLab
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/courses" className="text-gray-700 hover:text-primary transition">Courses</Link>
                        <Link to="/about" className="text-gray-700 hover:text-primary transition">About</Link>
                        <Link to="/contact" className="text-gray-700 hover:text-primary transition">Contact</Link>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="hidden sm:flex items-center bg-gray-100 rounded-lg px-3 py-2">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-sm ml-2 w-32"
                            />
                        </div>

                        {/* Cart */}
                        <button onClick={() => navigate('/cart')} className="relative p-2 hover:bg-gray-100 rounded-lg">
                            <ShoppingBag className="w-5 h-5" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>

                        {/* Auth */}
                        {user ? (
                            <div className="flex items-center gap-2">
                                <Link to="/dashboard" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className="px-3 py-2 text-gray-700 hover:bg-red-50 rounded-lg text-red-600">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="hidden sm:flex gap-2">
                                <button onClick={() => navigate('/login')} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                                    Sign In
                                </button>
                                <button onClick={() => navigate('/register')} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                                    Sign Up
                                </button>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
                            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        <Link to="/courses" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                            Courses
                        </Link>
                        <Link to="/about" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                            About
                        </Link>
                        {user ? (
                            <>
                                <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => navigate('/login')} className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                                    Sign In
                                </button>
                                <button onClick={() => navigate('/register')} className="w-full px-4 py-2 bg-primary text-white rounded-lg">
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
