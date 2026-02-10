
import { Routes, Route, Navigate } from 'react-router-dom';
import ButtonTest from '../pages/ButtonTest';
import InputTest from '../pages/InputTest';
import ModalTest from '../pages/ModalTest';
import LayoutDemo from '../pages/LayoutDemo';
import RegisterForm from '../components/auth/RegisterForm';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Profile from '../pages/Profile';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleBasedRoute from '../components/RoleBasedRoute';

import DatePickerTest from '../pages/DatePickerTest';

// Placeholder pages - will be created in future days
const Dashboard = () => (
    <div className="p-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-4">Welcome to TheatreX - Coming Soon</p>
    </div>
);

// Admin-only test page
const AdminPanel = () => (
    <div className="p-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="mt-4">This page is only accessible to administrators</p>
    </div>
);

const NotFound = () => (
    <div className="p-8">
        <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
        <p className="mt-4">The page you&apos;re looking for doesn&apos;t exist.</p>
    </div>
);

// Main Routes Component
const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Test Pages */}
            <Route path="/button-test" element={<ButtonTest />} /> {/* M4 Day 1 */}
            <Route path="/input-test" element={<InputTest />} /> {/* M5 Day 1 */}
            <Route path="/modal-test" element={<ModalTest />} /> {/* M1 Day 2 */}
            <Route path="/datepicker-test" element={<DatePickerTest />} /> {/* M3 Day 2 */}
            <Route path="/layout-demo" element={<LayoutDemo />} /> {/* M6 Day 2 */}

            {/* Protected Routes - Require Authentication */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />

            <Route path="/profile" element={
                <ProtectedRoute>
                    <Profile />
                </ProtectedRoute>
            } />

            {/* Role-Based Routes - Require Specific Roles */}
            <Route path="/admin" element={
                <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminPanel />
                </RoleBasedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;

