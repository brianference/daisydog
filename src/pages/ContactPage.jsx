import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaHome, FaEnvelope, FaPhone, FaExclamationTriangle, FaBug, FaQuestionCircle, FaHeart, FaPaperPlane, FaBook } from 'react-icons/fa'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import './ContactPage.css'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
    isParent: false
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Create form data for Netlify Forms
    const form = e.target
    const formData = new FormData(form)
    
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      })
      
      if (response.ok) {
        setIsSubmitted(true)
      } else {
        throw new Error('Form submission failed')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Sorry, there was an error sending your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="contact-page">
        <Header 
          title={<><FaEnvelope /> Thank You!</>}
          subtitle="Your message has been sent successfully"
        />
        <div className="success-message">
          <div className="success-content">
            <FaHeart className="success-icon" />
            <h2>Message Sent Successfully! 🎉</h2>
            <p>
              Thank you for contacting us! We've received your message and will get back to you soon.
            </p>
            <div className="success-actions">
              <Link to="/" className="btn-primary">Return Home</Link>
              <button onClick={() => {
                setIsSubmitted(false)
                setFormData({
                  name: '',
                  email: '',
                  subject: '',
                  category: 'general',
                  message: '',
                  isParent: false
                })
              }} className="btn-secondary">Send Another Message</button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="contact-page">
      <Header 
        title={<><FaEnvelope /> Contact Us</>}
        subtitle="We'd love to hear from you! Get in touch with questions, feedback, or concerns."
      />
      <div className="contact-content">
        <div className="contact-container">
          
          {/* Quick Contact Options */}
          <section className="quick-contact">
            <h2>How Can We Help?</h2>
            <div className="contact-grid">
              <div className="contact-card urgent">
                <FaExclamationTriangle className="card-icon" />
                <h3>Safety Concerns</h3>
                <p>Report inappropriate content or safety issues immediately</p>
                <button onClick={() => {
                  setFormData(prev => ({ ...prev, category: 'safety', subject: 'URGENT: Safety Concern' }))
                  document.getElementById('message').focus()
                }} className="contact-btn urgent">
                  Report Now
                </button>
              </div>
              <div className="contact-card support">
                <FaBug className="card-icon" />
                <h3>Technical Issues</h3>
                <p>App not working? Chat problems? We can help!</p>
                <button onClick={() => {
                  setFormData(prev => ({ ...prev, category: 'technical', subject: 'Technical Support Request' }))
                  document.getElementById('message').focus()
                }} className="contact-btn">
                  Get Support
                </button>
              </div>
              <div className="contact-card feedback">
                <FaHeart className="card-icon" />
                <h3>Feedback & Ideas</h3>
                <p>Share your thoughts on how we can improve DaisyDog</p>
                <button onClick={() => {
                  setFormData(prev => ({ ...prev, category: 'feedback', subject: 'Feedback and Suggestions' }))
                  document.getElementById('message').focus()
                }} className="contact-btn">
                  Share Feedback
                </button>
              </div>
              <div className="contact-card general">
                <FaQuestionCircle className="card-icon" />
                <h3>General Questions</h3>
                <p>Have questions about DaisyDog? We're here to help!</p>
                <button onClick={() => {
                  setFormData(prev => ({ ...prev, category: 'general', subject: 'General Question' }))
                  document.getElementById('message').focus()
                }} className="contact-btn">
                  Ask Question
                </button>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="contact-form-section">
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="general">General Question</option>
                  <option value="technical">Technical Support</option>
                  <option value="safety">Safety Concern</option>
                  <option value="feedback">Feedback/Suggestion</option>
                  <option value="privacy">Privacy Question</option>
                  <option value="partnership">Partnership/Business</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Brief description of your message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="Please provide details about your question, concern, or feedback..."
                ></textarea>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isParent"
                    checked={formData.isParent}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  I am a parent or guardian contacting on behalf of a child
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Sending...</>
                ) : (
                  <>
                    <FaPaperPlane /> Send Message
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Contact Information */}
          <section className="contact-info">
            <h2>Other Ways to Reach Us</h2>
            <div className="info-grid">
              <div className="info-item">
                <FaEnvelope className="info-icon" />
                <h3>GitHub Support</h3>
                <div className="github-info">
                  <p><strong>Issues & Support:</strong> <a href="https://github.com/brianference/daisydog/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a></p>
                  <p><strong>Repository:</strong> <a href="https://github.com/brianference/daisydog" target="_blank" rel="noopener noreferrer">DaisyDog GitHub</a></p>
                  <p>Report bugs, request features, or ask questions through our GitHub repository.</p>
                </div>
              </div>
              <div className="info-item">
                <FaPhone className="info-icon" />
                <h3>Response Times</h3>
                <ul>
                  <li><strong>Technical Support:</strong> Within 24 hours</li>
                  <li><strong>General Questions:</strong> Within 48 hours</li>
                  <li><strong>Feedback:</strong> Within 1 week</li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ Quick Links */}
          <section className="faq-links">
            <h2>Frequently Asked Questions</h2>
            <p>Before contacting us, you might find your answer in our FAQ:</p>
            <div className="faq-grid">
              <Link to="/faq#safety" className="faq-link">
                <FaExclamationTriangle /> Safety & Privacy
              </Link>
              <Link to="/faq#technical" className="faq-link">
                <FaBug /> Technical Issues
              </Link>
              <Link to="/faq#features" className="faq-link">
                <FaQuestionCircle /> How DaisyDog Works
              </Link>
              <Link to="/faq#parents" className="faq-link">
                <FaHeart /> For Parents
              </Link>
            </div>
          </section>

          {/* Safety Notice */}
          <section className="safety-notice">
            <div className="notice-content">
              <FaExclamationTriangle className="notice-icon" />
              <div className="notice-text">
                <h3>Important Safety Notice</h3>
                <p>
                  If you encounter any inappropriate content, safety concerns, or technical issues 
                  that could affect child safety, please use the <strong>"Safety Concerns"</strong> option above 
                  to contact us immediately.
                </p>
              </div>
            </div>
          </section>

          <div className="contact-footer">
            <p>
              Thank you for helping us make DaisyDog a safe and wonderful experience for children everywhere!
            </p>
            <Link to="/" className="btn-primary">Return Home</Link>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ContactPage
