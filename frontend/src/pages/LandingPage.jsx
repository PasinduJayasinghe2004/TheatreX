import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../components/landing-page.css'
import LandingNavbar from '../components/LandingNavbar'
import Hero from '../components/LandingHero'
import ProblemSolution from '../components/ProblemSolution'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import SmartScheduling from '../components/SmartScheduling'
import Stats from '../components/Stats'
import LiveStatus from '../components/LiveStatus'
import Team from '../components/Team'
import Contact from '../components/Contact'
import CTABanner from '../components/CTABanner'
import Footer from '../components/Footer'
import OxygenBubbles from '../components/OxygenBubbles'
import ScrollIntro from '../components/ScrollIntro'
import DemoRequestModal from '../components/DemoRequestModal'
import ChatBot from '../components/ChatBot'

function LandingPage() {
  const { isAuthenticated, loading } = useAuth()
  const [showDemoModal, setShowDemoModal] = useState(false)

  // Redirect to dashboard if already authenticated
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

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
      <ChatBot />
    </div>
  )
}

export default LandingPage
