import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronDown, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import theatrexLogo from '../assets/theatrex-logo.svg';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';

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
    const location = useLocation();
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    const [currentSlide, setCurrentSlide] = useState(0);
    const [logoutMessage, setLogoutMessage] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Show logout message if redirected from logout
    useEffect(() => {
        if (location.state?.loggedOut) {
            const syncTimer = setTimeout(() => {
                setLogoutMessage(true);
                window.history.replaceState({}, document.title);
            }, 0);

            const timer = setTimeout(() => setLogoutMessage(false), 4000);
            return () => {
                clearTimeout(syncTimer);
                clearTimeout(timer);
            };
        }
    }, [location.state]);

    // Auto-advance slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden flex relative" style={{ animation: 'loginEnter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
            <style>{`@keyframes loginEnter { from { opacity: 0; transform: scale(1.04); filter: blur(4px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }`}</style>

            {/* Logout Success Toast */}
            {logoutMessage && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100]" style={{ animation: 'slideDown 0.4s ease-out' }}>
                    <div className="bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">You have been logged out successfully</span>
                    </div>
                    <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                </div>
            )}

            {/* Left Panel - Blue Background with Slider */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 flex items-center gap-2">
                    <img src={theatrexLogo} alt="TheatreX Logo" className="w-10 h-10" />
                    <span className="text-2xl font-bold">TheatreX</span>
                </div>

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

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex justify-end mb-4">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm">
                            <span>English (UK)</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">Sign in to TheatreX</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Welcome back! Please enter your details.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2 animate-shake">
                            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <Input
                                label="Email address"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="appearance-none"
                            />

                            <div className="relative">
                                <Input
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="appearance-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
