/**
 * BibleService - API.Bible integration service
 * Provides NAB (New American Bible) verses with caching and fallback
 */

class BibleService {
  constructor() {
    // Try multiple possible environment variable names
    this.apiKey = import.meta.env.VITE_BIBLE_API_KEY || 
                  import.meta.env.VITE_API_BIBLE_KEY || 
                  import.meta.env.REACT_APP_BIBLE_API_KEY ||
                  import.meta.env.BIBLE_API_KEY;
    
    this.baseURL = 'https://api.scripture.api.bible/v1';
    this.nabId = null; // Search for Douay-Rheims or NAB
    this.confirmedNabId = null;
    this.cache = new Map();
    this.isInitialized = false;
    this.apiWorking = false;
    this.lastApiTest = null;
    this.requestCount = 0;
    this.dailyLimit = 5000;
    
    // Debug environment variables
    console.log('🔧 Bible API Environment Check:', {
      VITE_BIBLE_API_KEY: !!import.meta.env.VITE_BIBLE_API_KEY,
      VITE_API_BIBLE_KEY: !!import.meta.env.VITE_API_BIBLE_KEY,
      REACT_APP_BIBLE_API_KEY: !!import.meta.env.REACT_APP_BIBLE_API_KEY,
      BIBLE_API_KEY: !!import.meta.env.BIBLE_API_KEY,
      selectedKey: this.apiKey ? 'Found' : 'Not found',
      keyLength: this.apiKey?.length || 0
    });
    
    this.initialize();
  }

