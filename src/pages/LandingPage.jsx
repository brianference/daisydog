import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaPlay, FaInfoCircle, FaHeart, FaPaw, FaBook, FaQuestionCircle } from 'react-icons/fa'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import SocialShare from '../components/SocialShare.jsx'
import './LandingPage.css'

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-wrapper">
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
                <img src="/assets/images/emotions/happy.png" alt="Daisy the Dog" />
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
                className="hero-title orange-text no-background"
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
                <Link to="/faq" className="btn btn-secondary">
                  <FaQuestionCircle /> FAQ
                </Link>
                <a href="https://www.readkidz.com/share/ebook/1969460528838705153" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  <FaBook /> Read the Book
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              className="hero-social-wrapper"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
            >
              <SocialShare />
            </motion.div>
          </div>
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

      {/* Book Feature Section */}
      <section className="book-feature">
        <div className="container">
          <motion.div 
            className="book-feature-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="book-feature-content">
              <motion.div
                className="book-feature-badge"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.9, 1, 0.9]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🎧 Daisy Reads You the Story!
              </motion.div>
              
              <h2 className="book-feature-title">📚 Daisy's Story - Now Available!</h2>
              
              <div className="book-feature-blurb">
                <p className="book-tagline"><strong>A heartwarming tale about finding where you belong, perfect for young readers who love dogs, family stories, and the magic of being chosen just as you are.</strong></p>
                
                <p>While her brothers and sisters jumped and barked "PICK ME! PICK ME!" whenever visitors came, little Daisy sat quietly in the corner, wondering if anyone would ever choose her. She wasn't the loudest or the pushiest puppy—she was gentle, patient, and just a little bit shy.</p>
                
                <p>Then one magical Saturday, seven-year-old Victoria walked into Daisy's life. With her kind blue eyes and patient heart, Victoria saw something special in the quiet brown and white puppy sitting in the corner. And in that perfect moment, Daisy got the two most wonderful things a puppy could ask for: a forever family and a beautiful name!</p>
                
                <p>From her first car ride home to mastering the art of treat training (SO many treats!), Daisy discovers that being chosen wasn't about being the loudest—it was about being herself. Join Daisy as she learns to sit, stay, shake a paw, and even attempt the ULTIMATE CHALLENGE: balancing a treat on her head!</p>
              </div>
              
              <motion.a
                href="https://www.readkidz.com/share/ebook/1969460528838705153"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-book"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaBook /> Read Daisy's Story
              </motion.a>
            </div>
            
            <motion.div 
              className="book-feature-image"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <a 
                href="https://www.readkidz.com/share/ebook/1969460528838705153"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img 
                  src="/assets/images/daisyreadbook.png" 
                  alt="Daisy's Story Book Cover" 
                />
              </a>
              <motion.div 
                className="book-glow"
                animate={{ 
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
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
              <div className="feature-icon">✝️</div>
              <h3>Christian Values & Safety</h3>
              <p>Built with Christian values in mind - promoting kindness, honesty, and biblical teachings in a safe environment!</p>
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
      <Footer />
    </div>
  )
}

export default LandingPage
