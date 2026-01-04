import { Zap } from 'lucide-react'

export default function LiveStatus() {
    return (
        <section style={{ padding: '5rem 0' }}>
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
                    <Zap fill="currentColor" size={24} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Live Theatre Status</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    {/* Status Indicators */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        <div style={{
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FEE2E2',
                            padding: '1.25rem',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }}></div>
                            <div>
                                <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: '#111827' }}>Theatre 1 • In Use</h4>
                                <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Cardiac Bypass • Dr. Reynolds • +0:22</p>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: '#FFFBEB',
                            border: '1px solid #FEF3C7',
                            padding: '1.25rem',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></div>
                            <div>
                                <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: '#111827' }}>Theatre 2 • Pre-op</h4>
                                <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Hip Replacement • Team B • Starting in 10m</p>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #DBEAFE',
                            padding: '1.25rem',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3B82F6' }}></div>
                            <div>
                                <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: '#111827' }}>Theatre 3 • Cleaning</h4>
                                <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Post-op sanitation in progress • Est. 15m</p>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: '#ECFDF5',
                            border: '1px solid #D1FAE5',
                            padding: '1.25rem',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
                            <div>
                                <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: '#111827' }}>Theatre 4 • Available</h4>
                                <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Ready for next procedure</p>
                            </div>
                        </div>

                    </div>

                    {/* Key Information */}
                    <div style={{
                        backgroundColor: '#F9FAFB',
                        padding: '2rem',
                        borderRadius: '1rem',
                        border: '1px solid #F3F4F6'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>Key Information</h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                "Real-time progress tracking for all active surgeries.",
                                "Auto-generated alerts for delays or schedule changes.",
                                "Instant status updates for cleaning teams.",
                                "Mobile notifications for theatre exchanges."
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: '#4B5563', fontSize: '0.95rem' }}>
                                    <div style={{
                                        minWidth: '20px',
                                        height: '20px',
                                        backgroundColor: '#DBEAFE',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: '2px'
                                    }}>
                                        <div style={{ width: '6px', height: '6px', backgroundColor: '#2563EB', borderRadius: '50%' }}></div>
                                    </div>
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
