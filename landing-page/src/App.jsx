import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProblemSolution from './components/ProblemSolution'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import LiveStatus from './components/LiveStatus'
import SmartScheduling from './components/SmartScheduling'
import Stats from './components/Stats'
import Testimonials from './components/Testimonials'
import CTABanner from './components/CTABanner'
import Team from './components/Team'
import Contact from './components/Contact'
import Footer from './components/Footer'
import OxygenBubbles from './components/OxygenBubbles'
import ScrollIntro from './components/ScrollIntro'

function App() {
  return (
    <div className="app">
      <ScrollIntro />
      <OxygenBubbles />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <LiveStatus />
        <SmartScheduling />
        <Stats />
        <Testimonials />
        <CTABanner />
        <Team />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
