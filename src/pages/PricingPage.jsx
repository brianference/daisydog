import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import stripeService from '../services/StripeService';
import parentAuthService from '../services/ParentAuthService';
import './PricingPage.css';

export default function PricingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [email, setEmail] = useState('');

  const handleSelectPlan = async (planType) => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setLoading(planType);

    try {
      const priceIds = stripeService.getPriceIds();
      const priceId = planType === 'monthly' ? priceIds.monthly : priceIds.annual;
      
      await stripeService.createCheckoutSession(priceId, email);
    } catch (error) {
      alert('Error starting checkout: ' + error.message);
      setLoading(null);
    }
  };

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Unlock the Parent Dashboard 🐾</h1>
        <p className="pricing-subtitle">
          Monitor your child's activity, review safety alerts, and guide their learning journey with Daisy
        </p>
      </div>

      <div className="email-input-section">
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="email-input"
          required
        />
      </div>

      <div className="pricing-cards">
        <div className="pricing-card">
          <div className="plan-badge">Monthly</div>
          <div className="price">
            <span className="amount">$6.99</span>
            <span className="period">/month</span>
          </div>
          <ul className="features-list">
            <li>✓ Parent Dashboard Access</li>
            <li>✓ Up to 3 Children</li>
            <li>✓ Activity Overview & Charts</li>
            <li>✓ Safety Event Logs & Alerts</li>
            <li>✓ Learning Progress Tracking</li>
            <li>✓ Weekly Email Reports</li>
            <li>✓ Content Filtering Controls</li>
            <li>✓ Time Limit Enforcement</li>
            <li>✓ Export Reports (CSV/PDF)</li>
            <li>✓ Prayer & Faith Formation Tracking</li>
            <li>✓ Curriculum-Aligned Content (K-8)</li>
            <li>✓ Priority Support</li>
          </ul>
          <button
            className="select-plan-button"
            onClick={() => handleSelectPlan('monthly')}
            disabled={loading}
          >
            {loading === 'monthly' ? 'Processing...' : 'Select Monthly Plan'}
          </button>
        </div>

        <div className="pricing-card featured">
          <div className="plan-badge best-value">Best Value - Save 30%</div>
          <div className="price">
            <span className="amount">$59</span>
            <span className="period">/year</span>
          </div>
          <div className="savings">Only $4.92/month</div>
          <ul className="features-list">
            <li>✓ Parent Dashboard Access</li>
            <li>✓ Up to 3 Children</li>
            <li>✓ Activity Overview & Charts</li>
            <li>✓ Safety Event Logs & Alerts</li>
            <li>✓ Learning Progress Tracking</li>
            <li>✓ Weekly Email Reports</li>
            <li>✓ Content Filtering Controls</li>
            <li>✓ Time Limit Enforcement</li>
            <li>✓ Export Reports (CSV/PDF)</li>
            <li>✓ Prayer & Faith Formation Tracking</li>
            <li>✓ Curriculum-Aligned Content (K-8)</li>
            <li>✓ Priority Support</li>
          </ul>
          <button
            className="select-plan-button featured"
            onClick={() => handleSelectPlan('annual')}
            disabled={loading}
          >
            {loading === 'annual' ? 'Processing...' : 'Select Annual Plan'}
          </button>
        </div>
      </div>

      <div className="pricing-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-item">
          <h3>What's included in the Parent Dashboard?</h3>
          <p>Monitor up to 3 children's activities, view safety alerts, track learning progress, set time limits and bedtime restrictions, receive weekly email reports, and export detailed reports.</p>
        </div>
        <div className="faq-item">
          <h3>Can I cancel anytime?</h3>
          <p>Yes! You can cancel your subscription at any time from your billing dashboard. No long-term commitments.</p>
        </div>
        <div className="faq-item">
          <h3>Is the free version still available?</h3>
          <p>Yes! Children can continue using DaisyDog for free without the parent dashboard. The paid plan only adds monitoring and control features for parents.</p>
        </div>
      </div>
    </div>
  );
}