  /**
   * Initialize Bible API service and verify NAB availability
   */
  async initialize() {
    console.log('🔧 Initializing Bible API Service...');
    console.log('API Key present:', !!this.apiKey);
    
    if (!this.apiKey) {
      // Only show detailed instructions in development
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.href.includes('localhost')
      
      if (isLocalhost) {
        console.warn('⚠️ Bible API key not configured (optional for development)');
        console.log('📋 To enable Bible features:');
        console.log('1. Get free API key: https://scripture.api.bible/');
        console.log('2. Add to .env: VITE_BIBLE_API_KEY=your_key');
      } else {
        console.warn('⚠️ Bible API key not configured');
      }
      return;
    }

    // Validate API key format (should be a UUID-like string)
    if (this.apiKey.length < 20) {
      console.warn('⚠️ Bible API key appears to be invalid (too short)');
      console.log('Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
      return;
    }

    try {
      // Test API connectivity and find NAB ID
      await this.verifyNABAvailability();
      this.isInitialized = true;
      this.apiWorking = true;
      this.lastApiTest = Date.now();
      console.log('✅ Bible API Service initialized successfully');
      console.log('📖 NAB Bible ID confirmed:', this.confirmedNabId);
    } catch (error) {
      console.error('❌ Bible API initialization failed:', error.message);
      console.log('🔧 Troubleshooting:');
      console.log('- Check your API key is correct');
      console.log('- Verify internet connection');
      console.log('- Check API.Bible service status');
      this.isInitialized = false;
      this.apiWorking = false;
    }
  }

  /**
   * Verify NAB availability and get correct ID
   */
  async verifyNABAvailability() {
    try {
      const response = await fetch(`${this.baseURL}/bibles`, {
        headers: {
          'api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const bibles = data.data || [];
      
      // Search for Douay-Rheims or NAB
      let nabBible = bibles.find(bible => 
        bible.name.toLowerCase().includes('douay-rheims') ||
        bible.name.toLowerCase().includes('new american bible') ||
        bible.abbreviation?.toLowerCase().includes('nab')
      );

      if (nabBible) {
        this.confirmedNabId = nabBible.id;
        console.log('✅ NAB Bible found:', {
          id: nabBible.id,
          name: nabBible.name,
          abbreviation: nabBible.abbreviation
        });
      } else {
        console.warn('⚠️ NAB not found in API.Bible catalog');
        
        // Look for best Catholic/traditional alternatives in priority order
        const alternatives = [
          { name: 'Catholic', search: ['catholic'] },
          { name: 'RSV Catholic', search: ['rsv', 'revised standard'] },
          { name: 'NRSV Catholic', search: ['nrsv'] },
          { name: 'ESV', search: ['esv', 'english standard'] },
          { name: 'King James', search: ['king james', 'kjv', 'authorised'] }
        ];
        
        for (const alt of alternatives) {
          nabBible = bibles.find(b => {
            const name = b.name.toLowerCase();
            const abbrev = b.abbreviation?.toLowerCase() || '';
            return alt.search.some(term => 
              name.includes(term) || abbrev.includes(term)
            );
          });
          
          if (nabBible) {
            console.log(`🎯 Found ${alt.name} Bible:`, {
              id: nabBible.id,
              name: nabBible.name,
              abbreviation: nabBible.abbreviation
            });
            break;
          }
        }
        
        if (nabBible) {
          this.confirmedNabId = nabBible.id;
          console.log('📖 Using Catholic-friendly Bible (NAB not available):', {
            id: nabBible.id,
            name: nabBible.name,
            abbreviation: nabBible.abbreviation,
            note: 'Prioritizing Douay-Rheims or other Catholic translations'
          });
        } else {
          // Final fallback to first English Bible
          const fallback = bibles.find(b => b.language?.id === 'eng') || bibles[0];
          this.confirmedNabId = fallback?.id;
          console.log('📋 Using fallback Bible:', fallback?.name);
        }
      }

      return this.confirmedNabId;
    } catch (error) {
      console.error('💥 Bible verification failed:', error);
      throw error;
    }
  }

  /**
   * Check if Bible API is available and ready
   */
  isAvailable() {
    const hasKey = !!this.apiKey;
    const isWorking = this.apiWorking;
    const underLimit = this.requestCount < this.dailyLimit;
    
    // If we haven't tested the API in the last 10 minutes, consider it potentially unavailable
    const testAge = this.lastApiTest ? Date.now() - this.lastApiTest : Infinity;
    const testStale = testAge > 10 * 60 * 1000; // 10 minutes
    
    const available = hasKey && this.isInitialized && isWorking && underLimit && !testStale;
    
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log('🔧 Bible API Availability Check:', {
        hasKey,
        isInitialized: this.isInitialized,
        isWorking,
        underLimit,
        requestCount: this.requestCount,
        testAge: testAge < Infinity ? `${Math.round(testAge / 1000)}s ago` : 'never',
        testStale,
        available
      });
    }
    
    return available;
  }

  /**
   * Parse Bible reference into API format
   * @param {string} reference - e.g., "John 3:16", "1st commandment", "Exodus 20:3"
   * @returns {string} API format reference
   */
  parseReference(reference) {
    const ref = reference.toLowerCase().trim();
    
    // Handle commandments
    if (ref.includes('commandment')) {
      const match = ref.match(/(\d+)(?:st|nd|rd|th)?\s*commandment/);
      if (match) {
        const num = parseInt(match[1]);
        if (num >= 1 && num <= 10) {
          return `EXO.20.${num + 2}`; // Commandments start at verse 3
        }
      }
      return 'EXO.20.1-17'; // All commandments
    }
    
    // Handle standard references
    const bookMap = {
      'john': 'JHN',
      'genesis': 'GEN',
      'exodus': 'EXO',
      'matthew': 'MAT',
      'psalms': 'PSA',
      'psalm': 'PSA',
      'proverbs': 'PRO',
      'romans': 'ROM',
      'corinthians': 'CO1',
      '1 corinthians': 'CO1',
      '2 corinthians': 'CO2'
    };
    
    // Parse "John 3:16" format
    const match = ref.match(/^(\w+)\s*(\d+):(\d+)$/);
    if (match) {
      const [, book, chapter, verse] = match;
      const apiBook = bookMap[book] || book.toUpperCase().slice(0, 3);
      return `${apiBook}.${chapter}.${verse}`;
    }
    
    return reference; // Return as-is if can't parse
  }

  /**
   * Get a specific Bible verse
   * @param {string} reference - Bible reference
   * @returns {Promise<Object>} Verse data
   */
  async getVerse(reference) {
    if (!this.isAvailable()) {
      console.log('❌ Bible API not available, using fallback');
      return this.getFallbackVerse(reference);
    }

    const apiRef = this.parseReference(reference);
    const cacheKey = `verse_${this.confirmedNabId}_${apiRef}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('📋 Returning cached verse:', apiRef);
      return this.cache.get(cacheKey);
    }

    try {
      const startTime = performance.now();
      
      const response = await fetch(
        `${this.baseURL}/bibles/${this.confirmedNabId}/verses/${apiRef}`,
        {
          headers: {
            'api-key': this.apiKey
          }
        }
      );

      const responseTime = performance.now() - startTime;
      console.log(`⚡ Bible API response time: ${Math.round(responseTime)}ms`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const verse = data.data;
      
      if (verse) {
        // Cache the result
        this.cache.set(cacheKey, verse);
        this.requestCount++;
        this.apiWorking = true;
        this.lastApiTest = Date.now();
        
        console.log('✅ Bible verse retrieved:', verse.reference);
        return verse;
      } else {
        throw new Error('No verse data returned');
      }

    } catch (error) {
      console.error('💥 Bible API Error:', error);
      this.apiWorking = false;
      this.lastApiTest = Date.now();
      
      // Return fallback
      return this.getFallbackVerse(reference);
    }
  }

  /**
   * Search for verses by keyword
   * @param {string} query - Search query
   * @param {number} limit - Number of results
   * @returns {Promise<Array>} Search results
   */
  async searchVerses(query, limit = 5) {
    if (!this.isAvailable()) {
      console.log('❌ Bible API not available for search');
      return [];
    }

    const cacheKey = `search_${this.confirmedNabId}_${query}_${limit}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(
        `${this.baseURL}/bibles/${this.confirmedNabId}/search?query=${encodeURIComponent(query)}&limit=${limit}`,
        {
          headers: {
            'api-key': this.apiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      const results = data.data?.verses || [];
      
      this.cache.set(cacheKey, results);
      this.requestCount++;
      
      return results;

    } catch (error) {
      console.error('💥 Bible search error:', error);
      return [];
    }
  }

  /**
   * Get fallback verse from local storage (Ten Commandments, etc.)
   * @param {string} reference - Bible reference
   * @returns {Object} Fallback verse data
   */
  getFallbackVerse(reference) {
    const ref = reference.toLowerCase();
    
    // Handle commandments with local NAB storage
    if (ref.includes('commandment') || ref.includes('exo')) {
      // Use our existing Ten Commandments storage
      const match = ref.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (num >= 1 && num <= 10) {
          // This would integrate with our existing getCommandment function
          return {
            id: `EXO.20.${num + 2}`,
            reference: `Exodus 20:${num + 2}`,
            content: `[Local NAB] Commandment ${num}`,
            text: `[Fallback] The ${num}${num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th'} commandment from local storage.`
          };
        }
      }
    }
    
    // Default fallback
    return {
      id: reference,
      reference: reference,
      content: '[Local Fallback] Bible verse unavailable - API offline',
      text: 'Bible verse temporarily unavailable. Please try again later.'
    };
  }

  /**
   * Get verse for safety system integration
   * @param {string} topic - Safety topic
   * @returns {Promise<Object>} Relevant verse
   */
  async getSafetyVerse(topic) {
    const topicVerses = {
      'bullying': 'MAT.5.44', // Love your enemies
      'violence': 'MAT.26.52', // Those who live by sword
      'drugs': 'CO1.6.19-20', // Body is temple
      'suicide': 'JER.29.11', // Plans to prosper you
      'digital_safety': 'PRO.27.14', // Guard your heart
      'inappropriate_content': 'PHI.4.8', // Think on pure things
      'ten_commandments': 'EXO.20.1-17',
      'christian_values': 'GEN.1.27' // Male and female created
    };
    
    const reference = topicVerses[topic] || 'PSA.23.1'; // Default to Psalm 23
    return await this.getVerse(reference);
  }

  /**
   * Get API status for debugging
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      apiWorking: this.apiWorking,
      confirmedNabId: this.confirmedNabId,
      requestCount: this.requestCount,
      dailyLimit: this.dailyLimit,
      cacheSize: this.cache.size,
      lastApiTest: this.lastApiTest
    };
  }
}

// Create singleton instance
const bibleService = new BibleService();

export default bibleService;
export { BibleService };
