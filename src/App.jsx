import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import ChatPage from './pages/ChatPage'
import FAQPage from './pages/FAQPage'
import PrivacyPage from './pages/PrivacyPage'
import ContactPage from './pages/ContactPage'
import PricingPage from './pages/PricingPage'
import ParentLogin from './pages/ParentLogin'
import ParentSignup from './pages/ParentSignup'
import ParentDashboard from './pages/ParentDashboard'
import ChildLinkPage from './pages/ChildLinkPage'
import './utils/videoFileChecker.js' // Import video file checker
import './App.css'

// Scroll to top component for route changes
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<ParentLogin />} />
        <Route path="/signup" element={<ParentSignup />} />
        <Route path="/dashboard/*" element={<ParentDashboard />} />
        <Route path="/link-child" element={<ChildLinkPage />} />
      </Routes>
    </>
  )
}

export default App
