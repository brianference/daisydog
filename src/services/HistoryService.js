/**
 * HistoryService - Manages American History educational content
 * Provides access to historical events and U.S. Presidents from Supabase
 */

import { createClient } from '@supabase/supabase-js'

class HistoryService {
  constructor() {
    this.supabase = null
    this.isInitialized = false
    this.cache = {
      events: null,
      presidents: null,
      lastFetch: {
        events: null,
        presidents: null
      }
    }
    this.CACHE_DURATION = 1000 * 60 * 30 // 30 minutes
    
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
        console.warn('⚠️ Supabase credentials not configured. History features will use fallback data.')
        this.isInitialized = false
        return
      }

      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: false,
          detectSessionInUrl: false
        }
      })

      this.isInitialized = true
      console.log('✅ HistoryService initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize HistoryService:', error)
      this.isInitialized = false
    }
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid(key) {
    if (!this.cache.lastFetch[key]) return false
    const now = Date.now()
    return (now - this.cache.lastFetch[key]) < this.CACHE_DURATION
  }

  /**
   * Get all historical events ordered by display_order and year
   */
  async getHistoricalEvents(category = null) {
    try {
      // Return cached data if valid
      if (this.isCacheValid('events') && this.cache.events) {
        const events = category
          ? this.cache.events.filter(e => e.category === category)
          : this.cache.events
        return events
      }

      if (!this.isInitialized || !this.supabase) {
        console.warn('⚠️ HistoryService not initialized, returning empty array')
        return []
      }

      let query = this.supabase
        .from('historical_events')
        .select('*')
        .order('display_order', { ascending: true })
        .order('year', { ascending: true })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error fetching historical events:', error)
        return []
      }

      // Update cache
      if (!category) {
        this.cache.events = data || []
        this.cache.lastFetch.events = Date.now()
      }

      return data || []
    } catch (error) {
      console.error('❌ Error in getHistoricalEvents:', error)
      return []
    }
  }

  /**
   * Get a specific historical event by ID
   */
  async getHistoricalEvent(eventId) {
    try {
      if (!this.isInitialized || !this.supabase) {
        console.warn('⚠️ HistoryService not initialized')
        return null
      }

      const { data, error } = await this.supabase
        .from('historical_events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) {
        console.error('❌ Error fetching historical event:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Error in getHistoricalEvent:', error)
      return null
    }
  }

  /**
   * Get all U.S. Presidents ordered by number
   */
  async getPresidents() {
    try {
      // Return cached data if valid
      if (this.isCacheValid('presidents') && this.cache.presidents) {
        return this.cache.presidents
      }

      if (!this.isInitialized || !this.supabase) {
        console.warn('⚠️ HistoryService not initialized, returning empty array')
        return []
      }

      const { data, error } = await this.supabase
        .from('presidents')
        .select('*')
        .order('number', { ascending: true })

      if (error) {
        console.error('❌ Error fetching presidents:', error)
        return []
      }

      // Update cache
      this.cache.presidents = data || []
      this.cache.lastFetch.presidents = Date.now()

      return data || []
    } catch (error) {
      console.error('❌ Error in getPresidents:', error)
      return []
    }
  }

  /**
   * Get a specific president by number
   */
  async getPresident(presidentNumber) {
    try {
      if (!this.isInitialized || !this.supabase) {
        console.warn('⚠️ HistoryService not initialized')
        return null
      }

      const { data, error } = await this.supabase
        .from('presidents')
        .select('*')
        .eq('number', presidentNumber)
        .single()

      if (error) {
        console.error('❌ Error fetching president:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Error in getPresident:', error)
      return null
    }
  }

  /**
   * Search presidents by name
   */
  async searchPresidents(searchTerm) {
    try {
      if (!this.isInitialized || !this.supabase) {
        console.warn('⚠️ HistoryService not initialized')
        return []
      }

      const { data, error } = await this.supabase
        .from('presidents')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .order('number', { ascending: true })

      if (error) {
        console.error('❌ Error searching presidents:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Error in searchPresidents:', error)
      return []
    }
  }

  /**
   * Get historical events by category
   */
  async getEventsByCategory(category) {
    return this.getHistoricalEvents(category)
  }

  /**
   * Get events for a specific age range
   */
  async getEventsForAge(age) {
    try {
      const allEvents = await this.getHistoricalEvents()
      return allEvents.filter(event => 
        age >= (event.age_appropriate_min || 8) && 
        age <= (event.age_appropriate_max || 18)
      )
    } catch (error) {
      console.error('❌ Error in getEventsForAge:', error)
      return []
    }
  }

  /**
   * Get current president (most recent term_end = NULL)
   */
  async getCurrentPresident() {
    try {
      if (!this.isInitialized || !this.supabase) {
        console.warn('⚠️ HistoryService not initialized')
        return null
      }

      const { data, error } = await this.supabase
        .from('presidents')
        .select('*')
        .is('term_end', null)
        .order('number', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('❌ Error fetching current president:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Error in getCurrentPresident:', error)
      return null
    }
  }

  /**
   * Clear cache (useful when data is updated)
   */
  clearCache() {
    this.cache.events = null
    this.cache.presidents = null
    this.cache.lastFetch.events = null
    this.cache.lastFetch.presidents = null
    console.log('🗑️ HistoryService cache cleared')
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      cacheStatus: {
        events: this.cache.events ? `${this.cache.events.length} events cached` : 'No cache',
        presidents: this.cache.presidents ? `${this.cache.presidents.length} presidents cached` : 'No cache'
      }
    }
  }
}

// Create singleton instance
const historyService = new HistoryService()

export default historyService
