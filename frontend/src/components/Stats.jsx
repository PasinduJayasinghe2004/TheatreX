import { CheckCircle2, Clock, Eye, TrendingUp, Infinity as InfIcon } from 'lucide-react'

export default function Stats() {
    return (
        <section style={{ padding: '0 0 8rem 0' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 0.8fr) 1.2fr', gap: '4rem', alignItems: 'center' }}>

                    {/* Text Content */}
                    <div>
                        <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>Why Choose TheatreX?</h2>
                        <p style={{ color: '#6B7280', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                            The future of theatre operations is here. Drive efficiency, reduce waste, and improve patient care with our comprehensive platform.
                        </p>

                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                "Reduce scheduling conflicts by 50%",
                                "Improved outcome tracking",
                                "Real-time visibility across all rooms",
                                "Optimize staff utilization",
                                "Better patient care coordination"
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#374151', fontSize: '1rem', fontWeight: '500' }}>
                                    <CheckCircle2 color="#2563EB" size={20} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1.5rem'
                    }}>
                        {[
                            { icon: <Clock size={32} />, value: "24/7", label: "System Uptime" },
                            { icon: <Eye size={32} />, value: "100%", label: "Data Visibility" },
                            { icon: <TrendingUp size={32} />, value: "50%", label: "Improved Efficiency" },
                            { icon: <InfIcon size={32} />, value: "100%", label: "Data Security" }
                        ].map((stat, i) => (
                            <div key={i} style={{
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                padding: '2.5rem 1.5rem',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                            }}>
                                <div style={{ marginBottom: '1rem', opacity: 0.9 }}>{stat.icon}</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: 1, marginBottom: '0.5rem' }}>{stat.value}</div>
                                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            <style>{`
        @media (max-width: 900px) {
          section .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </section>
    )
}
