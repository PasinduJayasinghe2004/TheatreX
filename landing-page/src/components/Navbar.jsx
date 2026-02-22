import { Menu, X, Activity, Home, Zap, Calendar, BarChart2, Users, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
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

    return (
        <nav className={`quick-nav ${scrolled ? 'quick-nav--scrolled' : ''}`}>
            <div className="quick-nav__inner">
                {/* Logo */}
                <a href="#" className="quick-nav__logo">
                    <Activity color="#00b4ff" size={22} />
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
                        href="/login" // Change to your main site's login URL if needed
                        target="_blank"
                        rel="noopener noreferrer"
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
                        href="/login" // Change to your main site's login URL if needed
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary"
                        style={{ width: '100%', marginTop: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.9rem', border: '1px solid #00b4ff', color: '#00b4ff', background: 'transparent', textAlign: 'center', display: 'block' }}
                    >
                        Login
                    </a>
                </div>
            )}

            <style>{`
                .quick-nav {
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    padding: 0.6rem 1.5rem;
                    background: rgba(15, 23, 42, 0.75);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-bottom: 1px solid rgba(0, 180, 255, 0.15);
                    transition: all 0.3s ease;
                }
                .quick-nav--scrolled {
                    background: rgba(15, 23, 42, 0.92);
                    box-shadow: 0 4px 30px rgba(0, 140, 255, 0.1);
                    border-bottom-color: rgba(0, 180, 255, 0.25);
                }
                .quick-nav__inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }
                .quick-nav__logo {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 1.15rem;
                    color: #fff;
                    flex-shrink: 0;
                }
                .quick-nav__links {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .quick-nav__link {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.4rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.7);
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
                .quick-nav__mobile-link {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.6rem 0.75rem;
                    border-radius: 0.5rem;
                    color: rgba(255, 255, 255, 0.8);
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
