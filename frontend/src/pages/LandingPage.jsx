import '../components/landing/landing-page.css';
import LandingNavbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import SmartScheduling from '../components/landing/SmartScheduling';
import Stats from '../components/landing/Stats';
import LiveStatus from '../components/landing/LiveStatus';
import Team from '../components/landing/Team';
import Contact from '../components/landing/Contact';
import Footer from '../components/landing/Footer';
import OxygenBubbles from '../components/landing/OxygenBubbles';
import ScrollIntro from '../components/landing/ScrollIntro';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <ScrollIntro />
            <OxygenBubbles />
            <LandingNavbar />
            <main style={{ position: 'relative', zIndex: 1 }}>
                <Hero />
                <Features />
                <LiveStatus />
                <SmartScheduling />
                <Stats />
                <Team />
                <Contact />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
