import { AnimatedZap, AnimatedStatusDot, AnimatedInfoDot } from './AnimatedIcons'
import ScrollReveal from './ScrollReveal'

export default function LiveStatus() {
    return (
        <section id="live-status" style={{ padding: '5rem 0' }}>
            <div className="container">
                <ScrollReveal animation="fade-down" duration={600}>
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
                        <AnimatedZap />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Live Theatre Status</h2>
                    </div>
                </ScrollReveal>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    {/* Status Indicators */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        <ScrollReveal animation="fade-right" delay={100}>
                            <div style={{
                                backgroundColor: '#FEF2F2',
                                border: '1px solid #FEE2E2',
                                padding: '1.25rem',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <AnimatedStatusDot dotColor="#EF4444" status="in-use" />
                                <div>
                                    <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: '#111827' }}>Theatre 1 • In Use</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Cardiac Bypass • Dr. Reynolds • +0:22</p>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal animation="fade-right" delay={200}>
                            <div style={{
                                backgroundColor: '#FFFBEB',
                                border: '1px solid #FEF3C7',
                                padding: '1.25rem',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <AnimatedStatusDot dotColor="#F59E0B" status="pre-op" />
                                <div>
                                    <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: '#111827' }}>Theatre 2 • Pre-op</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Hip Replacement • Team B • Starting in 10m</p>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal animation="fade-right" delay={300}>
                            <div style={{
                                backgroundColor: '#EFF6FF',
                                border: '1px solid #DBEAFE',
                                padding: '1.25rem',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <AnimatedStatusDot dotColor="#3B82F6" status="cleaning" />
                                <div>
                                    <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: '#111827' }}>Theatre 3 • Cleaning</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Post-op sanitation in progress • Est. 15m</p>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal animation="fade-right" delay={400}>
                            <div style={{
                                backgroundColor: '#ECFDF5',
                                border: '1px solid #D1FAE5',
                                padding: '1.25rem',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <AnimatedStatusDot dotColor="#10B981" status="available" />
                                <div>
                                    <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: '#111827' }}>Theatre 4 • Available</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Ready for next procedure</p>
                                </div>
                            </div>
                        </ScrollReveal>

                    </div>

                    {/* Key Information */}
                    <ScrollReveal animation="fade-left" delay={200}>
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
                                        <AnimatedInfoDot />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScrollReveal>
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
