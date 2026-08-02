import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice';

// Layout
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import InstructorLayout from './components/layout/InstructorLayout';
import EmployeeLayout from './components/layout/EmployeeLayout';
import HRLayout from './components/layout/HRLayout';
import HRBPLayout from './components/layout/HRBPLayout';
import SalesLayout from './components/layout/SalesLayout';
import SupportLayout from './components/layout/SupportLayout';
import FinanceLayout from './components/layout/FinanceLayout';
import MarketingLayout from './components/layout/MarketingLayout';

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
import InstructorUploadVideosPage from './pages/instructor/InstructorUploadVideosPage';
import InstructorAssignmentsPage from './pages/instructor/InstructorAssignmentsPage';
import InstructorQuizzesPage from './pages/instructor/InstructorQuizzesPage';
import InstructorReviewsPage from './pages/instructor/InstructorReviewsPage';
import InstructorAnalyticsPage from './pages/instructor/InstructorAnalyticsPage';
import InstructorWithdrawPage from './pages/instructor/InstructorWithdrawPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEmployeesPage from './pages/admin/AdminEmployeesPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminActivityPage from './pages/admin/AdminActivityPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminBlogsPage from './pages/admin/AdminBlogsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyProfilePage from './pages/employee/MyProfilePage';
import AttendancePage from './pages/employee/AttendancePage';
import LeavePage from './pages/employee/LeavePage';
import PayrollPage from './pages/employee/PayrollPage';

// HR Pages
import HRDashboard from './pages/hr/HRDashboard';

// HRBP Pages
import HRBPDashboard from './pages/hrbp/HRBPDashboard';

// Sales Pages
import SalesDashboard from './pages/sales/SalesDashboard';

// Support Pages
import SupportDashboard from './pages/support/SupportDashboard';

// Finance Pages
import FinanceDashboard from './pages/finance/FinanceDashboard';

// Marketing Pages
import MarketingDashboard from './pages/marketing/MarketingDashboard';

// Misc
import LoadingScreen from './components/common/LoadingScreen';

// Helper: get the home path for a given role
const getRoleHomePath = (role) => {
    switch (role) {
        case 'admin': return '/admin';
        case 'hr_manager': return '/hr';
        case 'hrbp': return '/hrbp';
        case 'sales_manager': return '/sales';
        case 'sales_executive': return '/sales';
        case 'support_manager': return '/support';
        case 'support_executive': return '/support';
        case 'finance_manager': return '/finance';
        case 'content_manager': return '/marketing';
        case 'instructor': return '/instructor';
        case 'employee': return '/employee';
        default: return '/dashboard';
    }
};

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
    if (user) return <Navigate to={getRoleHomePath(user.role)} replace />;
    return children;
};

