import { useNavigate } from 'react-router-dom';
import robotImg from '../assets/theatrex-404.png';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div
            id="not-found-page"
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F8F9FB',
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                padding: '2rem',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4rem',
                    maxWidth: '960px',
                    width: '100%',
                    flexWrap: 'wrap',
                }}
            >
                {/* Left Content */}
                <div
                    style={{
                        flex: '1 1 320px',
                        minWidth: '280px',
                        animation: 'notFoundSlideUp 0.7s ease-out',
                    }}
                >
                    <h1
                        style={{
                            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                            fontWeight: 800,
                            color: '#1A1A2E',
                            margin: 0,
                            lineHeight: 1.1,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Oops....
                    </h1>
                    <h2
                        style={{
                            fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                            fontWeight: 600,
                            color: '#2D2D3F',
                            margin: '0.25rem 0 1rem 0',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Page not found
                    </h2>
                    <p
                        style={{
                            fontSize: '0.95rem',
                            color: '#6B7280',
                            lineHeight: 1.6,
                            margin: '0 0 1.75rem 0',
                            maxWidth: '360px',
                        }}
                    >
                        This page doesn&apos;t exist or was removed!
                        <br />
                        We suggest you go back to home.
                    </p>
                    <button
                        id="back-to-home-btn"
                        onClick={() => navigate('/')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.75rem',
                            backgroundColor: '#2563EB',
                            color: '#FFFFFF',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1D4ED8';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.45)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563EB';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.35)';
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12.667 8H3.333M3.333 8L7.333 4M3.333 8L7.333 12"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        Back to home
                    </button>
                </div>

                {/* Right Content - Robot Illustration */}
                <div
                    style={{
                        flex: '1 1 360px',
                        minWidth: '280px',
                        maxWidth: '460px',
                        display: 'flex',
                        justifyContent: 'center',
                        animation: 'notFoundFloat 6s ease-in-out infinite',
                    }}
                >
                    <img
                        src={robotImg}
                        alt="404 Error - Robot illustration"
                        style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 10px 30px rgba(37, 99, 235, 0.15))',
                        }}
                    />
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes notFoundSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes notFoundFloat {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-15px);
                    }
                }

                @media (max-width: 768px) {
                    #not-found-page > div {
                        flex-direction: column-reverse !important;
                        text-align: center;
                        gap: 2rem !important;
                    }
                    #not-found-page p {
                        margin-left: auto;
                        margin-right: auto;
                    }
                }
            `}</style>
        </div>
    );
};

export default NotFound;
