import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHome, FaHeart, FaShieldAlt, FaUsers, FaGamepad, FaBook } from 'react-icons/fa'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import './AboutPage.css'

const AboutPage = () => {
  return (
    <div className="about-page">
      <Header 
        title={<><FaShieldAlt /> About DaisyDog</>}
      />

      {/* Main Content */}
      <main className="about-content">
        {/* Hero Section - Full Width */}
        <motion.section 
          className="about-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-content">
            <div className="hero-image">
              <img src="/assets/images/emotions/happy.png" alt="Daisy the Dog" />
            </div>
            <div className="hero-text">
              <h2>Meet Daisy! 🐕</h2>
              <p>
                Daisy is your friendly AI companion designed specifically for children. 
                She loves to chat, play games, tell jokes, and help kids learn in a safe, 
                fun environment. With her playful personality and endless enthusiasm, 
                Daisy is always ready to be your best friend!
              </p>
            </div>
          </div>
        </motion.section>

        <div className="container">

          {/* Features Section */}
          <motion.section 
            className="features-section"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2>What Makes Daisy Special?</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">
                  <FaHeart />
                </div>
                <h3>Kid-Friendly Design</h3>
                <p>
                  Every aspect of Daisy is designed with children in mind. From her 
                  cheerful personality to her age-appropriate responses, she's the 
                  perfect digital companion for young minds.
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <FaShieldAlt />
                </div>
                <h3>Safe & Secure</h3>
                <p>
                  Your child's safety is our top priority. Daisy includes advanced 
                  content filtering, privacy protection, and parental controls to 
                  ensure a completely safe experience.
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <FaGamepad />
                </div>
                <h3>Interactive Learning</h3>
                <p>
                  Through games, stories, and conversations, Daisy helps children 
                  develop communication skills, creativity, and confidence in a 
                  fun, engaging way.
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <FaUsers />
                </div>
                <h3>Always Available</h3>
                <p>
                  Whether your child needs a friend to talk to, wants to play a game, 
                  or just needs someone to listen, Daisy is always there with a 
                  wagging tail and a smile.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Safety Section */}
          <motion.section 
            className="safety-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2>Safety First 🛡️</h2>
            <div className="safety-content">
              <div className="safety-text">
                <h3>Our Commitment to Child Safety</h3>
                <ul>
                  <li>✅ <strong>Content Filtering:</strong> Advanced AI ensures all conversations are age-appropriate</li>
                  <li>✅ <strong>Privacy Protection:</strong> No personal information is collected or stored</li>
                  <li>✅ <strong>Parental Controls:</strong> Parents can monitor and control interactions</li>
                  <li>✅ <strong>Educational Focus:</strong> All content promotes learning and positive values</li>
                  <li>✅ <strong>No External Links:</strong> Daisy keeps conversations within the safe environment</li>
                  <li>✅ <strong>Regular Updates:</strong> Continuous improvements to safety and content quality</li>
                </ul>
              </div>
              <div className="safety-image">
                <div className="safety-badge">
                  <FaShieldAlt />
                  <span>Child Safe</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* How It Works */}
          <motion.section 
            className="how-it-works"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2>How to Play with Daisy</h2>
            <div className="steps-grid">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Start Chatting</h3>
                <p>Click "Start Chatting" to begin your conversation with Daisy. She'll greet you with enthusiasm!</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Ask & Play</h3>
                <p>Ask Daisy questions, request jokes, play games, or just have a friendly chat about your day.</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Feed & Care</h3>
                <p>Don't forget to feed Daisy when she gets hungry! She loves treats and will thank you with joy.</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h3>Have Fun!</h3>
                <p>Enjoy endless conversations, games, and learning experiences with your new best friend!</p>
              </div>
            </div>
          </motion.section>

          {/* Call to Action */}
          <motion.section 
            className="cta-section"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2>Ready to Meet Daisy?</h2>
            <p>Start your adventure with the friendliest AI companion!</p>
            <Link to="/chat" className="btn btn-primary btn-large">
              🐾 Start Playing Now!
            </Link>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default AboutPage
