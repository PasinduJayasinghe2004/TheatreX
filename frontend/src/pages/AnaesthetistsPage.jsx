import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import anaesthetistService from '../services/anaesthetistService';
import { useAuth } from '../context/AuthContext';

/** Availability pill badge */
const AvailBadge = ({ available }) =>
    available ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Available
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            Unavailable
        </span>
    );

/** Loading skeleton card */
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
        </div>
        <div className="mt-4 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
    </div>
);

/** Anaesthetist Card */
const AnaesthetistCard = ({ anaesthetist }) => {
    const initials = anaesthetist.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700">{initials}</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight">{anaesthetist.name}</h3>
                        <p className="text-xs text-blue-600 font-medium mt-0.5">{anaesthetist.specialization}</p>
                    </div>
                </div>
                <AvailBadge available={anaesthetist.is_available} />
            </div>

            <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-gray-500">Licence:</span>
                    <span className="font-medium text-gray-900">{anaesthetist.license_number}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{anaesthetist.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{anaesthetist.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c-4.97 0-9 4.03-9 9 0 1.222.243 2.387.684 3.449m4.419 3.012A9.992 9.992 0 0110.201 3.65M16.5 7.5l-9 9" />
                    </svg>
                    <span>Shift: <span className="capitalize">{anaesthetist.shift_preference}</span></span>
                </div>
            </div>
        </div>
    );
};

const EMPTY_FORM = {
    name: '',
    email: '',
    phone: '',
    specialization: '',
    license_number: '',
    years_of_experience: '',
    qualification: '',
    shift_preference: 'flexible'
};

/** Create Anaesthetist Modal */
const CreateAnaesthetistModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setSubmitting(true);
        try {
            const result = await anaesthetistService.createAnaesthetist(form);
            onCreated(result.data);
        } catch (err) {
            setErrors([err.message]);
        } finally {
            setSubmitting(false);
        }
    };

    const fieldCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition";

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-white font-semibold text-base">Add New Anaesthetist</h2>
                    <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {errors.length > 0 && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                            {errors.map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} required className={fieldCls} placeholder="Dr. John Smith" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Specialization *</label>
                            <input type="text" name="specialization" value={form.specialization} onChange={handleChange} required className={fieldCls} placeholder="General / Pediatric" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Licence Number *</label>
                            <input type="text" name="license_number" value={form.license_number} onChange={handleChange} required className={fieldCls} placeholder="LK-ANS-2024-001" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} required className={fieldCls} placeholder="john@hospital.com" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                            <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={fieldCls} placeholder="+94 77 000 0000" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Experience (Years)</label>
                            <input type="number" name="years_of_experience" value={form.years_of_experience} onChange={handleChange} className={fieldCls} placeholder="5" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Shift Preference</label>
                            <select name="shift_preference" value={form.shift_preference} onChange={handleChange} className={fieldCls}>
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="night">Night</option>
                                <option value="flexible">Flexible</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Qualification</label>
                        <input type="text" name="qualification" value={form.qualification} onChange={handleChange} className={fieldCls} placeholder="MBBS, MD Anaesthesiology" />
                    </div>
                </form>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                        {submitting ? 'Saving...' : 'Add Anaesthetist'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/** Main Page Component */
const AnaesthetistsPage = () => {
    const { user } = useAuth();
    const [anaesthetists, setAnaesthetists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const canCreate = user?.role === 'admin';

    const fetchAnaesthetists = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await anaesthetistService.getAllAnaesthetists();
            setAnaesthetists(res.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnaesthetists();
    }, [fetchAnaesthetists]);

    const handleCreated = (newAnaesthetist) => {
        setShowModal(false);
        setAnaesthetists(prev => [newAnaesthetist, ...prev]);
    };

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Anaesthetists</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage anaesthesia department staff</p>
                    </div>
                    {canCreate && (
                        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Anaesthetist
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button onClick={fetchAnaesthetists} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Try again</button>
                    </div>
                ) : anaesthetists.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No anaesthetists found.</p>
                        {canCreate && <button onClick={() => setShowModal(true)} className="mt-4 text-blue-600 font-semibold underline">Add your first record</button>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {anaesthetists.map(item => <AnaesthetistCard key={item.id} anaesthetist={item} />)}
                    </div>
                )}
            </div>
            {showModal && <CreateAnaesthetistModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
        </Layout>
    );
};

export default AnaesthetistsPage;
