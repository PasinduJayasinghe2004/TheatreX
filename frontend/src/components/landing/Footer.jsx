import { Activity, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react'

export default function Footer() {
    return (
        <footer>
            {/* Main Footer */}
            <div style={{ backgroundColor: '#0F172A', color: '#94A3B8', paddingTop: '8rem', paddingBottom: '4rem', position: 'relative', zIndex: 2 }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'white' }}>
                                <Activity color="#3B82F6" size={24} />
                                <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>TheatreX</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Transforming surgical operations with intelligence, efficiency, and care.
                            </p>
                        </div>

                        <div>
                            <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '1.25rem' }}>Product</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li><a href="#">Features</a></li>
                                <li><a href="#">Pricing</a></li>
                                <li><a href="#">Case Studies</a></li>
                                <li><a href="#">Reviews</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '1.25rem' }}>Company</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li><a href="#">About</a></li>
                                <li><a href="#">Careers</a></li>
                                <li><a href="#">Contact</a></li>
                                <li><a href="#">Partners</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '1.25rem' }}>Legal</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li><a href="#">Privacy</a></li>
                                <li><a href="#">Terms</a></li>
                                <li><a href="#">Security</a></li>
                            </ul>
                        </div>

                    </div>

                    <div style={{
                        borderTop: '1px solid #1E293B',
                        paddingTop: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.875rem'
                    }}>
                        <div>&copy; 2026 TheatreX Inc. All rights reserved.</div>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <Linkedin size={20} />
                            <Twitter size={20} />
                            <Facebook size={20} />
                            <Instagram size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
