import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * UserFormModal Component
 * Interactive modal for adding and editing users
 * Features glassmorphism and smooth transitions
 */
const UserFormModal = ({ isOpen, onClose, onSave, user = null, isLoading = false }) => {
    const isEdit = !!user;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'coordinator',
        phone: '',
        is_active: true
    });

    // Populate form when editing
    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '', // Don't populate password
                role: user.role || 'coordinator',
                phone: user.phone || '',
                is_active: user.is_active !== false
            });
        } else if (!user && isOpen) {
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'coordinator',
                phone: '',
                is_active: true
            });
        }
    }, [user, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-slideUp">
                <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isEdit ? 'Edit User Details' : 'Create New User'}
                        </h2>
                        <button 
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5 font-medium">
                                <label className="text-sm text-gray-700 dark:text-gray-300">Full Name</label>
                                <input
                                    required
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5 font-medium">
                                <label className="text-sm text-gray-700 dark:text-gray-300">Email Address</label>
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {!isEdit && (
                            <div className="space-y-1.5 font-medium">
                                <label className="text-sm text-gray-700 dark:text-gray-300">Password</label>
                                <input
                                    required
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5 font-medium">
                                <label className="text-sm text-gray-700 dark:text-gray-300">System Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    <option value="coordinator">Coordinator</option>
                                    <option value="admin">Administrator</option>
                                    <option value="surgeon">Surgeon</option>
                                    <option value="nurse">Nurse</option>
                                    <option value="anaesthetist">Anaesthetist</option>
                                    <option value="technician">Technician</option>
                                </select>
                            </div>
                            <div className="space-y-1.5 font-medium">
                                <label className="text-sm text-gray-700 dark:text-gray-300">Phone Number (Optional)</label>
                                <input
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 234 567 890"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 cursor-pointer select-none">
                            <input
                                id="is_active"
                                name="is_active"
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="w-5 h-5 text-primary rounded-lg border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-primary"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                This user account is active
                            </label>
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 btn btn-outline py-2.5 rounded-2xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-[2] btn btn-primary py-2.5 rounded-2xl shadow-lg flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {isEdit ? 'Update Profile' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

UserFormModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    user: PropTypes.object,
    isLoading: PropTypes.bool
};

export default UserFormModal;
