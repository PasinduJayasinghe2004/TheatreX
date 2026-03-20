import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import surgeryService from '../services/surgeryService';

const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString();
};

const formatTime = (value) => {
    if (!value) return 'N/A';
    const raw = String(value);
    const timePart = raw.includes('T') ? raw.split('T')[1].slice(0, 5) : raw.slice(0, 5);
    return timePart || raw;
};

const SurgeryPrintView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [surgery, setSurgery] = useState(null);

    useEffect(() => {
        const fetchSurgery = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await surgeryService.getSurgeryById(id);
                if (response?.success && response.data) {
                    setSurgery(response.data);
                } else {
                    setError(response?.message || 'Failed to load surgery details for print view');
                }
            } catch (err) {
                setError(err.message || 'Failed to load surgery details for print view');
            } finally {
                setLoading(false);
            }
        };

        fetchSurgery();
    }, [id]);

    const printableRows = useMemo(() => {
        if (!surgery) return [];

        return [
            ['Surgery ID', surgery.id],
            ['Patient Name', surgery.patient_name || 'N/A'],
            ['Patient Age', surgery.patient_age || 'N/A'],
            ['Patient Gender', surgery.patient_gender || 'N/A'],
            ['Surgery Type', surgery.surgery_type || 'N/A'],
            ['Description', surgery.description || 'N/A'],
            ['Scheduled Date', formatDate(surgery.scheduled_date)],
            ['Scheduled Time', formatTime(surgery.scheduled_time)],
            ['Duration', `${surgery.duration_minutes || 0} min`],
            ['Status', surgery.status || 'N/A'],
            ['Priority', surgery.priority || 'N/A'],
            ['Theatre ID', surgery.theatre_id || 'N/A'],
            ['Surgeon', surgery.surgeon?.name || 'Unassigned'],
            ['Surgeon Email', surgery.surgeon?.email || 'N/A'],
            ['Notes', surgery.notes || 'N/A'],
            ['Created At', surgery.created_at ? new Date(surgery.created_at).toLocaleString() : 'N/A'],
            ['Updated At', surgery.updated_at ? new Date(surgery.updated_at).toLocaleString() : 'N/A']
        ];
    }, [surgery]);

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 print:bg-white print:p-0">
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white;
                    }
                }
            `}</style>

            <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 print:shadow-none print:border-0 print:max-w-full print:rounded-none print:p-0">
                <div className="no-print flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Print
                    </button>
                </div>

                <header className="mb-6 border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Surgery Detail Report</h1>
                    <p className="text-sm text-gray-600 mt-1">TheatreX print-friendly record</p>
                </header>

                {loading && <p className="text-sm text-gray-600">Loading surgery details...</p>}

                {!loading && error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && surgery && (
                    <div className="overflow-hidden border border-gray-200 rounded-lg">
                        <table className="min-w-full text-sm">
                            <tbody className="divide-y divide-gray-200">
                                {printableRows.map(([label, value]) => (
                                    <tr key={label}>
                                        <th className="w-1/3 px-4 py-3 text-left font-semibold text-gray-700 bg-gray-50">{label}</th>
                                        <td className="px-4 py-3 text-gray-900">{value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SurgeryPrintView;
