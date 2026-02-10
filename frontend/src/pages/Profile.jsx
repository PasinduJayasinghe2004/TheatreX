// ============================================================================
// Profile Page Component
// ============================================================================
// Created by: M4 (Oneli) - Day 4
// 
// User profile page with view and edit functionality
// Allows users to update their name, phone, and password
// ============================================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRoleDisplayName, getRoleBadgeColor } from '../utils/roleUtils';
import axios from 'axios';

const Profile = () => {
    const { user, token } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                password: '',
                confirmPassword: ''
            });
        }
    }, [user]);

    // Handle input change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Validate passwords match if password is being changed
        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        try {
            setLoading(true);

            // Prepare update data (only include fields that changed)
            const updateData = {};
            if (formData.name !== user.name) updateData.name = formData.name;
            if (formData.phone !== user.phone) updateData.phone = formData.phone;
            if (formData.password) updateData.password = formData.password;

            // Make API request
            const response = await axios.put(
                'http://localhost:5000/api/auth/profile',
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setIsEditing(false);

                // Update local storage with new user data
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // Clear password fields
                setFormData({
                    ...formData,
                    password: '',
                    confirmPassword: ''
                });

                // Reload page to update user context
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error updating profile'
            });
        } finally {
            setLoading(false);
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: user.name || '',
            phone: user.phone || '',
            password: '',
            confirmPassword: ''
        });
        setMessage({ type: '', text: '' });
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile</h1>
                    <p className="text-gray-600">Manage your account information</p>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Profile Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Account Information</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {!isEditing ? (
                        // View Mode
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                                <p className="text-lg text-gray-800">{user.name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                <p className="text-lg text-gray-800">{user.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                                <p className="text-lg text-gray-800">{user.phone || 'Not provided'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(user.role)}`}>
                                    {getRoleDisplayName(user.role)}
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Account Status</label>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        // Edit Mode
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email (cannot be changed)
                                </label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="border-t pt-4 mt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                                <p className="text-sm text-gray-600 mb-4">Leave blank to keep current password</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            minLength="8"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            minLength="8"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="flex-1 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
