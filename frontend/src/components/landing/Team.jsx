const team = [
    {
        name: 'Oneli Vilara',
        role: 'Leader Of TheatreX and FullStack Developer',
        social: { linkedin: 'https://www.linkedin.com/in/oneliv?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app', email: 'oneli.20240199@iit.ac.lk' }
    },
    {
        name: 'Pasindu Jayasinghe',
        role: 'Full Stack developer',

        social: { linkedin: 'https://linkedin.com/in/pasindu-jayasinghe-376209353?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app', email: 'pasindujayasinghe@gmail.com' }
    },
    {
        name: 'Chandeepa Priyadarshana',
        role: 'Full Stack developer / UI UX Designer',

        social: { linkedin: 'https://www.linkedin.com/in/chandeepa-priyadarshana-323228193?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', email: 'chandeepa.20241753@iit.ac.lk' }
    },
    {
        name: 'Janani Karavita',
        role: 'FullStack Developer',

        social: { linkedin: 'https://www.linkedin.com/in/janani-navindula-285953216?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', email: 'janani.20241833@iit.ac.lk' }
    },
    {
        name: 'Dinil Dilmith',
        role: 'FullStack Developer',

        social: { linkedin: 'https://www.linkedin.com/in/dinil-dilmith-130864362/', email: 'dinil.20231618@iit.ac.lk' }
    },
    {
        name: 'Inthusha Ravindra',
        role: 'FullStack Developer',

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
                                backgroundColor: 'var(--bg-white)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '2rem',
                                boxShadow: 'var(--shadow-md)',
                                border: '1px solid #E5E7EB',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)'
                                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                                }}
                            >
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    color: 'var(--text-main)',
                                    marginBottom: '0.25rem'
                                }}>
                                    {member.name}
                                </h3>
                                <div style={{
                                    color: 'var(--primary)',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    marginBottom: '1rem'
                                }}>
                                    {member.role}
                                </div>
                                <p style={{
                                    color: 'var(--text-muted)',
                                    lineHeight: '1.6',
                                    marginBottom: '1.5rem',
                                    fontSize: '0.95rem'
                                }}>
                                    {member.description}
                                </p>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <a href={member.social.linkedin} style={{
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
