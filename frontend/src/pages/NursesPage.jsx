import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import nurseService from '../services/nurseService';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/common/ImageUpload';

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────

const AvailBadge = ({ available }) =>
    available ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Available
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            Busy
        </span>
    );

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
// Nurse Card
// ─────────────────────────────────────────────────────────────────────────────
const NurseCard = ({ nurse, onEdit, onDelete }) => {
    const initials = nurse.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const profilePic = nurse.profile_picture
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${nurse.profile_picture}`
        : null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => onEdit(nurse)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-teal-600 hover:border-teal-200 shadow-sm transition-all focus:outline-none">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => onDelete(nurse.id)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-red-600 hover:border-red-200 shadow-sm transition-all focus:outline-none">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    {profilePic ? (
                        <img src={profilePic} alt={nurse.name} className="w-12 h-12 rounded-full object-cover border border-gray-100 flex-shrink-0" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-teal-700">{initials}</span>
                        </div>
                    )}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight">{nurse.name}</h3>
                        <p className="text-xs text-teal-600 font-medium mt-0.5">{nurse.specialization}</p>
                    </div>
                </div>
                <AvailBadge available={nurse.is_available} />
            </div>

            <div className="space-y-1.5 text-xs text-gray-600 mt-4">
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <span>Licence: {nurse.license_number}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="truncate">{nurse.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{nurse.years_of_experience} yrs experience</span>
                </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">{nurse.shift_preference || 'Flexible'} Shift</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(nurse.active_surgery_count) > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    {nurse.active_surgery_count ?? 0}
                </span>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Nurse Modal
// ─────────────────────────────────────────────────────────────────────────────
const NurseModal = ({ nurse, onClose, onSaved }) => {
    const [form, setForm] = useState(nurse ? { ...nurse } : {
        name: '',
        specialization: '',
        license_number: '',
        years_of_experience: '',
        phone: '',
        email: '',
        is_available: true,
        shift_preference: 'flexible',
    });
    const [image, setImage] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Required';
        if (!form.specialization.trim()) errs.specialization = 'Required';
        if (!form.license_number.trim()) errs.license_number = 'Required';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.keys(form).forEach(k => {
                if (form[k] !== null && form[k] !== undefined) formData.append(k, form[k]);
            });
            if (image) formData.append('profile_picture', image);

            if (nurse?.id) {
                await nurseService.updateNurse(nurse.id, formData);
            } else {
                await nurseService.createNurse(formData);
            }
            onSaved();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = (field) => `w-full px-3 py-2 border rounded-xl text-sm outline-none transition-all ${fieldErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'}`;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-teal-600 px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
                    <h2 className="font-semibold text-lg">{nurse ? 'Edit Nurse' : 'Add New Nurse'}</h2>
                    <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>

                <form id="nurse-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <ImageUpload onImageSelect={setImage} existingImage={nurse?.profile_picture} />

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                        <input name="name" value={form.name} onChange={handleChange} className={inputCls('name')} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Specialization</label>
                            <input name="specialization" value={form.specialization} onChange={handleChange} className={inputCls('specialization')} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Licence No.</label>
                            <input name="license_number" value={form.license_number} onChange={handleChange} className={inputCls('license_number')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Experience (Yrs)</label>
                            <input name="years_of_experience" type="number" value={form.years_of_experience} onChange={handleChange} className={inputCls('yoe')} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                            <input name="phone" value={form.phone} onChange={handleChange} className={inputCls('phone')} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} className={inputCls('email')} />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Shift Preference</label>
                        <select name="shift_preference" value={form.shift_preference} onChange={handleChange} className={inputCls('shift')}>
                            <option value="flexible">Flexible</option>
                            <option value="morning">Morning</option>
                            <option value="afternoon">Afternoon</option>
                            <option value="night">Night</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="avail" name="is_available" checked={form.is_available} onChange={handleChange} className="w-4 h-4 accent-teal-600 rounded" />
                        <label htmlFor="avail" className="text-sm text-gray-600 font-medium">Available for duty</label>
                    </div>
                </form>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
                    <button type="submit" form="nurse-form" disabled={submitting} className="px-8 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 disabled:opacity-50">
                        {submitting ? 'Saving...' : 'Save Record'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const NursesPage = () => {
    const { user } = useAuth();
    const [nurses, setNurses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modal, setModal] = useState({ show: false, nurse: null });

    const [search, setSearch] = useState('');
    const [available, setAvailable] = useState('');
    const [shift, setShift] = useState('');

    const canManage = user?.role === 'coordinator' || user?.role === 'admin';

    const fetchNurses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await nurseService.getAllNurses({ search, available, shift });
            setNurses(res.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [search, available, shift]);

    useEffect(() => {
        fetchNurses();
    }, [fetchNurses]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this nursing staff record?')) return;
        try {
            await nurseService.deleteNurse(id);
            fetchNurses();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-outfit">Nursing Staff</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage hospital nursing records and profile pictures</p>
                    </div>
                    {canManage && (
                        <button onClick={() => setModal({ show: true, nurse: null })} className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Nurse
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[300px]">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input placeholder="Search name, specialization..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-100 outline-none transition-all" />
                    </div>
                    <select value={available} onChange={e => setAvailable(e.target.value)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-100 outline-none">
                        <option value="">All Status</option>
                        <option value="true">Available</option>
                        <option value="false">Busy</option>
                    </select>
                    <select value={shift} onChange={e => setShift(e.target.value)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-100 outline-none">
                        <option value="">All Shifts</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="night">Night</option>
                        <option value="flexible">Flexible</option>
                    </select>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : nurses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {nurses.map(n => <NurseCard key={n.id} nurse={n} onEdit={nurse => setModal({ show: true, nurse })} onDelete={handleDelete} />)}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">No results found.</p>
                    </div>
                )}
            </div>

            {modal.show && (
                <NurseModal nurse={modal.nurse} onClose={() => setModal({ show: false, nurse: null })} onSaved={() => { setModal({ show: false, nurse: null }); fetchNurses(); }} />
            )}
        </Layout>
    );
};

export default NursesPage;
