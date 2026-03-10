import { AnimatedStatClock, AnimatedStatEye, AnimatedStatTrendingUp, AnimatedStatInfinity, AnimatedCheckCircle, CountUp } from './AnimatedIcons'
import ScrollReveal from './ScrollReveal'

export default function Stats() {
    return (
        <section style={{ padding: '0 0 8rem 0' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 0.8fr) 1.2fr', gap: '4rem', alignItems: 'center' }}>

                    {/* Text Content */}
                    <ScrollReveal animation="fade-right">
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
                                        <AnimatedCheckCircle />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScrollReveal>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1.5rem'
                    }}>
                        {[
                            { icon: <AnimatedStatClock />, value: <><CountUp end={24} duration={1500} />/7</>, label: "System Uptime" },
                            { icon: <AnimatedStatEye />, value: <><CountUp end={100} duration={2000} />%</>, label: "Data Visibility" },
                            { icon: <AnimatedStatTrendingUp />, value: <><CountUp end={50} duration={1800} />%</>, label: "Improved Efficiency" },
                            { icon: <AnimatedStatInfinity />, value: <><CountUp end={100} duration={2000} />%</>, label: "Data Security" }
                        ].map((stat, i) => (
                            <ScrollReveal key={i} animation="zoom-in" delay={i * 150} duration={600}>
                                <div style={{
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
                            </ScrollReveal>
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
