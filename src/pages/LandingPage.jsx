import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaPlay, FaInfoCircle, FaHeart, FaPaw } from 'react-icons/fa'
import './LandingPage.css'

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="hero-logo"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <img src="/assets/images/daisy-logo.png" alt="Daisy the Dog" />
              <motion.div 
                className="logo-glow"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Meet Daisy! 🐕
            </motion.h1>
            
            <motion.p 
              className="hero-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Your friendly AI companion who loves to chat, play, and learn together!
            </motion.p>
            
            <motion.div 
              className="hero-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Link to="/chat" className="btn btn-primary">
                <FaPlay /> Start Chatting
              </Link>
              <Link to="/about" className="btn btn-secondary">
                <FaInfoCircle /> Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Floating Elements */}
        <div className="floating-elements">
          <motion.div 
            className="floating-bone"
            animate={{ 
              y: [-10, 10, -10],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🦴
          </motion.div>
          <motion.div 
            className="floating-ball"
            animate={{ 
              y: [10, -10, 10],
              x: [-5, 5, -5]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🎾
          </motion.div>
          <motion.div 
            className="floating-heart"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            💕
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            What Makes Daisy Special? ✨
          </motion.h2>
          
          <div className="features-grid">
            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="feature-icon">💬</div>
              <h3>Smart Conversations</h3>
              <p>Daisy loves to chat about anything! Ask her questions, tell jokes, or just say hello!</p>
            </motion.div>
            
            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="feature-icon">🎮</div>
              <h3>Fun Games</h3>
              <p>Play fetch, hide and seek, and other exciting games with your new best friend!</p>
            </motion.div>
            
            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="feature-icon">🎭</div>
              <h3>Amazing Tricks</h3>
              <p>Watch Daisy perform incredible tricks like sit, roll over, and play dead!</p>
            </motion.div>
            
            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="feature-icon">🛡️</div>
              <h3>Safe & Secure</h3>
              <p>Designed with kids in mind - completely safe, educational, and parent-approved!</p>
            </motion.div>
            
            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="feature-icon">🎨</div>
              <h3>Creative Learning</h3>
              <p>Learn new things through play, stories, and interactive conversations!</p>
            </motion.div>
            
            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="feature-icon">💝</div>
              <h3>Always Happy</h3>
              <p>Daisy is always excited to see you and ready to brighten your day!</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2>Ready to Meet Daisy? 🐾</h2>
            <p>Start your adventure with the friendliest AI companion on the internet!</p>
            <Link to="/chat" className="btn btn-primary btn-large">
              <FaPaw /> Let's Play Together!
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <img src="/assets/images/daisy-logo.png" alt="Daisy" />
              <span>DaisyDog</span>
            </div>
            <div className="footer-links">
              <Link to="/about">About</Link>
              <Link to="/chat">Chat</Link>
              <a href="#privacy">Privacy</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer-text">
              <p>Made with <FaHeart className="heart" /> for kids everywhere</p>
              <p>&copy; 2024 DaisyDog. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
