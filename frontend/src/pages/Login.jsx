import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import authService from '../services/authService';
import { Mail, Lock, Eye, EyeOff, ChevronDown } from 'lucide-react';
import theatrexLogo from '../assets/theatrex-logo.svg';

/* ========================================
   Slide Data — 3 slides with SVG content
   ======================================== */
const slides = [
    {
        id: 0,
        title: 'Theatre Management Dashboard',
        subtitle: 'Real-time monitoring and scheduling overview',
        illustration: (
            <div className="relative w-full max-w-md space-y-4">
                {/* Activity Chart Card */}
                <div className="bg-white rounded-2xl p-6 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-800 font-semibold text-sm">Activity</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex items-end justify-between gap-2 h-28">
                        <div className="w-full bg-blue-200 rounded-t-lg h-[40%]"></div>
                        <div className="w-full bg-blue-300 rounded-t-lg h-[55%]"></div>
                        <div className="w-full bg-blue-400 rounded-t-lg h-[70%]"></div>
                        <div className="w-full bg-blue-500 rounded-t-lg h-[85%]"></div>
                        <div className="w-full bg-blue-600 rounded-t-lg h-[100%]"></div>
                        <div className="w-full bg-blue-400 rounded-t-lg h-[60%]"></div>
                        <div className="w-full bg-blue-300 rounded-t-lg h-[45%]"></div>
                    </div>
                </div>
                {/* Stats Card */}
                <div className="bg-white rounded-2xl p-5 shadow-2xl transform rotate-[2deg] hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-6 justify-center">
                        <div className="relative w-20 h-20">
                            <svg className="transform -rotate-90 w-20 h-20">
                                <circle cx="40" cy="40" r="34" stroke="#E5E7EB" strokeWidth="7" fill="none" />
                                <circle cx="40" cy="40" r="34" stroke="#2563EB" strokeWidth="7" fill="none" strokeDasharray="213.6" strokeDashoffset="64" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-blue-600">70%</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-800 font-semibold text-sm">Utilization Rate</p>
                            <p className="text-green-500 text-xs font-medium">↑ 12% this week</p>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 1,
        title: 'Smart Scheduling System',
        subtitle: 'Effortless theatre booking and surgical planning',
        illustration: (
            <div className="relative w-full max-w-md space-y-4">
                {/* Calendar Card */}
                <div className="bg-white rounded-2xl p-6 shadow-2xl transform rotate-[1deg] hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-800 font-semibold text-sm">February 2026</span>
                        <div className="flex gap-2">
                            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-xs">‹</div>
                            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-xs">›</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                            <span key={i} className="text-gray-400 font-medium py-1">{d}</span>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {[...Array(28)].map((_, i) => (
                            <div key={i} className={`py-1.5 rounded-md ${i === 9 ? 'bg-blue-600 text-white font-bold' : i === 14 || i === 20 ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                                {i + 1}
                            </div>
                        ))}
                    </div>
                </div>
                {/* Upcoming Surgeries */}
                <div className="bg-white rounded-2xl p-5 shadow-2xl transform rotate-[-1deg] hover:rotate-0 transition-transform duration-500">
                    <p className="text-gray-800 font-semibold text-sm mb-3">Upcoming Surgeries</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                            <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                            <div>
                                <p className="text-gray-800 text-xs font-medium">Theatre 1 — 09:00</p>
                                <p className="text-gray-400 text-xs">Orthopedic Surgery</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                            <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                            <div>
                                <p className="text-gray-800 text-xs font-medium">Theatre 3 — 11:30</p>
                                <p className="text-gray-400 text-xs">Cardiac Procedure</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 2,
        title: 'Team Collaboration Hub',
        subtitle: 'Keep your surgical team connected and informed',
        illustration: (
            <div className="relative w-full max-w-md space-y-4">
                {/* Team Status Card */}
                <div className="bg-white rounded-2xl p-6 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                    <p className="text-gray-800 font-semibold text-sm mb-4">Theatre Status</p>
                    <div className="space-y-3">
                        {[
                            { name: 'Theatre 1', status: 'In Surgery', color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-600' },
                            { name: 'Theatre 2', status: 'Available', color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-600' },
                            { name: 'Theatre 3', status: 'Prepping', color: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-600' },
                        ].map((t, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 ${t.color} rounded-full`}></div>
                                    <span className="text-gray-700 text-sm font-medium">{t.name}</span>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${t.bg} ${t.text}`}>{t.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Notifications Card */}
                <div className="bg-white rounded-2xl p-5 shadow-2xl transform rotate-[1.5deg] hover:rotate-0 transition-transform duration-500">
                    <p className="text-gray-800 font-semibold text-sm mb-3">Recent Notifications</p>
                    <div className="space-y-2">
                        <div className="flex items-start gap-3 p-2 bg-blue-50 rounded-lg">
                            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs mt-0.5">✓</div>
                            <div>
                                <p className="text-gray-800 text-xs font-medium">Surgery completed</p>
                                <p className="text-gray-400 text-xs">Theatre 1 — 2 min ago</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-2 bg-orange-50 rounded-lg">
                            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs mt-0.5">!</div>
                            <div>
                                <p className="text-gray-800 text-xs font-medium">Equipment maintenance due</p>
                                <p className="text-gray-400 text-xs">Theatre 3 — 15 min ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
];

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (apiError) setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await authService.login(formData.email, formData.password);
            if (response.success) {
                navigate('/dashboard');
            }
        } catch (error) {
            setApiError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden flex">
            {/* Left Panel - Blue Background with Slider */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-12 text-white">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
                </div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-2">
                    <img src={theatrexLogo} alt="TheatreX Logo" className="w-10 h-10" />
                    <span className="text-2xl font-bold">TheatreX</span>
                </div>

                {/* Slider Content */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-md h-[400px] flex items-center justify-center">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                className={`absolute inset-0 transition-all duration-700 ease-in-out flex flex-col items-center justify-center ${index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                                    }`}
                            >
                                {slide.illustration}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Text & Dots */}
                <div className="relative z-10 text-center space-y-4">
                    <div className="h-20">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                className={`transition-all duration-500 absolute w-full left-0 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                    }`}
                            >
                                <h2 className="text-3xl font-bold mb-2">{slide.title}</h2>
                                <p className="text-blue-100 text-sm">{slide.subtitle}</p>
                            </div>
                        ))}
                    </div>

                    {/* Pagination dots */}
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - White Background with Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Language Selector */}
                    <div className="flex justify-end mb-8">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm">
                            <span>English (UK)</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Form Container */}
                    <div>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In to your Account</h1>
                            <p className="text-gray-500 text-sm">Welcome back! please enter your detail</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input */}
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                            </div>

                            {/* Password Input */}
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>
                                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    Forgot Password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="px-4 text-sm text-gray-500">Or sign in with</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Facebook</span>
                            </button>
                        </div>

                        {/* Sign Up Link */}
                        <p className="mt-8 text-center text-sm text-gray-600">
                            Don&apos;t have an account?{' '}
                            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
