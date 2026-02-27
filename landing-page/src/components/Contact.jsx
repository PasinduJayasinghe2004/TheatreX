import { useState } from 'react'
import ScrollReveal from './ScrollReveal'

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
    }

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem 0.75rem 3rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #E5E7EB',
        outline: 'none',
        fontSize: '0.95rem',
        color: 'var(--text-main)',
        backgroundColor: '#fff',
        transition: 'border-color 0.2s',
    }

    const labelStyle = {
        display: 'block',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: 'var(--text-main)',
        fontSize: '0.95rem'
    }

    const iconStyle = {
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9CA3AF',
        pointerEvents: 'none'
    }

    return (
        <section id="contact" style={{ padding: '6rem 0' }}>
            <div className="container">
                <ScrollReveal animation="fade-up">
                    <h2 className="section-title">Get in Touch</h2>
                    <p className="section-subtitle">
                        Have questions about TheatreX? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </ScrollReveal>

                <ScrollReveal animation="zoom-in" delay={150} duration={700}>
                <div style={{
                    maxWidth: '700px',
                    margin: '0 auto',
                    backgroundColor: 'var(--bg-white)',
                    padding: '3rem',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid #E5E7EB'
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" style={labelStyle}>Name</label>
                            <div style={{ position: 'relative' }}>
                                <div style={iconStyle}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Your name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" style={labelStyle}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <div style={iconStyle}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                />
                            </div>
                        </div>

                        {/* Message Field */}
                        <div>
                            <label htmlFor="message" style={labelStyle}>Message</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ ...iconStyle, top: '1.5rem', transform: 'none' }}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                </div>
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="Tell us how we can help you..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5"
                                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                ></textarea>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            Send Message
                        </button>

                    </form>
                </div>
                </ScrollReveal>
            </div>
        </section>
    )
}

export default Contact
