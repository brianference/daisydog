/**
 * StripeService - Frontend Stripe integration
 * Handles checkout sessions and subscription management
 */

class StripeService {
  constructor() {
    this.publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
    
    if (!this.publicKey) {
      console.warn('⚠️ VITE_STRIPE_PUBLIC_KEY not configured')
    }
  }

  /**
   * Create checkout session and redirect to Stripe
   */
  async createCheckoutSession(priceId, email) {
    try {
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }

      return data
    } catch (error) {
      console.error('Checkout error:', error)
      throw error
    }
  }

  /**
   * Get Stripe Customer Portal URL
   */
  getCustomerPortalUrl() {
    // Stripe Customer Portal is configured in Stripe Dashboard
    // This redirects to Stripe-hosted billing management
    return 'https://billing.stripe.com/p/login/test_your_portal_id'
  }

  /**
   * Price IDs (set these in Stripe Dashboard)
   * These will be created when you set up products in Stripe
   */
  getPriceIds() {
    return {
      monthly: 'price_monthly_699', // Replace with actual price ID from Stripe
      annual: 'price_annual_5900',  // Replace with actual price ID from Stripe
    }
  }
}

// Create singleton instance
const stripeService = new StripeService()

export default stripeService
