// ============================================================================
// Profile Page Component
// ============================================================================
// Created by: M4 (Oneli) - Day 4
// 
// User profile page with view and edit functionality
// Allows users to update their name, phone, and password
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRoleDisplayName, getRoleBadgeColor } from '../utils/roleUtils';
import Layout from '../components/Layout';
import axios from 'axios';
import { Camera, User } from 'lucide-react';

const Profile = () => {
    const { user, token } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const PROFILE_URL = API_BASE.endsWith('/api') ? `${API_BASE}/auth/profile` : `${API_BASE}/api/auth/profile`;

            const response = await axios.put(
                PROFILE_URL,
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

    // Handle profile image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please select an image file.' });
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image size should be less than 5MB.' });
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            setMessage({ type: '', text: '' });

            // 1. Upload the image
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const UPLOAD_URL = API_BASE.endsWith('/api') ? `${API_BASE}/auth/profile-image` : `${API_BASE}/api/auth/profile-image`;

            const uploadRes = await axios.post(
                UPLOAD_URL,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (uploadRes.data.success) {
                const imageUrl = uploadRes.data.imageUrl;

                // 2. Update the user profile with the new image URL
                const UPDATE_PROFILE_URL = API_BASE.endsWith('/api') ? `${API_BASE}/auth/profile` : `${API_BASE}/api/auth/profile`;

                const updateRes = await axios.put(
                    UPDATE_PROFILE_URL,
                    { profile_image: imageUrl },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (updateRes.data.success) {
                    setMessage({ type: 'success', text: 'Profile picture updated successfully!' });

                    // Update local storage
                    const updatedUser = { ...user, profile_image: imageUrl };
                    localStorage.setItem('user', JSON.stringify(updatedUser));

                    // Reload after a short delay
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Upload Error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error uploading image'
            });
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
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
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <p>Loading...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6 border border-transparent dark:border-slate-700">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            {/* Profile Image Circle */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 shadow-inner bg-gray-100 flex items-center justify-center">
                                    {user.profile_image ? (
                                        <img
                                            src={`${backendUrl}${user.profile_image}`}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="text-gray-400" size={48} />
                                    )}

                                    {uploading && (
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full">
                                            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={triggerFileInput}
                                    className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110"
                                    title="Update profile picture"
                                >
                                    <Camera size={16} />
                                </button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-1">{user.name}</h1>
                                <p className="text-gray-600 dark:text-slate-300 mb-2">{user.email}</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(user.role)}`}>
                                    {getRoleDisplayName(user.role)}
                                </span>
                            </div>
                        </div>
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
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-transparent dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Account Information</h2>
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
                                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Name</label>
                                    <p className="text-lg text-gray-800 dark:text-slate-100">{user.name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Email</label>
                                    <p className="text-lg text-gray-800 dark:text-slate-100">{user.email}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Phone</label>
                                    <p className="text-lg text-gray-800 dark:text-slate-100">{user.phone || 'Not provided'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Role</label>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(user.role)}`}>
                                        {getRoleDisplayName(user.role)}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Account Status</label>
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                        Email (cannot be changed)
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="border-t pt-4 mt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">Change Password</h3>
                                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">Leave blank to keep current password</p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                minLength="8"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        className="flex-1 px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
