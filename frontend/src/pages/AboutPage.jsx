import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHome, FaHeart, FaBone, FaGamepad, FaShieldAlt } from 'react-icons/fa'
import './AboutPage.css'

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* Header */}
      <header className="about-header">
        <div className="container">
          <Link to="/" className="home-btn">
            <FaHome /> Back to Home
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About DaisyDog 🐕
          </motion.h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="about-content">
        <div className="container">
          {/* Meet Daisy Section */}
          <motion.section 
            className="meet-daisy"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="daisy-intro">
              <div className="daisy-image-container">
                <img 
                  src="/assets/images/daisy-logo.png" 
                  alt="Daisy the Cavalier King Charles Spaniel" 
                  className="daisy-portrait bounce"
                />
                <div className="sparkles">✨</div>
              </div>
              <div className="daisy-info">
                <h2>Meet Daisy! 🌟</h2>
                <div className="daisy-stats">
                  <div className="stat">
                    <strong>Name:</strong> Daisy
                  </div>
                  <div className="stat">
                    <strong>Breed:</strong> Cavalier King Charles Spaniel
                  </div>
                  <div className="stat">
                    <strong>Age:</strong> 4 years old
                  </div>
                  <div className="stat">
                    <strong>Personality:</strong> High energy, positive, food motivated, humorous, mischievous
                  </div>
                  <div className="stat">
                    <strong>Favorite Things:</strong> Treats, belly rubs, playing fetch, making kids laugh
                  </div>
                  <div className="stat">
                    <strong>Special Talent:</strong> Understanding exactly what kids want to hear
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* What Makes Daisy Special */}
          <motion.section 
            className="daisy-special"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>What Makes Daisy Special? 💕</h2>
            <div className="special-grid">
              <div className="special-card card">
                <div className="special-icon">
                  <FaHeart />
                </div>
                <h3>Dog's Perspective</h3>
                <p>Daisy sees the world through a dog's eyes! She gets excited about squirrels, loves belly rubs, and thinks every day is the best day ever!</p>
              </div>
              <div className="special-card card">
                <div className="special-icon">
                  <FaBone />
                </div>
                <h3>Always Hungry</h3>
                <p>Just like a real dog, Daisy gets hungry and will ask for treats! Feed her and watch her tail wag with joy.</p>
              </div>
              <div className="special-card card">
                <div className="special-icon">
                  <FaGamepad />
                </div>
                <h3>Loves to Play</h3>
                <p>Daisy knows lots of games and tricks! She can play fetch, hide and seek, and even tell you the funniest dog jokes.</p>
              </div>
              <div className="special-card card">
                <div className="special-icon">
                  <FaShieldAlt />
                </div>
                <h3>Kid-Safe Friend</h3>
                <p>Daisy is designed specifically for children with safety as the top priority. She's always appropriate and kind.</p>
              </div>
            </div>
          </motion.section>

          {/* How Daisy Works */}
          <motion.section 
            className="how-daisy-works"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>How Does Daisy Work? 🤖</h2>
            <div className="work-explanation">
              <div className="work-card card">
                <h3>Artificial Intelligence</h3>
                <p>Daisy uses advanced AI technology to understand what you're saying and respond like a real dog would. She learns from conversations to become an even better friend!</p>
              </div>
              <div className="work-card card">
                <h3>Dog Personality Engine</h3>
                <p>Every response is filtered through Daisy's unique personality. She's programmed to be enthusiastic, loving, and just a little bit mischievous - just like a real Cavalier King Charles Spaniel!</p>
              </div>
              <div className="work-card card">
                <h3>Safety First</h3>
                <p>All of Daisy's responses are carefully monitored and filtered to ensure they're appropriate for children. She'll never say anything inappropriate or unsafe.</p>
              </div>
            </div>
          </motion.section>

          {/* Fun Facts */}
          <motion.section 
            className="fun-facts"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Fun Facts About Daisy! 🎉</h2>
            <div className="facts-grid">
              <div className="fact-card">
                <div className="fact-emoji">🦴</div>
                <p>Daisy's favorite treat is bacon-flavored biscuits!</p>
              </div>
              <div className="fact-card">
                <div className="fact-emoji">🎾</div>
                <p>She can play fetch for hours and never gets tired!</p>
              </div>
              <div className="fact-card">
                <div className="fact-emoji">😴</div>
                <p>Daisy loves napping in sunny spots by the window.</p>
              </div>
              <div className="fact-card">
                <div className="fact-emoji">🐿️</div>
                <p>She gets VERY excited when she sees squirrels!</p>
              </div>
              <div className="fact-card">
                <div className="fact-emoji">🎭</div>
                <p>Daisy knows over 50 different dog jokes!</p>
              </div>
              <div className="fact-card">
                <div className="fact-emoji">💝</div>
                <p>Her tail wags 100 times per minute when she's happy!</p>
              </div>
            </div>
          </motion.section>

          {/* Safety Information */}
          <motion.section 
            className="safety-info"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Safety & Privacy 🛡️</h2>
            <div className="safety-content">
              <div className="safety-card card">
                <h3>Child-Safe Design</h3>
                <ul>
                  <li>All conversations are monitored for appropriate content</li>
                  <li>No external links or advertisements</li>
                  <li>Age-appropriate language and topics only</li>
                  <li>Positive, encouraging interactions</li>
                </ul>
              </div>
              <div className="safety-card card">
                <h3>Privacy Protection</h3>
                <ul>
                  <li>No personal information is required to chat</li>
                  <li>Conversations are not stored permanently</li>
                  <li>COPPA compliant design</li>
                  <li>No data sharing with third parties</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Call to Action */}
          <motion.section 
            className="cta-section"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="cta-content text-center">
              <h2>Ready to Be Friends with Daisy? 🐕💕</h2>
              <p>She's waiting to meet you and can't wait to play!</p>
              <div className="cta-buttons">
                <Link to="/chat" className="btn btn-primary btn-large">
                  Start Chatting! 🎉
                </Link>
                <Link to="/" className="btn btn-outline btn-large">
                  Back to Home
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="about-footer">
        <div className="container">
          <p>&copy; 2024 DaisyDog. Made with ❤️ for kids who love dogs!</p>
          <p>Daisy says: "Woof woof! Thanks for learning about me!" 🐾</p>
        </div>
      </footer>
    </div>
  )
}

export default AboutPage
