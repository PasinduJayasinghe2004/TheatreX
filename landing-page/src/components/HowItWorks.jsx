import { CalendarPlus, BellRing, Monitor, BarChart2 } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const steps = [
    {
        icon: <CalendarPlus size={28} color="#fff" />,
        number: '01',
        title: 'Schedule a Surgery',
        desc: 'Create a booking with patient details, required staff, and preferred time slot. The system auto-checks for conflicts.',
        color: '#2563EB',
    },
    {
        icon: <BellRing size={28} color="#fff" />,
        number: '02',
        title: 'Staff Get Notified',
        desc: 'Surgeons, nurses, and anaesthetists receive instant notifications with all details about their upcoming assignments.',
        color: '#7C3AED',
    },
    {
        icon: <Monitor size={28} color="#fff" />,
        number: '03',
        title: 'Track in Real-Time',
        desc: 'Monitor theatre status live — see which rooms are in use, in cleaning, or available. Know exactly where things stand.',
        color: '#059669',
    },
    {
        icon: <BarChart2 size={28} color="#fff" />,
        number: '04',
        title: 'Review Analytics',
        desc: 'After procedures, review utilization rates, turnaround times, and efficiency metrics to optimize future operations.',
        color: '#D97706',
    },
]

export default function HowItWorks() {
    return (
        <section id="how-it-works" style={{ padding: '6rem 0' }}>
            <div className="container">
                <ScrollReveal animation="fade-up">
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-subtitle">
                        From scheduling to analytics — four simple steps to streamlined theatre operations.
                    </p>
                </ScrollReveal>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '2rem',
                    position: 'relative',
                }}>
                    {steps.map((step, idx) => (
                        <ScrollReveal key={idx} animation="fade-up" delay={idx * 150} duration={600}>
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem 1.5rem',
                                position: 'relative',
                            }}>
                                {/* Step number badge */}
                                <div style={{
                                    width: '4rem',
                                    height: '4rem',
                                    borderRadius: '50%',
                                    backgroundColor: step.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem auto',
                                    boxShadow: `0 8px 20px ${step.color}44`,
                                    position: 'relative',
                                }}>
                                    {step.icon}
                                </div>

                                {/* Connector line (not on last item) */}
                                {idx < steps.length - 1 && (
                                    <div className="how-it-works-connector" style={{
                                        position: 'absolute',
                                        top: '4rem',
                                        right: '-1rem',
                                        width: '2rem',
                                        height: '2px',
                                        backgroundColor: '#E5E7EB',
                                    }} />
                                )}

                                <div style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    color: step.color,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginBottom: '0.5rem',
                                }}>
                                    Step {step.number}
                                </div>
                                <h3 style={{
                                    fontSize: '1.15rem',
                                    fontWeight: '700',
                                    color: '#111827',
                                    marginBottom: '0.75rem',
                                }}>
                                    {step.title}
                                </h3>
                                <p style={{
                                    color: '#6B7280',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.6',
                                }}>
                                    {step.desc}
                                </p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .how-it-works-connector {
                        display: none !important;
                    }
                }
            `}</style>
        </section>
    )
}
