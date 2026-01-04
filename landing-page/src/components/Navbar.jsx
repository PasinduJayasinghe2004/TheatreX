import { Menu, X, Activity } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6', padding: '1rem 0' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity color="var(--primary)" size={24} />
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>TheatreX</span>
                </div>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>
                        <a href="#" style={{ transition: 'color 0.2s' }} className="hover:text-blue-600">Product</a>
                        <a href="#">Company</a>
                        <a href="#">Resources</a>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Log in</button>
                        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Request demo</button>
                    </div>
                </div>

                <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} style={{ display: 'none' }}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu logic would go here, simplified for now */}
            <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
        </nav>
    )
}
