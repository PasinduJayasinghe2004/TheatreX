import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ButtonTest from '../pages/ButtonTest';
import InputTest from '../pages/InputTest';
import ModalTest from '../pages/ModalTest';
import LayoutDemo from '../pages/LayoutDemo';
import RegisterForm from '../components/auth/RegisterForm';

import DatePickerTest from '../pages/DatePickerTest';


// Placeholder pages - will be created in future days
const Dashboard = () => (
    <div className="p-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-4">Welcome to TheatreX - Coming Soon</p>
    </div>
);

const Login = () => (
    <div className="p-8">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="mt-4">Login page - Coming in Day 3</p>
    </div>
);

const Register_Placeholder = () => (
    <div className="p-8">
        <h1 className="text-3xl font-bold">Register</h1>
        <p className="mt-4">Register page - Coming in Day 3</p>
    </div>
);

const NotFound = () => (
    <div className="p-8">
        <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
        <p className="mt-4">The page you're looking for doesn't exist.</p>
    </div>
);

// Main Routes Component
const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterForm />} />

            {/* Test Pages */}
            <Route path="/button-test" element={<ButtonTest />} /> {/* M4 Day 1 */}
            <Route path="/input-test" element={<InputTest />} /> {/* M5 Day 1 */}
            <Route path="/modal-test" element={<ModalTest />} /> {/* M1 Day 2 */}
            <Route path="/datepicker-test" element={<DatePickerTest />} /> {/* M3 Day 2 */}
            <Route path="/layout-demo" element={<LayoutDemo />} /> {/* M6 Day 2 */}

            {/* Protected Routes - will add authentication in Day 3-4 */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;

