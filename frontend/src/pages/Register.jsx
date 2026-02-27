
// User registration page with form validation
// Created by: M1 (Pasindu) - Day 3
//
// FEATURES:
// - Registration form with all required fields
// - Client-side validation
// - Password strength indicator
// - Password match validation
// - API integration with error handling
// - Redirect to login on success
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import axios from 'axios';
import theatrexLogo from '../assets/theatrex-logo.svg';

/**
 * Register Component
 * Handles user registration with comprehensive validation
 */
const Register = () => {

    const navigate = useNavigate();

    // Form data state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'coordinator'
    });

    // UI state
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // ========================================
    // FUNCTION: Handle Input Change
    // ========================================
    // Updates form data and clears errors for that field
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

        // Clear API error when user makes changes
        if (apiError) {
            setApiError('');
        }
    };


    // Client-side validation before API call
    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Invalid email format';
            }
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Role validation
        if (!formData.role) {
            newErrors.role = 'Please select a role';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ========================================
    // FUNCTION: Handle Form Submit
    // ========================================
    // Validates and submits registration data to API
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous messages
        setApiError('');
        setSuccessMessage('');

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Make API request
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                role: formData.role
            });

            if (response.data.success) {
                setSuccessMessage('Registration successful! Redirecting to login...');

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }

        } catch (error) {
            // Handle API errors
            if (error.response?.data?.message) {
                setApiError(error.response.data.message);
            } else {
                setApiError('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ========================================
    // FUNCTION: Get Password Strength
    // ========================================
    // Returns password strength indicator
    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { text: '', color: '' };

        if (password.length < 8) {
            return { text: 'Too short', color: 'text-red-600' };
        } else if (password.length < 12) {
            return { text: 'Moderate', color: 'text-yellow-600' };
        } else {
            return { text: 'Strong', color: 'text-green-600' };
        }
    };

    const passwordStrength = getPasswordStrength();

    // ========================================
    // RENDER: Registration Form
    // ========================================
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                        <img src={theatrexLogo} alt="TheatreX Logo" className="w-10 h-10" />
                        TheatreX
                    </h1>
                    <p className="text-gray-600">Create your account</p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm flex items-center gap-2">
                            <span>✓</span>
                            {successMessage}
                        </p>
                    </div>
                )}

                {/* API Error Message */}
                {apiError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm flex items-center gap-2">
                            <span>✕</span>
                            {apiError}
                        </p>
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Field */}
                    <Input
                        label="Full Name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        error={errors.name}
                        required
                        disabled={isLoading}
                    />

                    {/* Email Field */}
                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        error={errors.email}
                        required
                        disabled={isLoading}
                    />

                    {/* Password Field */}
                    <div>
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            error={errors.password}
                            required
                            disabled={isLoading}
                        />
                        {formData.password && (
                            <p className={`text-xs mt-1 ${passwordStrength.color}`}>
                                Strength: {passwordStrength.text}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <Input
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        error={errors.confirmPassword}
                        required
                        disabled={isLoading}
                    />

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.role ? 'border-red-500' : 'border-gray-300'
                                } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                            <option value="coordinator">Coordinator</option>
                            <option value="admin">Admin</option>
                            <option value="surgeon">Surgeon</option>
                            <option value="nurse">Nurse</option>
                            <option value="anaesthetist">Anaesthetist</option>
                            <option value="technician">Technician</option>
                        </select>
                        {errors.role && (
                            <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <a
                            href="/login"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Login here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
