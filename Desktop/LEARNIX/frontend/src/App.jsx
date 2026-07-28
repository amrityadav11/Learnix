import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice';

// Layout
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import InstructorLayout from './components/layout/InstructorLayout';

// Public Pages
import HomePage from './pages/home/HomePage';
import CoursesPage from './pages/home/CoursesPage';
import CourseDetailPage from './pages/home/CourseDetailPage';
import CategoryPage from './pages/home/CategoryPage';
import BlogsPage from './pages/home/BlogsPage';
import BlogDetailPage from './pages/home/BlogDetailPage';
import AboutPage from './pages/home/AboutPage';
import ContactPage from './pages/home/ContactPage';
import VerifyCertificatePage from './pages/home/VerifyCertificatePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import NotFoundPage from './pages/home/NotFoundPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyLearningPage from './pages/student/MyLearningPage';
import CoursePlayerPage from './pages/student/CoursePlayerPage';
import WishlistPage from './pages/student/WishlistPage';
import CartPage from './pages/student/CartPage';
import ProfilePage from './pages/student/ProfilePage';
import SettingsPage from './pages/student/SettingsPage';
import CertificatesPage from './pages/student/CertificatesPage';
import NotificationsPage from './pages/student/NotificationsPage';
import MessagesPage from './pages/student/MessagesPage';
import OrderHistoryPage from './pages/student/OrderHistoryPage';
import CheckoutPage from './pages/student/CheckoutPage';
import PaymentSuccessPage from './pages/student/PaymentSuccessPage';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCoursePage from './pages/instructor/CreateCoursePage';
import EditCoursePage from './pages/instructor/EditCoursePage';
import InstructorCoursesPage from './pages/instructor/InstructorCoursesPage';
import InstructorEarningsPage from './pages/instructor/InstructorEarningsPage';
import InstructorStudentsPage from './pages/instructor/InstructorStudentsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminBlogsPage from './pages/admin/AdminBlogsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';

// Misc
import LoadingScreen from './components/common/LoadingScreen';

// Protected route wrappers
const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useSelector((s) => s.auth);
    if (loading) return <LoadingScreen />;
    if (!user) return <Navigate to="/login" replace />;
    if (role && !role.includes(user.role)) return <Navigate to="/" replace />;
    return children;
};

const GuestRoute = ({ children }) => {
    const { user } = useSelector((s) => s.auth);
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
};

export default function App() {
    const dispatch = useDispatch();
    const { loading } = useSelector((s) => s.auth);

    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    // Apply dark mode from localStorage
    useEffect(() => {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, []);

    if (loading) return <LoadingScreen />;

    return (
        <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:slug" element={<CourseDetailPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/blogs" element={<BlogsPage />} />
                <Route path="/blogs/:slug" element={<BlogDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/verify-certificate/:id" element={<VerifyCertificatePage />} />
            </Route>

            {/* Auth routes */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
            <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

            {/* Student / common dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<StudentDashboard />} />
                <Route path="my-learning" element={<MyLearningPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="certificates" element={<CertificatesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="orders" element={<OrderHistoryPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Course player (full screen) */}
            <Route path="/learn/:courseId" element={<ProtectedRoute><CoursePlayerPage /></ProtectedRoute>} />

            {/* Checkout */}
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />

            {/* Instructor routes */}
            <Route path="/instructor" element={<ProtectedRoute role={['instructor', 'admin']}><InstructorLayout /></ProtectedRoute>}>
                <Route index element={<InstructorDashboard />} />
                <Route path="courses" element={<InstructorCoursesPage />} />
                <Route path="courses/create" element={<CreateCoursePage />} />
                <Route path="courses/:id/edit" element={<EditCoursePage />} />
                <Route path="earnings" element={<InstructorEarningsPage />} />
                <Route path="students" element={<InstructorStudentsPage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute role={['admin']}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="courses" element={<AdminCoursesPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="coupons" element={<AdminCouponsPage />} />
                <Route path="blogs" element={<AdminBlogsPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
