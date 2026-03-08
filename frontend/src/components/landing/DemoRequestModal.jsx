// ============================================================================
// Demo Request Modal Component
// ============================================================================
// Premium glassmorphic modal for the landing page "Request Demo" button.
// Fields: Name, Email, Organization, Role, Phone, Message
// Features: Escape-to-close, backdrop-click-to-close, success toast,
//           smooth fade + scale animation, consistent with landing theme.
// ============================================================================

import { useState, useEffect, useRef } from 'react'
import { X, User, Mail, Building2, Briefcase, Phone, MessageSquare, Send, CheckCircle2, Sparkles } from 'lucide-react'

const ROLES = ['Surgeon', 'Admin / Coordinator', 'Nurse', 'Anaesthetist', 'Technician', 'Other']

export default function DemoRequestModal({ isOpen, onClose }) {
    const backdropRef = useRef(null)
    const firstInputRef = useRef(null)

    const [form, setForm] = useState({
        name: '', email: '', organization: '', role: '', phone: '', message: ''
    })
    const [submitted, setSubmitted] = useState(false)
    const [errors, setErrors] = useState({})

    // ── Focus first input on open ──
    useEffect(() => {
        if (isOpen && !submitted) {
            setTimeout(() => firstInputRef.current?.focus(), 300)
        }
    }, [isOpen, submitted])

    // ── Escape key ──
    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    // ── Lock body scroll ──
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    // ── Reset on close ──
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setSubmitted(false)
                setForm({ name: '', email: '', organization: '', role: '', phone: '', message: '' })
                setErrors({})
            }, 300)
        }
    }, [isOpen])

    const validate = () => {
        const errs = {}
        if (!form.name.trim()) errs.name = 'Name is required'
        if (!form.email.trim()) errs.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) return
        console.log('📬 Demo request submitted:', form)
        setSubmitted(true)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    if (!isOpen) return null

    return (
        <div
            ref={backdropRef}
            onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', justifyContent: 'center',
                alignItems: 'flex-start', // Start from top to prevent clipping
                padding: '2rem 1rem',
                overflowY: 'auto', // Allow wrapper to scroll
                animation: 'demoFadeIn 0.3s ease-out',
                pointerEvents: 'auto',
            }}
        >
            {/* Backdrop */}
            <div style={{
                position: 'fixed', inset: 0, // Fixed to cover whole screen even when scrolling
                background: 'rgba(2, 6, 23, 0.65)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                zIndex: -1,
            }} />

            {/* Modal Card */}
            <div style={{
                position: 'relative',
                width: '100%', maxWidth: '520px',
                margin: 'auto', // This centers it vertically if there is space, or puts it at the top if too tall
                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.97), rgba(30, 41, 59, 0.95))',
                border: '1px solid rgba(0, 180, 255, 0.2)',
                borderRadius: '1.25rem',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 140, 255, 0.08)',
                animation: 'demoScaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>

                {/* Glow accent */}
                <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '60%', height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(0, 180, 255, 0.6), transparent)',
                }} />

                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem', padding: '0.4rem',
                        color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                >
                    <X size={18} />
                </button>

                {/* ── Success State ── */}
                {submitted ? (
                    <div style={{
                        padding: '3.5rem 2rem',
                        textAlign: 'center',
                        animation: 'demoFadeIn 0.4s ease-out',
                    }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.1))',
                            border: '2px solid rgba(16, 185, 129, 0.4)',
                            marginBottom: '1.5rem',
                        }}>
                            <CheckCircle2 size={36} color="#10B981" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                            Request Received!
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto 2rem' }}>
                            Thank you, <strong style={{ color: '#fff' }}>{form.name}</strong>. Our team will reach out to{' '}
                            <strong style={{ color: '#60A5FA' }}>{form.email}</strong> within 24 hours to schedule your personalized demo.
                        </p>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                                color: '#fff', border: 'none', borderRadius: '0.75rem',
                                padding: '0.75rem 2rem', fontWeight: 600, fontSize: '0.95rem',
                                cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    /* ── Form State ── */
                    <div style={{ padding: '2rem 2rem 2.5rem' }}>
                        {/* Header */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.2rem 0.7rem', borderRadius: '999px',
                                background: 'rgba(0, 180, 255, 0.1)',
                                border: '1px solid rgba(0, 180, 255, 0.2)',
                                fontSize: '0.75rem', color: '#60A5FA', fontWeight: 500,
                                marginBottom: '0.75rem',
                            }}>
                                <Sparkles size={12} /> Request a Demo
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>
                                Experience TheatreX
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                Fill in your details and our team will schedule a personalized walkthrough of the platform.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Name + Email row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <Field
                                    ref={firstInputRef}
                                    icon={<User size={16} />} label="Name" name="name" placeholder="Your name"
                                    value={form.name} onChange={handleChange} error={errors.name} required
                                />
                                <Field
                                    icon={<Mail size={16} />} label="Email" name="email" type="email" placeholder="you@hospital.com"
                                    value={form.email} onChange={handleChange} error={errors.email} required
                                />
                            </div>

                            {/* Organization + Role row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <Field
                                    icon={<Building2 size={16} />} label="Organization" name="organization" placeholder="Hospital / Clinic"
                                    value={form.organization} onChange={handleChange}
                                />
                                <div>
                                    <label style={labelStyle}>
                                        <Briefcase size={14} style={{ marginRight: '0.35rem', opacity: 0.5 }} /> Role
                                    </label>
                                    <select
                                        name="role" value={form.role} onChange={handleChange}
                                        style={{
                                            ...inputBaseStyle,
                                            cursor: 'pointer',
                                            appearance: 'none',
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'right 0.75rem center',
                                        }}
                                    >
                                        <option value="" style={{ background: '#1e293b' }}>Select role...</option>
                                        {ROLES.map(r => <option key={r} value={r} style={{ background: '#1e293b' }}>{r}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Phone */}
                            <Field
                                icon={<Phone size={16} />} label="Phone" name="phone" type="tel" placeholder="+94 7X XXX XXXX"
                                value={form.phone} onChange={handleChange}
                            />

                            {/* Message */}
                            <div>
                                <label style={labelStyle}>
                                    <MessageSquare size={14} style={{ marginRight: '0.35rem', opacity: 0.5 }} /> Message
                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, marginLeft: '0.3rem' }}>(optional)</span>
                                </label>
                                <textarea
                                    name="message" value={form.message} onChange={handleChange}
                                    placeholder="Tell us about your needs or any specific features you'd like to explore..."
                                    rows={3}
                                    style={{ ...inputBaseStyle, resize: 'vertical', fontFamily: 'inherit', minHeight: '80px' }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(0, 180, 255, 0.5)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    width: '100%', padding: '0.85rem',
                                    background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                                    color: '#fff', border: 'none', borderRadius: '0.75rem',
                                    fontWeight: 600, fontSize: '0.95rem',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                                    marginTop: '0.25rem',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.5)' }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.4)' }}
                            >
                                <Send size={16} /> Request Demo
                            </button>

                            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '-0.25rem' }}>
                                We'll respond within 24 hours. No spam, ever.
                            </p>
                        </form>
                    </div>
                )}
            </div>

            {/* Keyframe animations */}
            <style>{`
                @keyframes demoFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes demoScaleIn {
                    from { opacity: 0; transform: scale(0.92) translateY(10px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    )
}

/* ── Shared styles ── */
const labelStyle = {
    display: 'flex', alignItems: 'center',
    fontSize: '0.8rem', fontWeight: 500,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '0.35rem',
}

const inputBaseStyle = {
    width: '100%',
    padding: '0.65rem 0.85rem',
    fontSize: '0.9rem',
    color: '#fff',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.6rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
}

/* ── Reusable Field component ── */
import { forwardRef } from 'react'

const Field = forwardRef(({ icon, label, name, type = 'text', placeholder, value, onChange, error, required }, ref) => (
    <div>
        <label style={labelStyle}>
            {icon && <span style={{ marginRight: '0.35rem', opacity: 0.5, display: 'flex' }}>{icon}</span>}
            {label}
            {required && <span style={{ color: '#f87171', marginLeft: '0.2rem' }}>*</span>}
        </label>
        <input
            ref={ref}
            type={type} name={name} placeholder={placeholder}
            value={value} onChange={onChange}
            style={{
                ...inputBaseStyle,
                ...(error ? { borderColor: 'rgba(248, 113, 113, 0.6)' } : {}),
            }}
            onFocus={e => e.target.style.borderColor = error ? 'rgba(248, 113, 113, 0.6)' : 'rgba(0, 180, 255, 0.5)'}
            onBlur={e => e.target.style.borderColor = error ? 'rgba(248, 113, 113, 0.6)' : 'rgba(255,255,255,0.1)'}
        />
        {error && <p style={{ color: '#f87171', fontSize: '0.72rem', marginTop: '0.25rem' }}>{error}</p>}
    </div>
))

Field.displayName = 'Field'
