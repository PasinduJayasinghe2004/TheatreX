import { Calendar as CalendarIcon, Clock, Users, ShieldCheck, ArrowRight } from 'lucide-react'

export default function SmartScheduling() {
    return (
        <section style={{ padding: '0 0 5rem 0' }}>
            <div className="container">
                <div style={{
                    backgroundColor: '#3B82F6',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '2rem',
                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                }}>
                    <CalendarIcon fill="currentColor" size={24} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Smart Calendar Scheduling</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Detailed Features */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#fff',
                            borderRadius: '0.75rem',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                <div style={{ padding: '0.5rem', backgroundColor: '#EFF6FF', borderRadius: '0.5rem', height: 'fit-content' }}>
                                    <Clock size={20} color="#2563EB" />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: '700', fontSize: '1.1rem', color: '#111827' }}>Modify in Real-Time</h4>
                                    <p style={{ color: '#6B7280', marginTop: '0.25rem', fontSize: '0.95rem' }}>
                                        Delay, swap, or extend slots instantly. System auto-updates all connected parties.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#fff',
                            borderRadius: '0.75rem',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                <div style={{ padding: '0.5rem', backgroundColor: '#FDF2F8', borderRadius: '0.5rem', height: 'fit-content' }}>
                                    <Users size={20} color="#DB2777" />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: '700', fontSize: '1.1rem', color: '#111827' }}>Staff Assignment</h4>
                                    <p style={{ color: '#6B7280', marginTop: '0.25rem', fontSize: '0.95rem' }}>
                                        Automated checking of surgeon, nurse, and support staff availability with conflict alerts.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#fff',
                            borderRadius: '0.75rem',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                <div style={{ padding: '0.5rem', backgroundColor: '#ECFDF5', borderRadius: '0.5rem', height: 'fit-content' }}>
                                    <ShieldCheck size={20} color="#059669" />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: '700', fontSize: '1.1rem', color: '#111827' }}>Resource Optimization</h4>
                                    <p style={{ color: '#6B7280', marginTop: '0.25rem', fontSize: '0.95rem' }}>
                                        System suggestions for max room usage and reduced turn-over times.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature List */}
                    <div style={{
                        backgroundColor: '#F9FAFB',
                        padding: '2rem',
                        borderRadius: '1rem',
                        border: '1px solid #F3F4F6'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>Advanced Scheduling Features</h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                "Drag & Drop scheduling interface for easy modifying.",
                                "Auto-assign based on room availability and equipment.",
                                "Visual conflict highlighting and resolution.",
                                "Real-time resource availability tracking."
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: '#4B5563', fontSize: '0.95rem' }}>
                                    <ArrowRight size={18} color="#9CA3AF" style={{ marginTop: '2px' }} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <style>{`
        @media (max-width: 768px) {
          section .container > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </section>
    )
}
