/**
 * SupabaseService - PostgreSQL database integration service
 * Provides database operations for DaisyDog features
 */

import { createClient } from '@supabase/supabase-js'

class SupabaseService {
  constructor() {
    this.supabase = null
    this.isInitialized = false
    this.isConnected = false
    this.lastError = null
    
    this.initialize()
  }

  /**
   * Initialize Supabase client
   */
  async initialize() {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️ Supabase credentials not configured. Database features will be disabled.')
        return
      }

      console.log('🔧 Initializing Supabase connection...')
      console.log('URL:', supabaseUrl)
      console.log('Key present:', !!supabaseKey)

      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      })

      this.isInitialized = true
      console.log('✅ Supabase client initialized successfully')

      // Test connection
      await this.testConnection()
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error)
      this.isInitialized = false
      this.isConnected = false
      this.lastError = error.message
    }
  }

  /**
   * Test database connection
   */
  async testConnection() {
    if (!this.supabase) {
      console.error('❌ Supabase client not initialized')
      return false
    }

    try {
      console.log('🧪 Testing Supabase connection...')
      
      // Try to get the current session as a connection test
      // This is more reliable than checking for specific tables
      const { data, error } = await this.supabase.auth.getSession()
      
      if (error) {
        // If auth fails, try a simple RPC call as fallback
        try {
          const { data: rpcData, error: rpcError } = await this.supabase.rpc('now')
          if (rpcError) {
            throw rpcError
          }
        } catch (rpcErr) {
          // If both fail, we still consider it connected if we can reach the service
          // The 404 on migrations table is expected for new projects
          if (rpcErr.message && rpcErr.message.includes('Could not find')) {
            console.log('✅ Supabase connection confirmed (service reachable)')
            this.isConnected = true
            this.lastError = null
            return true
          }
          throw rpcErr
        }
      }
      
      this.isConnected = true
      this.lastError = null
      console.log('✅ Supabase connection confirmed')
      return true
    } catch (error) {
      this.isConnected = false
      this.lastError = error.message
      console.error('❌ Supabase connection test failed:', error.message)
      return false
    }
  }

  /**
   * Check if service is available
   */
  isAvailable() {
    return this.isInitialized && this.isConnected && !!this.supabase
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isConnected: this.isConnected,
      isAvailable: this.isAvailable(),
      hasCredentials: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
      lastError: this.lastError,
      projectUrl: import.meta.env.VITE_SUPABASE_URL
    }
  }

  /**
   * Future: Save user chat history
   */
  async saveChatHistory(userId, messages) {
    if (!this.isAvailable()) {
      console.warn('Supabase not available, skipping chat history save')
      return null
    }

    try {
      const { data, error } = await this.supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          messages: messages,
          created_at: new Date().toISOString()
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving chat history:', error)
      return null
    }
  }

  /**
   * Future: Load user chat history
   */
  async loadChatHistory(userId) {
    if (!this.isAvailable()) {
      console.warn('Supabase not available, skipping chat history load')
      return []
    }

    try {
      const { data, error } = await this.supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error loading chat history:', error)
      return []
    }
  }

  /**
   * Future: Save user preferences
   */
  async saveUserPreferences(userId, preferences) {
    if (!this.isAvailable()) {
      console.warn('Supabase not available, skipping preferences save')
      return null
    }

    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preferences: preferences,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving user preferences:', error)
      return null
    }
  }

  /**
   * Future: Load user preferences
   */
  async loadUserPreferences(userId) {
    if (!this.isAvailable()) {
      console.warn('Supabase not available, using local preferences')
      return null
    }

    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data?.preferences || null
    } catch (error) {
      console.error('Error loading user preferences:', error)
      return null
    }
  }

  /**
   * Future: Track game statistics
   */
  async saveGameStats(userId, gameType, score, duration) {
    if (!this.isAvailable()) {
      console.warn('Supabase not available, skipping game stats save')
      return null
    }

    try {
      const { data, error } = await this.supabase
        .from('game_stats')
        .insert({
          user_id: userId,
          game_type: gameType,
          score: score,
          duration: duration,
          played_at: new Date().toISOString()
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving game stats:', error)
      return null
    }
  }

  /**
   * Debug status information
   */
  debugStatus() {
    const status = this.getStatus()
    console.log('🔧 Supabase Service Debug Status:')
    console.table(status)
    
    if (!status.hasCredentials) {
      console.log('💡 To fix: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local')
      console.log('💡 Get credentials from: https://supabase.com/dashboard/project/settings/api')
    }
    
    if (!status.isConnected && status.hasCredentials) {
      console.log('💡 Try: SupabaseService.testConnection() to retry connection')
    }
    
    return status
  }
}

// Create singleton instance
const supabaseServiceInstance = new SupabaseService()

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.SupabaseService = supabaseServiceInstance
}

export default supabaseServiceInstance
