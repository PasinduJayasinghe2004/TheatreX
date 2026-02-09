import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, Card } from '../components/ui';
import authService from '../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        // Clear API error when user starts typing
        if (apiError) {
            setApiError('');
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        // Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await authService.login(formData.email, formData.password);

            if (response.success) {
                // Redirect to dashboard on successful login
                navigate('/dashboard');
            }
        } catch (error) {
            setApiError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        🎭 TheatreX
                    </h1>
                    <p className="text-gray-600">
                        Operating Theatre Management System
                    </p>
                </div>

                {/* Login Card */}
                <Card className="shadow-xl">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Login to Your Account
                        </h2>

                        {/* API Error Message */}
                        {apiError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600 flex items-center gap-2">
                                    <span>⚠️</span>
                                    <span>{apiError}</span>
                                </p>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Input */}
                            <Input
                                label="Email Address"
                                type="email"
                                name="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                                required
                            />

                            {/* Password Input */}
                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                required
                            />

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full mt-6"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging in...
                                    </span>
                                ) : (
                                    'Login'
                                )}
                            </Button>
                        </form>

                        {/* Register Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    Register here
                                </Link>
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        © 2024 TheatreX. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
