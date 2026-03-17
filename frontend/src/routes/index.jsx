
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
import CreateSurgery from '../pages/CreateSurgery';
import SurgeryList from '../pages/SurgeryList';
import SurgeryDetail from '../pages/SurgeryDetail';
import Calendar from '../pages/Calendar';
import Dashboard from '../pages/Dashboard'; // M4 - Day 7
import EmergencyBooking from '../pages/EmergencyBooking'; // M1 - Day 8
import TheatreList from '../pages/TheatreList'; // M1 - Day 10
import TheatreDetail from '../pages/TheatreDetail'; // M2 - Day 10
import LiveStatusPage from '../pages/LiveStatusPage'; // M3 - Day 11
import CoordinatorDashboard from '../pages/CoordinatorDashboard'; // M1 - Day 12
import SurgeonsPage from '../pages/SurgeonsPage'; // M1 - Day 13
import NursesPage from '../pages/NursesPage'; // M3 - Day 13
import AnaesthetistsPage from '../pages/AnaesthetistsPage'; // M6 - Day 13
import TechniciansPage from '../pages/TechniciansPage'; // M4 - Day 14
import PatientsPage from '../pages/PatientsPage'; // M1 - Day 15
import PatientDetail from '../pages/PatientDetail'; // M3 - Day 15
import NotificationsPage from '../pages/NotificationsPage'; // M1 - Day 16
import AnalyticsPage from '../pages/AnalyticsPage'; // M1 - Day 18
import LandingPage from '../pages/LandingPage';
import NotFound from '../pages/NotFound';

import RoleBasedRoute from '../components/RoleBasedRoute';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

import DatePickerTest from '../pages/DatePickerTest';

// Admin-only test page
const AdminPanel = () => (
    <div className="p-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="mt-4">This page is only accessible to administrators</p>
    </div>
);

// NotFound component is now imported from '../pages/NotFound'

// Main Routes Component
const AppRoutes = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            } />
            <Route path="/register" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterForm />
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Test Pages */}
            <Route path="/button-test" element={<ButtonTest />} /> {/* M4 Day 1 */}
            <Route path="/input-test" element={<InputTest />} /> {/* M5 Day 1 */}
            <Route path="/modal-test" element={<ModalTest />} /> {/* M1 Day 2 */}
            <Route path="/datepicker-test" element={<DatePickerTest />} /> {/* M3 Day 2 */}
            <Route path="/layout-demo" element={<LayoutDemo />} /> {/* M6 Day 2 */}

            {/* Protected Routes */}
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

            {/* Surgery Routes - M1 Day 5 */}
            <Route path="/surgeries/new" element={
                <RoleBasedRoute allowedRoles={['coordinator', 'admin']}>
                    <CreateSurgery />
                </RoleBasedRoute>
            } />

            {/* Emergency Booking - M1 Day 8 */}
            <Route path="/emergency" element={
                <RoleBasedRoute allowedRoles={['coordinator', 'admin']}>
                    <EmergencyBooking />
                </RoleBasedRoute>
            } />

            {/* Surgery List - M2 Day 5 */}
            <Route path="/surgeries" element={
                <ProtectedRoute>
                    <SurgeryList />
                </ProtectedRoute>
            } />

            {/* Surgery Detail - M3 Day 5 */}
            <Route path="/surgeries/:id" element={
                <ProtectedRoute>
                    <SurgeryDetail />
                </ProtectedRoute>
            } />

            {/* Theatre List - M1 (Pasindu) Day 10 */}
            <Route path="/theatres" element={
                <ProtectedRoute>
                    <TheatreList />
                </ProtectedRoute>
            } />

            {/* Theatre Detail - M2 (Chandeepa) Day 10 */}
            <Route path="/theatres/:id" element={
                <ProtectedRoute>
                    <TheatreDetail />
                </ProtectedRoute>
            } />

            {/* Live Status - M3 (Janani) Day 11 */}
            <Route path="/live-status" element={
                <ProtectedRoute>
                    <LiveStatusPage />
                </ProtectedRoute>
            } />

            {/* Coordinator Dashboard - M1 (Pasindu) Day 12 */}
            <Route path="/coordinator" element={
                <RoleBasedRoute allowedRoles={['coordinator', 'admin']}>
                    <CoordinatorDashboard />
                </RoleBasedRoute>
            } />

            {/* Surgeons Page - M1 (Pasindu) Day 13 */}
            <Route path="/staff/surgeons" element={
                <ProtectedRoute>
                    <SurgeonsPage />
                </ProtectedRoute>
            } />

            {/* Nurses Page - M3 (Janani) Day 13 */}
            <Route path="/staff/nurses" element={
                <ProtectedRoute>
                    <NursesPage />
                </ProtectedRoute>
            } />

            {/* Anaesthetists Page - M6 (Dinil) Day 13 */}
            <Route path="/staff/anaesthetists" element={
                <ProtectedRoute>
                    <AnaesthetistsPage />
                </ProtectedRoute>
            } />

            {/* Technicians Page - M4 (Oneli) Day 14 */}
            <Route path="/staff/technicians" element={
                <ProtectedRoute>
                    <TechniciansPage />
                </ProtectedRoute>
            } />

            {/* Patients Page - M1 (Pasindu) Day 15 */}
            <Route path="/patients" element={
                <ProtectedRoute>
                    <PatientsPage />
                </ProtectedRoute>
            } />

            {/* Patient Detail - M3 (Janani) Day 15 */}
            <Route path="/patients/:id" element={
                <ProtectedRoute>
                    <PatientDetail />
                </ProtectedRoute>
            } />

            {/* Calendar View - M1 (Pasindu) Day 7 */}
            <Route path="/calendar" element={
                <ProtectedRoute>
                    <Calendar />
                </ProtectedRoute>
            } />

            {/* Notifications Page - M1 Day 16 */}
            <Route path="/notifications" element={
                <ProtectedRoute>
                    <NotificationsPage />
                </ProtectedRoute>
            } />

            {/* Analytics Page - M1 (Pasindu) Day 18 */}
            <Route path="/analytics" element={
                <ProtectedRoute>
                    <AnalyticsPage />
                </ProtectedRoute>
            } />

            {/* Default route: Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;

