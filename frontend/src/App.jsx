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

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
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
