
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';

const RegisterForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'coordinator'
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const roleOptions = [
        { value: 'coordinator', label: 'Coordinator' },
        { value: 'surgeon', label: 'Surgeon' },
        { value: 'nurse', label: 'Nurse' },
        { value: 'anaesthetist', label: 'Anaesthetist' },
        { value: 'technician', label: 'Technician' }
    ];

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

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
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Phone validation (optional but if provided, check format)
        if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        setApiError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    phone: formData.phone || null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            setSuccessMessage('Registration successful! Redirecting to login...');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-400">
                        Join TheatreX to manage operating theatre schedules
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Success Message */}
                        {successMessage && (
                            <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-sm">
                                {successMessage}
                            </div>
                        )}

                        {/* API Error */}
                        {apiError && (
                            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
                                {apiError}
                            </div>
                        )}

                        {/* Name Field */}
                        <div>
                            <Input
                                label="Full Name"
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                error={errors.name}
                                required
                                className="bg-white/10 border-white/30 text-white placeholder-gray-400"
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <Input
                                label="Email Address"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                                required
                                className="bg-white/10 border-white/30 text-white placeholder-gray-400"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="Create a password (min. 6 characters)"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                required
                                className="bg-white/10 border-white/30 text-white placeholder-gray-400"
                            />
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
                                required
                                className="bg-white/10 border-white/30 text-white placeholder-gray-400"
                            />
                        </div>

                        {/* Phone Field (Optional) */}
                        <div>
                            <Input
                                label="Phone Number"
                                type="tel"
                                name="phone"
                                placeholder="Enter your phone number (optional)"
                                value={formData.phone}
                                onChange={handleChange}
                                error={errors.phone}
                                className="bg-white/10 border-white/30 text-white placeholder-gray-400"
                            />
                        </div>

                        {/* Role Select */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Role
                            </label>
                            <Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                options={roleOptions}
                                className="bg-white/10 border-white/30 text-white"
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>

                        {/* Login Link */}
                        <p className="text-center text-gray-400 text-sm mt-4">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                                Sign in here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
