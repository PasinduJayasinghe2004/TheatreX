import { AnimatedClock, AnimatedCalendar, AnimatedUsers, AnimatedBarChart, AnimatedActivity, AnimatedClipboard } from './AnimatedIcons'
import ScrollReveal from './ScrollReveal'

const features = [
    {
        icon: <AnimatedClock />,
        title: "Real-Time Theatre Status",
        desc: "Get live updates on theatre occupancy, cleaning status, and operational bottlenecks."
    },
    {
        icon: <AnimatedCalendar />,
        title: "Smart Scheduling",
        desc: "Intelligent calendar management that suggests optimal slot assignments and minimizes downtime."
    },
    {
        icon: <AnimatedUsers />,
        title: "Staff Management",
        desc: "Live surgeon availability, shift tracking, and assignment tools to ensure optimal coverage."
    },
    {
        icon: <AnimatedBarChart />,
        title: "Analytics & Insights",
        desc: "Comprehensive dashboards tracking utilization, procedure times, and operational efficiency metrics."
    },
    {
        icon: <AnimatedActivity />,
        title: "Upcoming Surgeries",
        desc: "Track scheduled procedures with detailed patient info, required equipment, and team readiness."
    },
    {
        icon: <AnimatedClipboard />,
        title: "Status Tracking",
        desc: "Track cleaning stages, sterilization status, and room readiness at a glance."
    }
]

export default function Features() {
    return (
        <section id="features" style={{ padding: '6rem 0' }}>
            <div className="container">
                <ScrollReveal animation="fade-up">
                    <h2 className="section-title">Powerful Features for Modern Healthcare</h2>
                    <p className="section-subtitle">
                        Everything you need to manage theatre operations efficiently and effectively.
                    </p>
                </ScrollReveal>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: '2rem'
                }}>
                    {features.map((feature, idx) => (
                        <ScrollReveal key={idx} animation="fade-up" delay={idx * 120} duration={600}>
                            <div style={{
                                backgroundColor: '#fff',
                                padding: '2rem',
                                borderRadius: '1rem',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                                cursor: 'default'
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(37, 99, 235, 0.1)'; e.currentTarget.style.borderColor = '#BFDBFE'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.06)'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
                            >
                                <div style={{
                                    width: '3rem',
                                    height: '3rem',
                                    backgroundColor: '#EFF6FF',
                                    borderRadius: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.5rem'
                                }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
                                    {feature.title}
                                </h3>
                                <p style={{ color: '#6B7280', lineHeight: '1.6' }}>
                                    {feature.desc}
                                </p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
