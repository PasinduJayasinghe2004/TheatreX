import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import LiveStatus from './components/LiveStatus'
import SmartScheduling from './components/SmartScheduling'
import Stats from './components/Stats'
import Team from './components/Team'
import Contact from './components/Contact'
import Footer from './components/Footer'
import OxygenBubbles from './components/OxygenBubbles'

function App() {
  return (
    <div className="app">
      <OxygenBubbles />
      <Navbar />
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
  )
}

export default App
