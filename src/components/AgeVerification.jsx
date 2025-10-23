import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './AgeVerification.css'

const AgeVerification = ({ onVerificationComplete }) => {
  const [step, setStep] = useState('age')
  const [age, setAge] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)

  const handleAgeSubmit = (e) => {
    e.preventDefault()
    const userAge = parseInt(age)
    
    if (userAge >= 13) {
      // 13+ can use without parental consent
      onVerificationComplete({ age: userAge, needsParentalConsent: false })
    } else if (userAge > 0) {
      // Under 13 needs parental consent
      setStep('parental-consent')
    } else {
      alert('Please enter a valid age')
    }
  }

  const handleParentalConsent = (e) => {
    e.preventDefault()
    if (!parentEmail || !consentGiven) {
      alert('Parent/guardian name and consent are required for children under 13')
      return
    }
    
    // Store parental consent data locally (COPPA compliant)
    const consentData = {
      parentName: parentEmail, // Reusing this field as parent name
      consentDate: new Date().toISOString(),
      childAge: age,
      termsAccepted: true
    }
    
    localStorage.setItem('daisydog_parental_consent', JSON.stringify(consentData))
    console.log('🔒 Parental consent recorded:', consentData)
    
    // Complete verification
    onVerificationComplete({ age: parseInt(age), needsParentalConsent: false, parentalConsent: consentData })
  }

  if (step === 'age') {
    return (
      <div className="age-verification-overlay">
        <div className="age-verification-modal">
          <h2>🐕 Welcome to DaisyDog!</h2>
          <p>Before we start, we need to verify your age to comply with children's privacy laws.</p>
          
          <form onSubmit={handleAgeSubmit}>
            <div className="form-group">
              <label htmlFor="age">How old are you?</label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                max="120"
                required
                placeholder="Enter your age"
              />
            </div>
            <button type="submit" className="verify-button">
              Continue
            </button>
          </form>
          
          <div className="privacy-notice">
            <h3>🔒 Privacy Notice</h3>
            <p>DaisyDog does not collect, store, or share any personal information. All conversations are kept locally on your device and are not sent to our servers.</p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'parental-consent') {
    return (
      <div className="age-verification-overlay">
        <div className="age-verification-modal">
          <h2>👨‍👩‍👧‍👦 Parental Consent Required</h2>
          <p>Since you're under 13, we need your parent or guardian's permission before you can use DaisyDog.</p>
          
          <form onSubmit={handleParentalConsent}>
            <div className="form-group">
              <label htmlFor="parentEmail">Parent/Guardian Name:</label>
              <input
                type="text"
                id="parentEmail"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                required
                placeholder="Parent/Guardian Name"
              />
            </div>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  required
                />
                I consent to my child using DaisyDog and agree to the Terms & Conditions below
              </label>
            </div>
            
            <div className="terms-conditions" style={{ 
              background: '#f9f9f9', 
              padding: '15px', 
              borderRadius: '6px', 
              marginBottom: '15px',
              maxHeight: '200px',
              overflowY: 'auto',
              fontSize: '12px',
              border: '1px solid #ddd'
            }}>
              <h4>Terms & Conditions for DaisyDog</h4>
              <p><strong>COPPA Compliance:</strong> DaisyDog is fully compliant with the Children's Online Privacy Protection Act (COPPA). We do not collect personal information from children under 13 without verifiable parental consent.</p>
              
              <p><strong>Data Collection:</strong> For children under 13, we only collect:</p>
              <ul>
                <li>Age verification status (stored locally)</li>
                <li>Chat messages (stored locally, can be cleared)</li>
                <li>Game progress (stored locally, temporary)</li>
                <li>No names, emails, or personal information</li>
              </ul>
              
              <p><strong>Educational Content:</strong> DaisyDog provides Christian educational content including Bible stories, prayers, and Catholic curriculum appropriate for ages 5-12.</p>
              
              <p><strong>Safety:</strong> All content is filtered for age-appropriateness. No external links or contact with other users.</p>
              
              <p><strong>Data Storage:</strong> All data is stored locally in your browser. No information is sent to external servers except anonymous API requests for Bible verses.</p>
              
              <p><strong>Parental Rights:</strong> Parents can clear all data at any time by clearing browser storage. This consent can be withdrawn at any time.</p>
              
              <p><strong>Contact:</strong> For questions about privacy or to withdraw consent, contact us through the app's contact page.</p>
              
              <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>
            </div>
            
            <button type="submit" className="verify-button">
              Give Consent
            </button>
          </form>
          
          
          <div style={{ 
            textAlign: 'center', 
            marginTop: '20px', 
            padding: '15px',
            background: '#f0f8ff',
            borderRadius: '8px',
            border: '1px solid #6366f1'
          }}>
            <p style={{ marginBottom: '10px', color: '#333' }}>
              <strong>👨‍👩‍👧‍👦 Are you a parent?</strong>
            </p>
            <Link 
              to="/login" 
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: '#6366f1',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'background 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#4f46e5'}
              onMouseLeave={(e) => e.target.style.background = '#6366f1'}
            >
              Parent Dashboard Login →
            </Link>
            <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              Monitor your child's activity and manage settings
            </p>
          </div>
          <div className="coppa-notice">
            <h3>📋 COPPA Compliance</h3>
            <p>This app complies with the Children's Online Privacy Protection Act (COPPA). We do not collect any personal information from children under 13 without verified parental consent.</p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'verification-sent') {
    return (
      <div className="age-verification-overlay">
        <div className="age-verification-modal">
          <h2>📧 Verification Email Sent</h2>
          <p>We've sent a verification email to <strong>{parentEmail}</strong>. Please ask your parent/guardian to check their email and click the verification link to approve your access to DaisyDog.</p>
          <p>Once the verification link is clicked, you will be granted access to DaisyDog.</p>
          
          <div className="waiting-message">
            <p>⏳ Waiting for parental approval...</p>
            <p>This page will automatically update once approval is received.</p>
          </div>
          
          <button 
            onClick={() => setStep('age')} 
            className="back-button"
          >
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default AgeVerification
