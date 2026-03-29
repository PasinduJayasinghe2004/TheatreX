import { useState, useEffect, useCallback } from 'react';
import {
    Calendar,
    User,
    FileText,
    Stethoscope,
    Users,
    AlertCircle,
    ChevronRight
} from 'lucide-react';
import Modal from './ui/Modal';
import surgeryService from '../services/surgeryService';
import StatusBadge from './StatusBadge';
import Loading from './common/Loading';
import { useNavigate } from 'react-router-dom';

/**
 * SurgeryDetailsModal - Displays full details of a surgery in a popup.
 * Created by: Antigravity - Day 30
 */
const SurgeryDetailsModal = ({ isOpen, onClose, surgeryId }) => {
    const navigate = useNavigate();
    const [surgery, setSurgery] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSurgeryDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await surgeryService.getSurgeryById(surgeryId);
            if (response.success) {
                setSurgery(response.data);
            } else {
                setError(response.message || 'Failed to load details');
            }
        } catch (err) {
            setError(err.message || 'Error fetching surgery details');
            console.error('Error fetching details:', err);
        } finally {
            setLoading(false);
        }
    }, [surgeryId]);

    useEffect(() => {
        if (isOpen && surgeryId) {
            fetchSurgeryDetails();
        }
    }, [isOpen, surgeryId, fetchSurgeryDetails]);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return 'N/A';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${hour % 12 || 12}:${m} ${ampm}`;
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'emergency': return 'bg-red-50 text-red-700 border-red-200';
            case 'urgent': return 'bg-orange-50 text-orange-700 border-orange-200';
            default: return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={surgery ? `${surgery.surgery_type}` : 'Surgery Details'}
            size="lg"
            footer={
                <div className="flex justify-between items-center w-full">
                    <button
                        onClick={() => navigate(`/surgeries/${surgeryId}`)}
                        className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 underline decoration-blue-200"
                    >
                        View Full History & Notes
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
                    >
                        Close
                    </button>
                </div>
            }
        >
            {loading ? (
                <div className="py-12">
                    <Loading message="Fetching comprehensive surgery details..." />
                </div>
            ) : error ? (
                <div className="bg-red-50 p-4 rounded-lg flex gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            ) : surgery ? (
                <div className="space-y-6">
                    {/* Header Badges */}
                    <div className="flex flex-wrap gap-3">
                        <StatusBadge status={surgery.status} />
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getPriorityStyle(surgery.priority)}`}>
                            {surgery.priority || 'Routine'}
                        </span>
                        {surgery.is_emergency && (
                            <span className="bg-red-600 text-white px-2.5 py-0.5 rounded-full text-xs font-black uppercase flex items-center gap-1 animate-pulse">
                                <AlertCircle className="w-3 h-3" />
                                Emergency Case
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Schedule Section */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Schedule Data
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Date:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{formatDate(surgery.scheduled_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Time:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{formatTime(surgery.scheduled_time)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Duration:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{surgery.duration_minutes} Minutes</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Theatre:</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">{surgery.theatre_name || 'Unassigned'}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Patient Section */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Patient Record
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">FullName:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{surgery.patient_name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Age/Gender:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {surgery.patient_age || '??'} / {surgery.patient_gender || 'Unknown'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Patient ID:</span>
                                    <span className="font-mono text-xs bg-gray-200 px-1.5 rounded text-gray-700">#{surgery.patient_id || 'TEMP'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Medical Team Section */}
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <h3 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            Assigned Medical Team
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Surgeon */}
                            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg border border-blue-100/50 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">S</div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-black">Lead Surgeon</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {surgery.surgeon ? surgery.surgeon.name : 'Unassigned'}
                                    </p>
                                </div>
                            </div>
                            {/* Anaesthetist */}
                            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg border border-blue-100/50 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">A</div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-black">Anaesthetist</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {surgery.anaesthetist ? surgery.anaesthetist.name : 'Unassigned'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Nurses */}
                        <div className="mt-4">
                            <p className="text-[10px] text-gray-400 uppercase font-black mb-2 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Assigned Nurses ({surgery.nurses?.length || 0})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {surgery.nurses && surgery.nurses.length > 0 ? (
                                    surgery.nurses.map(nurse => (
                                        <span key={nurse.id} className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 shadow-sm">
                                            {nurse.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-400 italic">No nurses assigned yet.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 4. Notes Section */}
                    {(surgery.description || surgery.notes) && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Clinical Notes
                            </h3>
                            <div className="space-y-4">
                                {surgery.description && (
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Procedure Description</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{surgery.description}</p>
                                    </div>
                                )}
                                {surgery.notes && (
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Staff Notes</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{surgery.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </Modal>
    );
};

export default SurgeryDetailsModal;
