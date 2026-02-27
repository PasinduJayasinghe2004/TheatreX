import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import surgeonService from '../services/surgeonService';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/common/ImageUpload';

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Surgeon Card
// ─────────────────────────────────────────────────────────────────────────────
const SurgeonCard = ({ surgeon, onEdit, onDelete }) => {
    const initials = surgeon.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const profilePic = surgeon.profile_picture
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${surgeon.profile_picture}`
        : null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4 relative group">
            {/* Actions overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => onEdit(surgeon)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all focus:outline-none">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => onDelete(surgeon.id)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-red-600 hover:border-red-200 shadow-sm transition-all focus:outline-none">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    {/* Avatar/Profile Pic */}
                    {profilePic ? (
                        <img src={profilePic} alt={surgeon.name} className="w-12 h-12 rounded-full object-cover border border-gray-100 flex-shrink-0" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-indigo-700">{initials}</span>
                        </div>
                    )}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight">{surgeon.name}</h3>
                        <p className="text-xs text-indigo-600 font-medium mt-0.5">{surgeon.specialization}</p>
                    </div>
                </div>
                <AvailBadge available={surgeon.is_available} />
            </div>

            {/* Details */}
            <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    {/* License icon */}
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-gray-500">Licence:</span>
                    <span className="font-medium text-gray-900">{surgeon.license_number}</span>
                </div>

                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{surgeon.email}</span>
                </div>

                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{surgeon.phone}</span>
                </div>

                {surgeon.years_of_experience != null && (
                    <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{surgeon.years_of_experience} yr{surgeon.years_of_experience !== 1 ? 's' : ''} experience</span>
                    </div>
                )}
            </div>

            {/* Footer: active surgery count */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">Active surgeries</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(surgeon.active_surgery_count) > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-500'
                    }`}>
                    {surgeon.active_surgery_count ?? 0}
                </span>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Surgeon Modal (Combined Create/Edit)
// ─────────────────────────────────────────────────────────────────────────────
const SurgeonModal = ({ surgeon, onClose, onSaved }) => {
    const [form, setForm] = useState(surgeon ? {
        ...surgeon,
        years_of_experience: surgeon.years_of_experience || ''
    } : {
        name: '',
        specialization: '',
        license_number: '',
        years_of_experience: '',
        phone: '',
        email: '',
        is_available: true,
    });

    const [image, setImage] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverErrors, setServerErrors] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const errs = {};
        let valid = true;
        if (!form.name.trim()) { errs.name = 'Name is required'; valid = false; }
        if (!form.specialization.trim()) { errs.specialization = 'Required'; valid = false; }
        if (!form.license_number.trim()) { errs.license_number = 'Required'; valid = false; }
        if (!form.phone.trim()) { errs.phone = 'Required'; valid = false; }
        if (!form.email.trim()) { errs.email = 'Required'; valid = false; }
        setFieldErrors(errs);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerErrors([]);
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                if (form[key] !== null && form[key] !== undefined) {
                    formData.append(key, form[key]);
                }
            });
            if (image) formData.append('profile_picture', image);

            if (surgeon?.id) {
                await surgeonService.updateSurgeon(surgeon.id, formData);
            } else {
                await surgeonService.createSurgeon(formData);
            }
            onSaved();
        } catch (err) {
            setServerErrors([err.message]);
        } finally {
            setSubmitting(false);
        }
    };

    const fieldCls = (fieldName) =>
        `w-full px-3 py-2 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${fieldErrors[fieldName] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-white font-semibold">{surgeon ? 'Edit Surgeon' : 'Add New Surgeon'}</h2>
                    <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>

                <form id="surgeon-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    {serverErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                            {serverErrors.map((e, i) => <p key={i} className="text-xs text-red-600 font-medium">{e}</p>)}
                        </div>
                    )}

                    <ImageUpload onImageSelect={setImage} existingImage={surgeon?.profile_picture} />

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                        <input name="name" value={form.name} onChange={handleChange} className={fieldCls('name')} />
                        {fieldErrors.name && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Specialization *</label>
                            <input name="specialization" value={form.specialization} onChange={handleChange} className={fieldCls('specialization')} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Licence Number *</label>
                            <input name="license_number" value={form.license_number} onChange={handleChange} className={fieldCls('license_number')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
                            <input name="phone" value={form.phone} onChange={handleChange} className={fieldCls('phone')} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Experience (Yrs)</label>
                            <input name="years_of_experience" type="number" value={form.years_of_experience} onChange={handleChange} className={fieldCls('yoe')} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} className={fieldCls('email')} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input id="avail" type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} className="w-4 h-4 accent-indigo-600" />
                        <label htmlFor="avail" className="text-xs font-medium text-gray-700">Available immediately</label>
                    </div>
                </form>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
                    <button type="submit" form="surgeon-form" disabled={submitting} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                        {submitting ? 'Saving...' : (surgeon ? 'Update Changes' : 'Add Surgeon')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const SurgeonsPage = () => {
    const { user } = useAuth();
    const [surgeons, setSurgeons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modal, setModal] = useState({ show: false, surgeon: null });

    const [search, setSearch] = useState('');
    const [available, setAvailable] = useState('');

    const canCreate = user?.role === 'coordinator' || user?.role === 'admin';

    const fetchSurgeons = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await surgeonService.getAllSurgeons({ search, available });
            setSurgeons(res.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [search, available]);

    useEffect(() => {
        fetchSurgeons();
    }, [fetchSurgeons]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this surgeon record?')) return;
        try {
            await surgeonService.deleteSurgeon(id);
            fetchSurgeons();
        } catch (err) {
            alert(err.message);
        }
    };

    const totalAvailable = surgeons.filter(s => s.is_available).length;

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-outfit">Surgeons</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage hospital surgeons and profile pictures</p>
                    </div>
                    {canCreate && (
                        <button onClick={() => setModal({ show: true, surgeon: null })} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Surgeon
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[300px]">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input placeholder="Search named, specialization..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
                    </div>
                    <select value={available} onChange={e => setAvailable(e.target.value)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none">
                        <option value="">All Availability</option>
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                    </select>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : surgeons.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {surgeons.map(s => <SurgeonCard key={s.id} surgeon={s} onEdit={(sr) => setModal({ show: true, surgeon: sr })} onDelete={handleDelete} />)}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">No results found.</p>
                    </div>
                )}
            </div>

            {modal.show && (
                <SurgeonModal
                    surgeon={modal.surgeon}
                    onClose={() => setModal({ show: false, surgeon: null })}
                    onSaved={() => { setModal({ show: false, surgeon: null }); fetchSurgeons(); }}
                />
            )}
        </Layout>
    );
};

export default SurgeonsPage;
