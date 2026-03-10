import { useState } from 'react';
import '../components/landing/landing-page.css';
import LandingNavbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import ProblemSolution from '../components/landing/ProblemSolution';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import SmartScheduling from '../components/landing/SmartScheduling';
import Stats from '../components/landing/Stats';
import LiveStatus from '../components/landing/LiveStatus';
import Team from '../components/landing/Team';
import Contact from '../components/landing/Contact';
import CTABanner from '../components/landing/CTABanner';
import Footer from '../components/landing/Footer';
import OxygenBubbles from '../components/landing/OxygenBubbles';
import ScrollIntro from '../components/landing/ScrollIntro';
import DemoRequestModal from '../components/landing/DemoRequestModal';

const LandingPage = () => {
    const [showDemoModal, setShowDemoModal] = useState(false);

    return (
        <div className="landing-page">
            <ScrollIntro />
            <OxygenBubbles />
            <LandingNavbar onRequestDemo={() => setShowDemoModal(true)} />
            <main style={{ position: 'relative', zIndex: 1 }}>
                <Hero />
                <ProblemSolution />
                <Features />
                <HowItWorks />
                <LiveStatus />
                <SmartScheduling />
                <Stats />
                <CTABanner onRequestDemo={() => setShowDemoModal(true)} />
                <Team />
                <Contact />
            </main>
            <Footer />

            <DemoRequestModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
        </div>
    );
};

export default LandingPage;
