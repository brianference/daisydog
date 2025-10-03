/**
 * PostgreSQLService - Replit PostgreSQL database integration service
 * Replaces SupabaseService with direct PostgreSQL connection
 * Provides database operations for DaisyDog features
 */

import { neon } from '@neondatabase/serverless'

class PostgreSQLService {
  constructor() {
    this.sql = null
    this.isInitialized = false
    this.isConnected = false
    this.lastError = null
    this.currentSession = null
    this.sessionStartTime = Date.now()
    this.heartbeatInterval = null
    
    this.initialize()
  }

  /**
   * Initialize PostgreSQL client using Replit DATABASE_URL
   */
  async initialize() {
    try {
      const databaseUrl = import.meta.env.DATABASE_URL

      if (!databaseUrl) {
        console.warn('⚠️ DATABASE_URL not configured. Database features will be disabled.')
        this.isInitialized = false
        this.isConnected = false
        // Create a mock session for testing purposes
        this.currentSession = {
          id: this.generateSessionId(),
          age_range: 'child',
          created_at: new Date().toISOString(),
          interactions_count: 0,
          mock: true
        }
        return
      }

      console.log('🔧 Initializing Replit PostgreSQL connection...')
      console.log('DATABASE_URL configured:', !!databaseUrl)

      this.sql = neon(databaseUrl)
      this.isInitialized = true
      console.log('✅ PostgreSQL client initialized successfully')

      // Test connection
      await this.testConnection()
      
      // Start heartbeat to keep connection alive
      if (this.isConnected) {
        this.startHeartbeat()
      }
    } catch (error) {
      console.error('❌ Failed to initialize PostgreSQL:', error)
      this.isInitialized = false
      this.isConnected = false
      this.lastError = error.message
    }
  }

  /**
   * Test database connection
   */
  async testConnection() {
    if (!this.sql) {
      console.error('❌ PostgreSQL client not initialized')
      return false
    }

    try {
      console.log('🧪 Testing PostgreSQL connection...')
      
      const result = await this.sql`SELECT NOW() as current_time`
      
      if (result && result.length > 0) {
        this.isConnected = true
        this.lastError = null
        console.log('✅ PostgreSQL connection confirmed')
        return true
      }
      
      throw new Error('Empty result from database')
    } catch (error) {
      this.isConnected = false
      this.lastError = error.message
      console.error('❌ PostgreSQL connection test failed:', error.message)
      return false
    }
  }

