/**
 * ParentAuthService - Frontend authentication service
 * Handles parent signup, login, JWT token management
 */

class ParentAuthService {
  constructor() {
    this.token = localStorage.getItem('parentToken')
    this.parent = null
    this.listeners = []
    
    if (this.token) {
      this.verifyToken()
    }
  }

  /**
   * Sign up new parent
   */
  async signup(email, password) {
    try {
      const response = await fetch('/.netlify/functions/parent-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      this.setToken(data.token)
      this.parent = data.parent
      this.notifyListeners()

      return data
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  /**
   * Login existing parent
   */
  async login(email, password) {
    try {
      const response = await fetch('/.netlify/functions/parent-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      this.setToken(data.token)
      this.parent = data.parent
      this.notifyListeners()

      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  /**
   * Logout parent
   */
  logout() {
    this.token = null
    this.parent = null
    localStorage.removeItem('parentToken')
    this.notifyListeners()
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    try {
      const response = await fetch('/.netlify/functions/parent-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-email', token }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      return data
    } catch (error) {
      console.error('Email verification error:', error)
      throw error
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    try {
      const response = await fetch('/.netlify/functions/parent-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request-reset', email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Reset request failed')
      }

      return data
    } catch (error) {
      console.error('Password reset request error:', error)
      throw error
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch('/.netlify/functions/parent-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password', token, password: newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed')
      }

      return data
    } catch (error) {
      console.error('Password reset error:', error)
      throw error
    }
  }

  /**
   * Verify current JWT token
   */
  async verifyToken() {
    if (!this.token) return false

    try {
      const response = await fetch('/.netlify/functions/parent-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-token', token: this.token }),
      })

      const data = await response.json()

      if (!response.ok || !data.valid) {
        this.logout()
        return false
      }

      this.parent = data.parent
      this.notifyListeners()
      return true
    } catch (error) {
      console.error('Token verification error:', error)
      this.logout()
      return false
    }
  }

  /**
   * Set token and persist
   */
  setToken(token) {
    this.token = token
    localStorage.setItem('parentToken', token)
  }

  /**
   * Get authorization header
   */
  getAuthHeader() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {}
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token && !!this.parent
  }

  /**
   * Check if user has active subscription
   */
  hasActiveSubscription() {
    return this.parent?.subscriptionStatus === 'active'
  }

  /**
   * Get current parent data
   */
  getParent() {
    return this.parent
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  /**
   * Notify all listeners of auth state change
   */
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.parent))
  }
}

// Create singleton instance
const parentAuthService = new ParentAuthService()

export default parentAuthService