export default function App() {
    const dispatch = useDispatch();
    const { loading } = useSelector((s) => s.auth);

    useEffect(() => {
        // Fetch current user with a timeout fallback
        const timeoutId = setTimeout(() => {
            console.warn('fetchCurrentUser timeout - continuing without user');
        }, 10000); // 10 second timeout

        dispatch(fetchCurrentUser()).finally(() => {
            clearTimeout(timeoutId);
        });

        return () => clearTimeout(timeoutId);
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
                <Route path="upload-videos" element={<InstructorUploadVideosPage />} />
                <Route path="assignments" element={<InstructorAssignmentsPage />} />
                <Route path="quizzes" element={<InstructorQuizzesPage />} />
                <Route path="reviews" element={<InstructorReviewsPage />} />
                <Route path="analytics" element={<InstructorAnalyticsPage />} />
                <Route path="earnings" element={<InstructorEarningsPage />} />
                <Route path="withdraw" element={<InstructorWithdrawPage />} />
                <Route path="students" element={<InstructorStudentsPage />} />
            </Route>

            {/* Employee routes */}
            <Route path="/employee" element={<ProtectedRoute role={['employee']}><EmployeeLayout /></ProtectedRoute>}>
                <Route index element={<EmployeeDashboard />} />
                <Route path="profile" element={<MyProfilePage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="leaves" element={<LeavePage />} />
                <Route path="payroll" element={<PayrollPage />} />
                <Route path="tasks" element={<div className="p-6"><h1 className="text-3xl font-bold">Tasks</h1><p className="text-muted-foreground mt-2">Task management page coming soon</p></div>} />
                <Route path="performance" element={<div className="p-6"><h1 className="text-3xl font-bold">Performance</h1><p className="text-muted-foreground mt-2">Performance reviews page coming soon</p></div>} />
                <Route path="learning" element={<div className="p-6"><h1 className="text-3xl font-bold">Learning</h1><p className="text-muted-foreground mt-2">Learning and courses page coming soon</p></div>} />
                <Route path="expenses" element={<div className="p-6"><h1 className="text-3xl font-bold">Expenses</h1><p className="text-muted-foreground mt-2">Expense claims page coming soon</p></div>} />
                <Route path="helpdesk" element={<div className="p-6"><h1 className="text-3xl font-bold">Help Desk</h1><p className="text-muted-foreground mt-2">Support tickets page coming soon</p></div>} />
                <Route path="documents" element={<div className="p-6"><h1 className="text-3xl font-bold">Documents</h1><p className="text-muted-foreground mt-2">Documents and certificates page coming soon</p></div>} />
                <Route path="company" element={<div className="p-6"><h1 className="text-3xl font-bold">Company</h1><p className="text-muted-foreground mt-2">Company information page coming soon</p></div>} />
                <Route path="settings" element={<div className="p-6"><h1 className="text-3xl font-bold">Settings</h1><p className="text-muted-foreground mt-2">Profile settings page coming soon</p></div>} />
            </Route>

            {/* HR routes */}
            <Route path="/hr" element={<ProtectedRoute role={['hr_manager', 'admin']}><HRLayout /></ProtectedRoute>}>
                <Route index element={<HRDashboard />} />
            </Route>

            {/* HRBP routes */}
            <Route path="/hrbp" element={<ProtectedRoute role={['hrbp', 'admin']}><HRBPLayout /></ProtectedRoute>}>
                <Route index element={<HRBPDashboard />} />
                <Route path="employees" element={<div className="p-6"><h1 className="text-3xl font-bold">Employee Management</h1><p className="text-muted-foreground mt-2">Employee management page coming soon</p></div>} />
                <Route path="recruitment" element={<div className="p-6"><h1 className="text-3xl font-bold">Recruitment</h1><p className="text-muted-foreground mt-2">Recruitment page coming soon</p></div>} />
                <Route path="attendance" element={<div className="p-6"><h1 className="text-3xl font-bold">Attendance Management</h1><p className="text-muted-foreground mt-2">Attendance management page coming soon</p></div>} />
                <Route path="leaves" element={<div className="p-6"><h1 className="text-3xl font-bold">Leave Approval</h1><p className="text-muted-foreground mt-2">Leave approval page coming soon</p></div>} />
                <Route path="payroll" element={<div className="p-6"><h1 className="text-3xl font-bold">Payroll Management</h1><p className="text-muted-foreground mt-2">Payroll management page coming soon</p></div>} />
                <Route path="performance" element={<div className="p-6"><h1 className="text-3xl font-bold">Performance Management</h1><p className="text-muted-foreground mt-2">Performance management page coming soon</p></div>} />
                <Route path="reports" element={<div className="p-6"><h1 className="text-3xl font-bold">Reports</h1><p className="text-muted-foreground mt-2">Reports page coming soon</p></div>} />
                <Route path="settings" element={<div className="p-6"><h1 className="text-3xl font-bold">Settings</h1><p className="text-muted-foreground mt-2">Settings page coming soon</p></div>} />
            </Route>

            {/* Sales routes */}
            <Route path="/sales" element={<ProtectedRoute role={['sales_manager', 'sales_executive', 'admin']}><SalesLayout /></ProtectedRoute>}>
                <Route index element={<SalesDashboard />} />
            </Route>

            {/* Support routes */}
            <Route path="/support" element={<ProtectedRoute role={['support_manager', 'support_executive', 'admin']}><SupportLayout /></ProtectedRoute>}>
                <Route index element={<SupportDashboard />} />
            </Route>

            {/* Finance routes */}
            <Route path="/finance" element={<ProtectedRoute role={['finance_manager', 'admin']}><FinanceLayout /></ProtectedRoute>}>
                <Route index element={<FinanceDashboard />} />
            </Route>

            {/* Marketing routes */}
            <Route path="/marketing" element={<ProtectedRoute role={['content_manager', 'admin']}><MarketingLayout /></ProtectedRoute>}>
                <Route index element={<MarketingDashboard />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute role={['admin']}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="employees" element={<AdminEmployeesPage />} />
                <Route path="courses" element={<AdminCoursesPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="activities" element={<AdminActivityPage />} />
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
