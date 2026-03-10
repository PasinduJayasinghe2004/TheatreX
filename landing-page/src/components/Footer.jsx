import { Activity, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react'

export default function Footer() {
    return (
        <footer>
            {/* CTA Banner
            <div className="container" style={{ position: 'relative', zIndex: 10, marginBottom: '-4rem' }}>
                <div style={{
                    backgroundColor: '#3B82F6',
                    borderRadius: '1.5rem',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    color: 'white',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    backgroundImage: 'linear-gradient(to bottom right, #3B82F6, #2563EB)'
                }}>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '1rem' }}>
                        Ready to Optimize Your Theatre Operations?
                    </h2>
                    <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
                        Join leading healthcare providers who have transformed their surgical management with TheatreX. Get started today.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button style={{
                            backgroundColor: 'white',
                            color: '#1D4ED8',
                            padding: '0.75rem 2rem',
                            borderRadius: '999px',
                            fontWeight: '600',
                            border: 'none'
                        }}>
                            Schedule Demo
                        </button>
                        <button style={{
                            backgroundColor: 'transparent',
                            color: 'white',
                            border: '1px solid white',
                            padding: '0.75rem 2rem',
                            borderRadius: '999px',
                            fontWeight: '600'
                        }}>
                            Contact Sales
                        </button>
                    </div>
                </div>
            </div> */}

            {/* Main Footer */}
            <div style={{ backgroundColor: '#0A0A0A', color: '#9CA3AF', paddingTop: '6rem', paddingBottom: '4rem', position: 'relative', zIndex: 2 }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#3B82F6' }}>
                                <Activity color="#3B82F6" size={24} />
                                <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>TheatreX</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Transforming surgical operations with intelligence, efficiency, and care.
                            </p>
                        </div>

                        <div>
                            <h4 style={{ color: '#fff', fontWeight: '600', marginBottom: '1.25rem' }}>Product</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li><a href="#">Features</a></li>
                                <li><a href="#">Pricing</a></li>
                                <li><a href="#">Case Studies</a></li>
                                <li><a href="#">Reviews</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ color: '#fff', fontWeight: '600', marginBottom: '1.25rem' }}>Company</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li><a href="#">About</a></li>
                                <li><a href="#">Careers</a></li>
                                <li><a href="#">Contact</a></li>
                                <li><a href="#">Partners</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ color: '#fff', fontWeight: '600', marginBottom: '1.25rem' }}>Legal</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li><a href="#">Privacy</a></li>
                                <li><a href="#">Terms</a></li>
                                <li><a href="#">Security</a></li>
                            </ul>
                        </div>

                    </div>

                    <div style={{
                        borderTop: '1px solid #1F2937',
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
