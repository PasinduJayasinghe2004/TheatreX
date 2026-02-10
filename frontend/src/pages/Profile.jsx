import { useState, useEffect } from 'react';
import authService from '../services/authService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check if user is logged in
                if (!authService.isLoggedIn()) {
                    navigate('/login');
                    return;
                }

                const response = await authService.getProfile();
                if (response.success) {
                    setProfile(response.user);
                }
            } catch (err) {
                setError(err.message);
                // If token is invalid or expired, redirect to login
                if (err.message.includes('token') || err.message.includes('authorized')) {
                    authService.logout();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-white text-lg">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <div className="text-center">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Error Loading Profile</h2>
                        <p className="text-gray-300 mb-4">{error}</p>
                        <Button onClick={() => navigate('/login')} variant="primary">
                            Go to Login
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
            <div className="max-w-4xl mx-auto py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">User Profile</h1>
                    <p className="text-gray-300">View your account information</p>
                </div>

                {/* Profile Card */}
                <Card className="mb-6">
                    <div className="p-8">
                        {/* Profile Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                                {profile?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>

                        {/* Profile Information */}
                        <div className="space-y-4">
                            {/* Name */}
                            <div className="border-b border-gray-700 pb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                <p className="text-xl font-semibold text-white">{profile?.name}</p>
                            </div>

                            {/* Email */}
                            <div className="border-b border-gray-700 pb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                <p className="text-lg text-white">{profile?.email}</p>
                            </div>

                            {/* Role */}
                            <div className="border-b border-gray-700 pb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                                <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium capitalize">
                                    {profile?.role}
                                </span>
                            </div>

                            {/* Phone */}
                            {profile?.phone && (
                                <div className="border-b border-gray-700 pb-4">
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                                    <p className="text-lg text-white">{profile.phone}</p>
                                </div>
                            )}

                            {/* Account Status */}
                            <div className="border-b border-gray-700 pb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Account Status</label>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${profile?.is_active
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {profile?.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Member Since */}
                            <div className="pb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Member Since</label>
                                <p className="text-lg text-white">
                                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="secondary"
                                className="flex-1"
                            >
                                Back to Dashboard
                            </Button>
                            <Button
                                onClick={handleLogout}
                                variant="danger"
                                className="flex-1"
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
