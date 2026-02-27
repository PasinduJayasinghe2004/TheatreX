import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import technicianService from '../services/technicianService';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/common/ImageUpload';

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

const TechnicianCard = ({ technician, onEdit, onDelete }) => {
    const initials = technician.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const profilePic = technician.profile_picture
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${technician.profile_picture}`
        : null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4 relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => onEdit(technician)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => onDelete(technician.id)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-red-600 hover:border-red-200 shadow-sm transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    {profilePic ? (
                        <img src={profilePic} alt={technician.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-indigo-700">{initials}</span>
                        </div>
                    )}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight">{technician.name}</h3>
                        <p className="text-xs text-indigo-600 font-medium mt-0.5">{technician.specialization}</p>
                    </div>
                </div>
                <AvailBadge available={technician.is_available} />
            </div>

            <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="truncate">{technician.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <span>{technician.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <span className="text-gray-500">Licence:</span>
                    <span className="font-medium text-gray-900">{technician.license_number}</span>
                </div>
            </div>
        </div>
    );
};

const TechnicianModal = ({ technician, onClose, onSaved }) => {
    const [form, setForm] = useState(technician || {
        name: '',
        specialization: '',
        license_number: '',
        phone: '',
        email: '',
        is_available: true,
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => formData.append(key, form[key]));
            if (image) formData.append('profile_picture', image);

            if (technician?.id) {
                await technicianService.updateTechnician(technician.id, formData);
            } else {
                await technicianService.createTechnician(formData);
            }
            onSaved();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white">
                    <h2 className="font-semibold">{technician ? 'Edit Technician' : 'Add New Technician'}</h2>
                    <button onClick={onClose} className="hover:text-indigo-200 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">{error}</div>}

                    <ImageUpload
                        onImageSelect={setImage}
                        existingImage={technician?.profile_picture}
                    />

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                        <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Specialization *</label>
                        <input name="specialization" value={form.specialization} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Licence Number *</label>
                            <input name="license_number" value={form.license_number} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
                            <input name="phone" value={form.phone} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                    </div>

                    <div className="flex items-center gap-2">
                        <input id="avail" type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} className="w-4 h-4 accent-indigo-600" />
                        <label htmlFor="avail" className="text-xs font-medium text-gray-700">Available for assignment</label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {loading ? 'Saving...' : (technician ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TechniciansPage = () => {
    const { user } = useAuth();
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, technician: null });

    const fetchTechnicians = useCallback(async () => {
        setLoading(true);
        try {
            const res = await technicianService.getTechnicians();
            setTechnicians(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTechnicians();
    }, [fetchTechnicians]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this technician?')) {
            try {
                await technicianService.deleteTechnician(id);
                fetchTechnicians();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-outfit">Technicians</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage hospital technicians and profile pictures</p>
                    </div>
                    {(user?.role === 'coordinator' || user?.role === 'admin') && (
                        <button onClick={() => setModal({ show: true, technician: null })} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Technician
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : technicians.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {technicians.map(t => (
                            <TechnicianCard
                                key={t.id}
                                technician={t}
                                onEdit={(tech) => setModal({ show: true, technician: tech })}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">No technicians found. Add your first technician to get started.</p>
                    </div>
                )}

                {modal.show && (
                    <TechnicianModal
                        technician={modal.technician}
                        onClose={() => setModal({ show: false, technician: null })}
                        onSaved={() => { setModal({ show: false, technician: null }); fetchTechnicians(); }}
                    />
                )}
            </div>
        </Layout>
    );
};

export default TechniciansPage;
