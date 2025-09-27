import React from 'react'
import { Link } from 'react-router-dom'
import { FaHeart } from 'react-icons/fa'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="app-footer">
      {/* Full-width links bar with logo */}
      <div className="footer-links">
        <div className="footer-logo">
          <Link to="/">
            <img src="/assets/images/emotions/excited.png" alt="Daisy" />
            <span>DaisyDog</span>
          </Link>
        </div>
        <Link to="/about">About</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/contact">Contact</Link>
        <a 
          href="https://www.readkidz.com/share/ebook/1969460528838705153" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Read the Book
        </a>
      </div>
      
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-text">
            <p>Made with <FaHeart className="heart" /> for kids everywhere</p>
            <p>&copy; 2025 DaisyDog. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
