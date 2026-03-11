import ScrollReveal from './ScrollReveal'

export default function CTABanner({ onRequestDemo }) {
    return (
        <section style={{ padding: '4rem 0' }}>
            <div className="container">
                <ScrollReveal animation="zoom-in" duration={700}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
                        borderRadius: '1.5rem',
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.35)'
                    }}>
                        {/* Background decorative elements */}
                        <div style={{
                            position: 'absolute', top: '-40px', right: '-40px',
                            width: '200px', height: '200px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.08)'
                        }} />
                        <div style={{
                            position: 'absolute', bottom: '-60px', left: '-30px',
                            width: '250px', height: '250px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)'
                        }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h2 style={{
                                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                                fontWeight: '800',
                                marginBottom: '1rem',
                                lineHeight: '1.2'
                            }}>
                                Ready to Transform Your Theatre Operations?
                            </h2>
                            <p style={{
                                fontSize: '1.15rem',
                                opacity: 0.9,
                                maxWidth: '600px',
                                margin: '0 auto 2.5rem auto',
                                lineHeight: '1.6'
                            }}>
                                Join hospitals already using TheatreX to improve scheduling efficiency, reduce downtime, and deliver better patient outcomes.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button
                                    className="btn"
                                    onClick={onRequestDemo}
                                    style={{
                                        backgroundColor: '#fff',
                                        color: '#1E40AF',
                                        fontWeight: '700',
                                        padding: '0.9rem 2rem',
                                        fontSize: '1rem',
                                        borderRadius: '9999px',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)' }}
                                >
                                    Request a Demo
                                </button>
                                <a
                                    href="#contact"
                                    className="btn"
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: '#fff',
                                        fontWeight: '600',
                                        padding: '0.9rem 2rem',
                                        fontSize: '1rem',
                                        borderRadius: '9999px',
                                        border: '2px solid rgba(255,255,255,0.5)',
                                        transition: 'background-color 0.2s, border-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)' }}
                                >
                                    Contact Us
                                </a>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
