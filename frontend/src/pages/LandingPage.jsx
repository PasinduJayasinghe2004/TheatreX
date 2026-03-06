
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import SmartScheduling from '../components/SmartScheduling';
import Stats from '../components/Stats';
import LiveStatus from '../components/LiveStatus';
import Team from '../components/Team';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const LandingPage = () => {
    return (
        <div className="landing-page bg-white">
            <Navbar />
            <main>
                <Hero />
                <Stats />
                <Features />
                <SmartScheduling />
                <LiveStatus />
                <Team />
                <Contact />
            </main>
            <Footer />

            {/* Global styles for landing page */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .container {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }
                
                .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    cursor: pointer;
                    font-size: 0.95rem;
                }
                
                .btn-primary {
                    background-color: #2563EB;
                    color: white;
                    border: none;
                }
                
                .btn-primary:hover {
                    background-color: #1D4ED8;
                }
                
                .btn-outline {
                    background-color: transparent;
                    color: #374151;
                    border: 1px solid #D1D5DB;
                }
                
                .btn-outline:hover {
                    background-color: #F9FAF7;
                    border-color: #9CA3AF;
                }
            `}} />
        </div>
    );
};

export default LandingPage;
