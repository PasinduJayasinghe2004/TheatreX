import { Menu, X, Home, Zap, Calendar, BarChart2, Users, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import theatrexLogo from '../../assets/theatrex-logo.svg'

export default function LandingNavbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [revealed, setRevealed] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const threshold = window.innerHeight * 0.6
        const onScroll = () => {
            setRevealed(window.scrollY > threshold)
            setScrolled(window.scrollY > threshold + 80)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const navLinks = [
        { label: 'Home', icon: <Home size={16} />, href: '#' },
        { label: 'Features', icon: <Zap size={16} />, href: '#features' },
        { label: 'Live Status', icon: <BarChart2 size={16} />, href: '#live-status' },
        { label: 'Scheduling', icon: <Calendar size={16} />, href: '#scheduling' },
        { label: 'Team', icon: <Users size={16} />, href: '#team' },
        { label: 'Contact', icon: <Mail size={16} />, href: '#contact' },
    ]

    const handleLogin = (e) => {
        e.preventDefault()
        navigate('/login')
    }

    return (
        <nav className={`quick-nav${revealed ? ' nav-revealed' : ''}${scrolled ? ' nav-scrolled' : ''}`}>
            <div className="quick-nav__inner">
                {/* Logo */}
                <a href="#" className="quick-nav__logo">
                    <img src={theatrexLogo} alt="TheatreX Logo" style={{ width: '24px', height: '24px' }} />
                    <span>TheatreX</span>
                </a>

                {/* Desktop Quick Links */}
                <div className="quick-nav__links desktop-menu">
                    {navLinks.map((link, i) => (
                        <a key={i} href={link.href} className="quick-nav__link">
                            {link.icon}
                            <span>{link.label}</span>
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <div className="quick-nav__cta desktop-menu" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>
                        Request Demo
                    </button>
                    <a
                        href="/login"
                        onClick={handleLogin}
                        className="btn btn-outline-primary"
                        style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem', border: '1px solid #00b4ff', color: '#00b4ff', background: 'transparent' }}
                    >
                        Login
                    </a>
                </div>

                {/* Mobile toggle */}
                <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile dropdown */}
            {isOpen && (
                <div className="quick-nav__mobile">
                    {navLinks.map((link, i) => (
                        <a key={i} href={link.href} className="quick-nav__mobile-link" onClick={() => setIsOpen(false)}>
                            {link.icon}
                            {link.label}
                        </a>
                    ))}
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
                        Request Demo
                    </button>
                    <a
                        href="/login"
                        onClick={handleLogin}
                        className="btn btn-outline-primary"
                        style={{ width: '100%', marginTop: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.9rem', border: '1px solid #00b4ff', color: '#00b4ff', background: 'transparent', textAlign: 'center', display: 'block' }}
                    >
                        Login
                    </a>
                </div>
            )}

            <style>{`
                .quick-nav {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    z-index: 1000;
                    padding: 0.6rem 1.5rem;
                    background: rgba(15, 23, 42, 0.78);
                    backdrop-filter: blur(18px);
                    -webkit-backdrop-filter: blur(18px);
                    border-bottom: 1px solid rgba(0, 180, 255, 0.18);
                    transform: translateY(-110%);
                    opacity: 0;
                    pointer-events: none;
                    transition:
                        transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
                        opacity   0.4s ease,
                        background 0.35s ease,
                        box-shadow 0.35s ease;
                }

                .nav-revealed {
                    transform: translateY(0);
                    opacity: 1;
                    pointer-events: auto;
                }

                .nav-scrolled {
                    background: rgba(10, 16, 36, 0.96) !important;
                    box-shadow: 0 4px 32px rgba(0, 140, 255, 0.2);
                    border-bottom-color: rgba(0, 180, 255, 0.35) !important;
                }
                .quick-nav__inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }
                .quick-nav__logo,
                .landing-page .quick-nav__logo {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 1.15rem;
                    color: #fff !important;
                    flex-shrink: 0;
                }
                .quick-nav__links {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .quick-nav__link,
                .landing-page .quick-nav__link {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.4rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.8) !important;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }
                .quick-nav__link:hover {
                    color: #fff;
                    background: rgba(0, 180, 255, 0.15);
                    box-shadow: 0 0 12px rgba(0, 180, 255, 0.2);
                }
                .quick-nav__cta {
                    flex-shrink: 0;
                }
                .mobile-toggle {
                    display: none !important;
                    color: #fff;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.25rem;
                }
                .quick-nav__mobile {
                    display: none;
                    flex-direction: column;
                    gap: 0.25rem;
                    padding: 0.75rem 0 0.5rem;
                }
                .quick-nav__mobile-link,
                .landing-page .quick-nav__mobile-link {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.6rem 0.75rem;
                    border-radius: 0.5rem;
                    color: rgba(255, 255, 255, 0.8) !important;
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: background 0.2s;
                }
                .quick-nav__mobile-link:hover {
                    background: rgba(0, 180, 255, 0.12);
                    color: #fff;
                }
                @media (max-width: 768px) {
                    .desktop-menu { display: none !important; }
                    .mobile-toggle { display: block !important; }
                    .quick-nav__mobile { display: flex; }
                }
            `}</style>
        </nav>
    )
}
