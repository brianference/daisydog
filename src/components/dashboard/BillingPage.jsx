import { useEffect, useState } from 'react';
import parentAuthService from '../../services/ParentAuthService';
import './BillingPage.css';

export default function BillingPage() {
  const [parent, setParent] = useState(null);

  useEffect(() => {
    setParent(parentAuthService.getParent());
  }, []);

  const handleManageBilling = () => {
    window.open('https://billing.stripe.com/p/login/test_your_portal_id', '_blank');
  };

  return (
    <div className="billing-page">
      <div className="page-header">
        <h1>Billing & Subscription</h1>
      </div>

      <div className="billing-card">
        <div className="subscription-status">
          <h2>Current Plan</h2>
          <div className={`status-badge ${parent?.subscriptionStatus}`}>
            {parent?.subscriptionStatus === 'active' ? '✓ Active' : parent?.subscriptionStatus}
          </div>
        </div>

        {parent?.subscriptionTier && (
          <div className="plan-details">
            <p><strong>Plan:</strong> {parent.subscriptionTier === 'monthly' ? 'Monthly ($6.99/month)' : 'Annual ($59/year)'}</p>
            {parent.subscriptionTier === 'annual' && (
              <p className="savings">💰 You're saving 30% with the annual plan!</p>
            )}
          </div>
        )}

        <div className="billing-actions">
          <button onClick={handleManageBilling} className="manage-button">
            🔧 Manage Billing
          </button>
          <p className="help-text">
            Update payment method, view invoices, or cancel subscription
          </p>
        </div>
      </div>

      <div className="features-card">
        <h2>Your Plan Includes</h2>
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
      </div>

      <div className="faq-card">
        <h2>Billing FAQ</h2>
        <div className="faq-item">
          <h3>When will I be charged?</h3>
          <p>Your subscription renews automatically based on your plan (monthly or annual).</p>
        </div>
        <div className="faq-item">
          <h3>Can I change my plan?</h3>
          <p>Yes! Click "Manage Billing" to upgrade, downgrade, or cancel anytime.</p>
        </div>
        <div className="faq-item">
          <h3>What happens if I cancel?</h3>
          <p>You'll retain access until the end of your billing period. Your children can still use the free version of DaisyDog.</p>
        </div>
      </div>
    </div>
  );
}
