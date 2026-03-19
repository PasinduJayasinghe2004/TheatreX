const team = [
    {
        name: 'Oneli Vilara',
        role: 'Leader Of TheatreX and FullStack Developer',
        description: 'Visionary leader with a passion for transforming healthcare operations through technology.',
        bio: 'Driving the vision and architecture behind TheatreX, ensuring every module works seamlessly together.',
        social: { linkedin: 'https://www.linkedin.com/in/oneliv?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app', email: 'oneli.20240199@iit.ac.lk' }
    },
    {
        name: 'Pasindu Jayasinghe',
        role: 'Full Stack developer',
        description: 'Backend wizard focused on building robust and scalable systems.',
        bio: 'Building robust backend services and responsive frontends with a focus on performance and scalability.',
        social: { linkedin: 'https://linkedin.com/in/pasindu-jayasinghe-376209353?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app', email: 'pasindujayasinghe@gmail.com' }
    },
    {
        name: 'Chandeepa Priyadarshana',
        role: 'Full Stack developer / UI UX Designer',
        description: 'Creative designer and developer who brings medical interfaces to life.',
        bio: 'Crafting intuitive user experiences and polished interfaces that make complex healthcare workflows simple.',
        social: { linkedin: 'https://www.linkedin.com/in/chandeepa-priyadarshana-323228193?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', email: 'chandeepa.20241753@iit.ac.lk' }
    },
    {
        name: 'Janani Karavita',
        role: 'FullStack Developer',
        description: 'Data specialist focused on real-time analytics and insights.',
        bio: 'Specializing in data-driven features, from analytics dashboards to real-time notification systems.',
        social: { linkedin: 'https://www.linkedin.com/in/janani-navindula-285953216?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', email: 'janani.20241833@iit.ac.lk' }
    },
    {
        name: 'Dinil Dilmith',
        role: 'FullStack Developer',
        description: 'Core logic developer with an eye for procedural efficiency.',
        bio: 'Implementing core scheduling logic and ensuring reliable data flow across the entire platform.',
        social: { linkedin: 'https://www.linkedin.com/in/dinil-dilmith-130864362/', email: 'dinil.20231618@iit.ac.lk' }
    },
    {
        name: 'Inthusha Ravindra',
        role: 'FullStack Developer',
        description: 'Quality-focused developer ensuring system reliability and performance.',
        bio: 'Focused on testing, quality assurance, and building resilient features that hospitals can depend on.',
        social: { linkedin: 'https://www.linkedin.com/in/inthusha-raveendran-bab6aa365/', email: 'inthusha.20241647@iit.ac.lk' }
    }
]

import ScrollReveal from './ScrollReveal'

const Team = () => {
    return (
        <section id="team" style={{ padding: '6rem 0' }}>
            <div className="container">
                <ScrollReveal animation="fade-up">
                    <h2 className="section-title">Meet Our Team</h2>
                    <p className="section-subtitle">
                        Our dedicated team of healthcare professionals, engineers, and innovators working together to revolutionize theatre management for hospitals worldwide.
                    </p>
                </ScrollReveal>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2.5rem',
                    marginTop: '4rem'
                }}>
                    {team.map((member, index) => (
                        <ScrollReveal key={index} animation="fade-up" delay={index * 120} duration={600}>
                            <div style={{
                                backgroundColor: '#fff',
                                borderRadius: '1rem',
                                padding: '2rem',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                border: '1px solid #E5E7EB',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)'
                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                                    e.currentTarget.querySelector('.team-bio').style.maxHeight = '80px'
                                    e.currentTarget.querySelector('.team-bio').style.opacity = '1'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                    e.currentTarget.querySelector('.team-bio').style.maxHeight = '0'
                                    e.currentTarget.querySelector('.team-bio').style.opacity = '0'
                                }}
                            >
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    color: '#111827',
                                    marginBottom: '0.25rem'
                                }}>
                                    {member.name}
                                </h3>
                                <div style={{
                                    color: '#2563EB',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    marginBottom: '1rem'
                                }}>
                                    {member.role}
                                </div>
                                <p style={{
                                    color: '#6B7280',
                                    lineHeight: '1.6',
                                    marginBottom: '1.5rem',
                                    fontSize: '0.95rem'
                                }}>
                                    {member.description}
                                </p>

                                {/* Bio revealed on hover */}
                                <div className="team-bio" style={{
                                    maxHeight: '0',
                                    opacity: 0,
                                    overflow: 'hidden',
                                    transition: 'max-height 0.4s ease, opacity 0.3s ease',
                                    marginBottom: '0.5rem'
                                }}>
                                    <p style={{
                                        color: '#6B7280',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.6',
                                        padding: '0.75rem',
                                        backgroundColor: '#F9FAFB',
                                        borderRadius: '0.5rem',
                                        borderLeft: '3px solid #2563EB'
                                    }}>
                                        {member.bio}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" style={{
                                        padding: '0.5rem',
                                        backgroundColor: '#F3F4F6',
                                        borderRadius: '0.375rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#4B5563',
                                        transition: 'background-color 0.2s'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                        </svg>
                                    </a>
                                    <a href={`mailto:${member.social.email}`} style={{
                                        padding: '0.5rem',
                                        backgroundColor: '#F3F4F6',
                                        borderRadius: '0.375rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#4B5563',
                                        transition: 'background-color 0.2s'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Team
