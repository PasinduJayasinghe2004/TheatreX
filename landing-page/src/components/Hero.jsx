import { ArrowRight, PlayCircle } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

export default function Hero() {

    const handleGetStarted = (e) => {
        e.preventDefault()
        const landing = document.querySelector('.landing-page')
        if (landing) {
            landing.classList.add('landing-exit')
            landing.addEventListener('animationend', () => { window.location.href = '/login' }, { once: true })
        } else {
            window.location.href = '/login'
        }
    }

    return (
        <section style={{ padding: '6rem 0', overflow: 'hidden' }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '4rem',
                    alignItems: 'center'
                }}>
                    <ScrollReveal animation="fade-right" duration={800}>
                        <div style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            borderRadius: '999px',
                            fontSize: '0.875rem',
                            marginBottom: '1.5rem',
                            fontWeight: '500'
                        }}>
                            Digital Operations Platform
                        </div>
                        <h1 style={{
                            fontSize: '3.5rem',
                            lineHeight: '1.1',
                            color: '#111827',
                            marginBottom: '1.5rem',
                            fontWeight: '800',
                            letterSpacing: '-0.02em'
                        }}>
                            Streamline Your<br />Theatre Operations
                        </h1>
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#6B7280',
                            marginBottom: '2.5rem',
                            lineHeight: '1.6',
                            maxWidth: '500px'
                        }}>
                            Real-time theatre monitoring, intelligent staff scheduling, and comprehensive analytics all in one powerful platform. Optimize your surgical operations for maximum efficiency.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" onClick={handleGetStarted}>
                                Get started <ArrowRight size={18} />
                            </button>
                            <button className="btn btn-outline" style={{ border: '1px solid #E5E7EB', color: '#111827' }}>
                                <PlayCircle size={18} style={{ marginRight: '0.5rem' }} /> Live demo
                            </button>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal animation="fade-left" delay={200} duration={800}>
                        {/* Image container with nice shadow and rounded corners */}
                        <div style={{
                            position: 'relative',
                            borderRadius: '1.5rem',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            <img
                                src="/hero-surgery.jpg"
                                alt="Surgeons implementing theatre operations"
                                loading="lazy"
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    )
}
