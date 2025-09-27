import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaHome, FaQuestionCircle, FaBook, FaPlay, FaEnvelope, FaBars, FaTimes } from 'react-icons/fa'
import './Header.css'

const Header = ({ 
  title, 
  subtitle, 
  customContent = null 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-top-row">
          <Link to="/" className="header-logo">
            <img src="/assets/images/emotions/excited.png" alt="Daisy" />
            <span>DaisyDog</span>
          </Link>
          
          {/* Mobile hamburger menu button */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Desktop navigation */}
          <div className="header-navigation desktop-nav">
            <Link to="/" className="nav-btn orange-btn">
              <FaHome /> Home
            </Link>
            <Link to="/about" className="nav-btn orange-btn">
              <FaQuestionCircle /> About
            </Link>
            <Link to="/chat" className="nav-btn orange-btn">
              <FaPlay /> Start Chatting
            </Link>
            <a 
              href="https://www.readkidz.com/share/ebook/1969460528838705153" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="nav-btn orange-btn"
            >
              <FaBook /> Read the Book
            </a>
            <Link to="/contact" className="nav-btn orange-btn">
              <FaEnvelope /> Contact
            </Link>
          </div>

          {/* Mobile dropdown navigation */}
          <div className={`mobile-navigation ${isMobileMenuOpen ? 'open' : ''}`}>
            <Link to="/" className="mobile-nav-btn" onClick={closeMobileMenu}>
              <FaHome /> Home
            </Link>
            <Link to="/about" className="mobile-nav-btn" onClick={closeMobileMenu}>
              <FaQuestionCircle /> About
            </Link>
            <Link to="/chat" className="mobile-nav-btn" onClick={closeMobileMenu}>
              <FaPlay /> Start Chatting
            </Link>
            <a 
              href="https://www.readkidz.com/share/ebook/1969460528838705153" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mobile-nav-btn"
              onClick={closeMobileMenu}
            >
              <FaBook /> Read the Book
            </a>
            <Link to="/contact" className="mobile-nav-btn" onClick={closeMobileMenu}>
              <FaEnvelope /> Contact
            </Link>
          </div>
        </div>
        
        {title && (
          <div className="header-title-section">
            <h1>{title}</h1>
            {subtitle && <p className="header-subtitle">{subtitle}</p>}
          </div>
        )}
        
        {customContent && (
          <div className="header-custom-content">
            {customContent}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
