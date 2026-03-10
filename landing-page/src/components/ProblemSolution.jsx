import { XCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const problems = [
    { text: 'Paper-based scheduling leads to double bookings' },
    { text: 'Phone calls for coordination cause miscommunication' },
    { text: 'Manual status updates become outdated instantly' },
    { text: 'No central visibility creates staff confusion' },
    { text: 'No automated reminders result in missed surgeries' },
]

const solutions = [
    { text: 'Smart digital scheduling with conflict detection' },
    { text: 'Real-time notifications keep everyone in sync' },
    { text: 'Live theatre dashboards with instant updates' },
    { text: 'Centralized platform accessible by all staff' },
    { text: 'Automated alerts and reminders for every surgery' },
]

export default function ProblemSolution() {
    return (
        <section id="problem-solution" style={{ padding: '6rem 0' }}>
            <div className="container">
                <ScrollReveal animation="fade-up">
                    <h2 className="section-title">The Problem We Solve</h2>
                    <p className="section-subtitle">
                        Hospitals still rely on outdated manual processes. TheatreX replaces chaos with clarity.
                    </p>
                </ScrollReveal>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    gap: '2rem',
                    alignItems: 'start',
                }}>
                    {/* Problem Column */}
                    <ScrollReveal animation="fade-right" duration={600}>
                        <div style={{
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: '1rem',
                            padding: '2rem',
                        }}>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#991B1B',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                <XCircle size={22} color="#DC2626" />
                                Without TheatreX
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {problems.map((item, i) => (
                                    <li key={i} style={{
                                        display: 'flex',
                                        gap: '0.75rem',
                                        alignItems: 'flex-start',
                                        color: '#7F1D1D',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5',
                                    }}>
                                        <XCircle size={18} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScrollReveal>

                    {/* Arrow */}
                    <ScrollReveal animation="zoom-in" delay={300}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            paddingTop: '4rem',
                        }}>
                            <div style={{
                                width: '3.5rem',
                                height: '3.5rem',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                            }}>
                                <ArrowRight size={22} color="#fff" />
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Solution Column */}
                    <ScrollReveal animation="fade-left" duration={600}>
                        <div style={{
                            backgroundColor: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            borderRadius: '1rem',
                            padding: '2rem',
                        }}>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#166534',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                <CheckCircle2 size={22} color="#16A34A" />
                                With TheatreX
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {solutions.map((item, i) => (
                                    <li key={i} style={{
                                        display: 'flex',
                                        gap: '0.75rem',
                                        alignItems: 'flex-start',
                                        color: '#14532D',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5',
                                    }}>
                                        <CheckCircle2 size={18} color="#22C55E" style={{ marginTop: '2px', flexShrink: 0 }} />
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScrollReveal>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    #problem-solution .container > div:last-of-type {
                        grid-template-columns: 1fr !important;
                    }
                    #problem-solution .container > div:last-of-type > div:nth-child(2) {
                        transform: rotate(90deg);
                    }
                }
            `}</style>
        </section>
    )
}
