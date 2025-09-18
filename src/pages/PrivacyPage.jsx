import React from 'react'
import { Link } from 'react-router-dom'
import { FaHome, FaShieldAlt, FaUserShield, FaLock, FaEye, FaTrash } from 'react-icons/fa'
import './PrivacyPage.css'

const PrivacyPage = () => {
  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <div className="header-content">
          <Link to="/" className="home-btn">
            <FaHome /> Home
          </Link>
          <h1><FaShieldAlt /> Privacy Policy</h1>
          <p className="last-updated">Last Updated: September 17, 2025</p>
        </div>
      </header>

      <div className="privacy-content">
        <div className="privacy-container">
          
          <section className="privacy-section">
            <h2><FaUserShield /> Our Commitment to Child Safety</h2>
            <p>
              DaisyDog is designed specifically for children and takes privacy and safety very seriously. 
              We are committed to protecting your child's personal information and providing a safe, 
              educational environment for learning and play.
            </p>
            <div className="highlight-box">
              <strong>🛡️ We do NOT collect, store, or share any personal information from children.</strong>
            </div>
          </section>

          <section className="privacy-section">
            <h2><FaEye /> What Information We Collect</h2>
            <div className="info-grid">
              <div className="info-card safe">
                <h3>✅ What We DON'T Collect</h3>
                <ul>
                  <li>Names or personal identifiers</li>
                  <li>Email addresses</li>
                  <li>Phone numbers</li>
                  <li>Home addresses</li>
                  <li>School information</li>
                  <li>Photos or videos</li>
                  <li>Location data</li>
                  <li>Social media profiles</li>
                </ul>
              </div>
              <div className="info-card technical">
                <h3>📊 Technical Information (Anonymous)</h3>
                <ul>
                  <li>Browser type and version</li>
                  <li>Device type (mobile/desktop)</li>
                  <li>General location (country/state only)</li>
                  <li>Usage statistics (anonymous)</li>
                  <li>Error logs for app improvement</li>
                </ul>
                <p><small>This information cannot identify individual users.</small></p>
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <h2><FaLock /> How We Protect Your Privacy</h2>
            <div className="protection-features">
              <div className="feature">
                <h3>🔒 Local Storage Only</h3>
                <p>Conversations are stored locally on your device and never sent to our servers.</p>
              </div>
              <div className="feature">
                <h3>🤖 AI Safety Filters</h3>
                <p>Multiple layers of content filtering ensure age-appropriate interactions.</p>
              </div>
              <div className="feature">
                <h3>🚫 No Account Required</h3>
                <p>No registration, login, or personal information needed to use DaisyDog.</p>
              </div>
              <div className="feature">
                <h3>🔐 Secure Connections</h3>
                <p>All communications use encrypted HTTPS connections.</p>
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <h2>🍪 Cookies and Local Storage</h2>
            <p>
              DaisyDog uses minimal local storage to remember your conversation with Daisy and 
              game progress. This information stays on your device and is never shared.
            </p>
            <div className="cookie-info">
              <h3>What we store locally:</h3>
              <ul>
                <li>Chat conversation history</li>
                <li>Game progress and states</li>
                <li>Daisy's mood and hunger levels</li>
                <li>User preferences (like volume settings)</li>
              </ul>
              <p><strong>You can clear this data anytime by clearing your browser's local storage.</strong></p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>🔗 Third-Party Services</h2>
            <p>
              DaisyDog uses Google Gemini AI service to provide enhanced responses. This service:
            </p>
            <ul>
              <li>Process messages through secure, encrypted connections</li>
              <li>Do not store or retain conversation data</li>
              <li>Are bound by their own privacy policies for child protection</li>
              <li>Cannot identify individual users</li>
            </ul>
            <div className="service-links">
              <p><strong>Third-party privacy policies:</strong></p>
              <ul>
                <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
                <li><a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer">Gemini API Terms of Service</a></li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <h2>👨‍👩‍👧‍👦 For Parents and Guardians</h2>
            <div className="parent-info">
              <h3>🛡️ COPPA Compliance</h3>
              <p>
                DaisyDog is designed to comply with the Children's Online Privacy Protection Act (COPPA). 
                We do not knowingly collect personal information from children under 13.
              </p>
              
              <h3>📱 Parental Controls</h3>
              <ul>
                <li>Monitor your child's interactions with DaisyDog</li>
                <li>Clear conversation history anytime</li>
                <li>Use browser parental controls for additional safety</li>
                <li>Report any concerns immediately</li>
              </ul>

              <h3>🚨 Safety Features</h3>
              <ul>
                <li>Content filtering prevents inappropriate topics</li>
                <li>No external links or contact with other users</li>
                <li>Educational focus with positive reinforcement</li>
                <li>Age-appropriate language and responses</li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <h2><FaTrash /> Data Deletion</h2>
            <p>
              Since we don't collect personal data, there's no personal information to delete from our servers. 
              However, you can:
            </p>
            <ul>
              <li><strong>Clear local data:</strong> Use your browser's "Clear browsing data" feature</li>
              <li><strong>Reset conversations:</strong> Use the reset button in the chat interface</li>
              <li><strong>Contact us:</strong> If you have any concerns about data</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>📞 Contact Us</h2>
            <p>
              If you have questions about this privacy policy or DaisyDog's privacy practices:
            </p>
            <div className="contact-info">
              <p><strong>GitHub:</strong> <a href="https://github.com/brianference/daisydog" target="_blank" rel="noopener noreferrer">Report issues on GitHub</a></p>
              <p><strong>Response Time:</strong> We respond to privacy inquiries within 48 hours</p>
              <p><strong>For urgent safety concerns:</strong> Please report through GitHub issues</p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>🔄 Policy Updates</h2>
            <p>
              We may update this privacy policy occasionally to reflect changes in our practices or 
              legal requirements. Any changes will be posted on this page with an updated date.
            </p>
            <div className="update-notice">
              <p><strong>We will never:</strong></p>
              <ul>
                <li>Reduce privacy protections without notice</li>
                <li>Start collecting personal data without explicit consent</li>
                <li>Share data with third parties for marketing</li>
                <li>Use data in ways not described in this policy</li>
              </ul>
            </div>
          </section>

          <div className="privacy-footer">
            <p>
              <strong>Remember:</strong> DaisyDog is designed to be a safe, private, and educational 
              companion for children. Your privacy and safety are our top priorities.
            </p>
            <div className="footer-actions">
              <Link to="/" className="btn-primary">Return Home</Link>
              <Link to="/contact" className="btn-secondary">Contact Us</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default PrivacyPage