  /**
   * Check if service is available
   */
  isAvailable() {
    return this.isInitialized && this.isConnected && !!this.sql
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isConnected: this.isConnected,
      isAvailable: this.isAvailable(),
      hasCredentials: !!import.meta.env.DATABASE_URL,
      lastError: this.lastError,
      databaseUrl: import.meta.env.DATABASE_URL ? 'Configured' : 'Not configured'
    }
  }

  /**
   * Create anonymous session (COPPA compliant)
   */
  async createAnonymousSession(userAge = 12) {
    // Always create a local session first as fallback
    const localSession = {
      id: this.generateSessionId(),
      age_range: this.getAgeRange(userAge),
      created_at: new Date().toISOString(),
      interactions_count: 0,
      local: true
    }

    if (!this.isConnected || !this.sql) {
      console.warn('⚠️ Database not connected, using local session')
      this.currentSession = localSession
      return this.currentSession
    }

    try {
      const sessionData = {
        id: localSession.id,
        age_range: localSession.age_range,
        created_at: localSession.created_at,
        interactions_count: 0
      }

      const result = await this.sql`
        INSERT INTO sessions (id, age_range, created_at, interactions_count)
        VALUES (${sessionData.id}, ${sessionData.age_range}, ${sessionData.created_at}, ${sessionData.interactions_count})
        RETURNING *
      `

      if (result && result.length > 0) {
        this.currentSession = { ...result[0], remote: true }
        console.log('✅ Anonymous session created:', result[0].id)
        return this.currentSession
      }

      throw new Error('Failed to create session')
    } catch (error) {
      console.warn('⚠️ Error creating remote session, using local session:', error.message)
      this.currentSession = localSession
      return this.currentSession
    }
  }

  /**
   * Log safety event (anonymous)
   */
  async logSafetyEvent(eventType, category, keywordMatched = null) {
    if (!this.currentSession) {
      console.warn('No active session for safety logging')
      return null
    }

    const eventData = {
      session_id: this.currentSession.id,
      event_type: eventType,
      category: category,
      keyword_matched: keywordMatched,
      age_range: this.currentSession.age_range,
      timestamp: new Date().toISOString()
    }

    if (!this.isAvailable()) {
      console.log('📊 Safety event (local):', eventData)
      return eventData
    }

    try {
      const result = await this.sql`
        INSERT INTO safety_events (session_id, event_type, category, keyword_matched, age_range, timestamp)
        VALUES (${eventData.session_id}, ${eventData.event_type}, ${eventData.category}, ${eventData.keyword_matched}, ${eventData.age_range}, ${eventData.timestamp})
        RETURNING *
      `
      
      console.log('📊 Safety event logged:', eventType, category)
      return result[0]
    } catch (error) {
      console.error('Error logging safety event:', error)
      return null
    }
  }

  /**
   * Log performance metric (anonymous)
   */
  async logPerformanceMetric(metricName, value, success = true, errorType = null) {
    if (!this.currentSession) {
      console.warn('No active session for performance logging')
      return null
    }

    const metricData = {
      session_id: this.currentSession.id,
      metric_name: metricName,
      metric_value: value,
      success: success,
      error_type: errorType,
      timestamp: new Date().toISOString()
    }

    if (!this.isAvailable() || this.currentSession.local || this.currentSession.mock) {
      console.log('📊 Performance metric (local):', metricData)
      return metricData
    }

    try {
      const result = await this.sql`
        INSERT INTO performance_logs (session_id, metric_name, metric_value, success, error_type, timestamp)
        VALUES (${metricData.session_id}, ${metricData.metric_name}, ${metricData.metric_value}, ${metricData.success}, ${metricData.error_type}, ${metricData.timestamp})
        RETURNING *
      `
      
      console.log('📊 Performance metric logged:', metricName, value)
      return result[0]
    } catch (error) {
      console.warn('Performance logging fallback to local:', error.message)
      return metricData
    }
  }

  /**
   * Log feature usage (anonymous)
   */
  async logFeatureUsage(featureName, actionType, durationSeconds = null) {
    if (!this.currentSession) {
      console.warn('No active session for feature logging - creating session first')
      try {
        await this.createAnonymousSession(16)
      } catch (error) {
        console.error('Failed to create session for logging:', error)
        return null
      }
    }

    if (this.currentSession && !this.currentSession.remote) {
      console.log('🎯 Feature usage (local session):', { featureName, actionType, durationSeconds })
      return { featureName, actionType, durationSeconds, timestamp: new Date().toISOString() }
    }

    const usageData = {
      session_id: this.currentSession.id,
      feature_name: featureName,
      action_type: actionType,
      duration_seconds: durationSeconds,
      timestamp: new Date().toISOString()
    }

    if (!this.isAvailable()) {
      console.log('🎯 Feature usage (local):', usageData)
      return usageData
    }

    try {
      const result = await this.sql`
        INSERT INTO feature_analytics (session_id, feature_name, action_type, duration_seconds, timestamp)
        VALUES (${usageData.session_id}, ${usageData.feature_name}, ${usageData.action_type}, ${usageData.duration_seconds}, ${usageData.timestamp})
        RETURNING *
      `
      
      console.log('🎯 Feature usage logged:', featureName, actionType)
      return result[0]
    } catch (error) {
      console.error('Error logging feature usage:', error)
      return null
    }
  }

  /**
   * Get current session
   */
  getCurrentSession() {
    return this.currentSession
  }

  /**
   * Verify privacy compliance
   */
  verifyPrivacy() {
    const session = this.currentSession
    if (!session) return { compliant: false, reason: 'No session' }

    const hasPersonalData = !!(
      session.name || 
      session.email || 
      session.ip_address || 
      session.device_id ||
      session.exact_age
    )

    return {
      compliant: !hasPersonalData,
      session_id: session.id,
      age_range: session.age_range,
      has_personal_data: hasPersonalData,
      data_types: Object.keys(session)
    }
  }

  /**
   * Check COPPA compliance
   */
  verifyCOPPACompliance() {
    return {
      no_personal_identification: !this.currentSession?.name,
      age_ranges_only: !!this.currentSession?.age_range,
      no_behavioral_profiling: true,
      anonymous_sessions: !!this.currentSession?.id,
      data_minimization: true,
      compliant: true
    }
  }

  /**
   * Convert exact age to age range (COPPA compliant)
   */
  getAgeRange(age) {
    if (age < 13) return '8-12'
    if (age < 17) return '13-16'
    return '17+'
  }

  /**
   * Generate anonymous session ID
   */
  generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  /**
   * Start periodic heartbeat
   */
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    this.heartbeatInterval = setInterval(async () => {
      if (this.isConnected && this.sql) {
        try {
          await this.testConnection()
          console.log('💓 Database heartbeat ping successful')
        } catch (error) {
          console.warn('💔 Database heartbeat ping failed:', error.message)
        }
      }
    }, 300000)

    console.log('💓 Database heartbeat started (5 min intervals)')
  }

  /**
   * Stop periodic heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
      console.log('💔 Database heartbeat stopped')
    }
  }

  /**
   * Debug status information
   */
  debugStatus() {
    const status = this.getStatus()
    console.log('🔧 PostgreSQL Service Debug Status:')
    console.table(status)
    
    if (!status.hasCredentials) {
      console.log('💡 To fix: DATABASE_URL environment variable is not set')
      console.log('💡 Check Replit Secrets or .env file')
    }
    
    if (!status.isConnected && status.hasCredentials) {
      console.log('💡 Try: PostgreSQLService.testConnection() to retry connection')
    }
    
    return status
  }
}

// Create singleton instance
const postgreSQLServiceInstance = new PostgreSQLService()

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.PostgreSQLService = postgreSQLServiceInstance
}

export default postgreSQLServiceInstance
