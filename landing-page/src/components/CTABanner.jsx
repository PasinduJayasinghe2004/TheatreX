import { ArrowRight, Sparkles } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

export default function CTABanner() {
    return (
        <section style={{ padding: '3rem 0 6rem 0' }}>
            <div className="container">
                <ScrollReveal animation="fade-up" duration={600}>
                    <div style={{
                        background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                        borderRadius: '1.5rem',
                        padding: '4rem 3rem',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Decorative circles */}
                        <div style={{
                            position: 'absolute',
                            top: '-3rem',
                            right: '-3rem',
                            width: '12rem',
                            height: '12rem',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '-2rem',
                            left: '-2rem',
                            width: '8rem',
                            height: '8rem',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                        }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                color: '#fff',
                                padding: '0.35rem 1rem',
                                borderRadius: '999px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                marginBottom: '1.5rem',
                            }}>
                                <Sparkles size={16} />
                                Ready to Transform?
                            </div>

                            <h2 style={{
                                fontSize: '2.25rem',
                                fontWeight: '800',
                                color: '#fff',
                                marginBottom: '1rem',
                                lineHeight: '1.2',
                                letterSpacing: '-0.02em',
                            }}>
                                Modernize Your Theatre Management
                            </h2>
                            <p style={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '1.1rem',
                                maxWidth: '550px',
                                margin: '0 auto 2rem auto',
                                lineHeight: '1.6',
                            }}>
                                Join hospitals that have eliminated double bookings, reduced idle time, and improved patient care with TheatreX.
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <button
                                    className="btn"
                                    style={{
                                        backgroundColor: '#fff',
                                        color: '#2563EB',
                                        fontWeight: '700',
                                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                                    }}
                                >
                                    Get Started Free <ArrowRight size={18} />
                                </button>
                                <button
                                    className="btn"
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: '2px solid rgba(255,255,255,0.4)',
                                        color: '#fff',
                                    }}
                                >
                                    View Live Demo
                                </button>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
