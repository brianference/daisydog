/**
 * GeminiService - chat AI client.
 *
 * The filename and public API are kept so existing callers keep working, but
 * the model now runs server-side: this service POSTs to the Cloudflare Pages
 * Function at /api/chat (Workers AI). No API key exists in the browser bundle.
 */

const CHAT_ENDPOINT = '/api/chat'
const REQUEST_TIMEOUT_MS = 15000
const MAX_HISTORY_ITEMS = 10
const DEFAULT_AGE = 12
const MIN_AGE = 3
const MAX_AGE = 120
const RETRY_COOLDOWN_MS = 60 * 1000
const FALLBACK_MESSAGE = "Woof! I'm using my basic responses right now! 🐕"

class GeminiService {
  constructor() {
    this.version = '6.4.0'
    this.isInitialized = true
    this.apiWorking = true
    this.lastApiTest = null
    this.lastError = null
    this.retryCount = 0
    this.userAge = DEFAULT_AGE
    this.history = []
  }

  /**
   * Remember the child's age for prompt tailoring.
   * @param {number|string} age - Age in years; ignored if outside 3-120.
   */
  setAge(age) {
    const parsed = Number(age)
    if (Number.isFinite(parsed) && parsed >= MIN_AGE && parsed <= MAX_AGE) {
      this.userAge = parsed
    }
  }

  /**
   * No-op kept for API compatibility; there is nothing to initialise client-side.
   * @returns {Promise<void>}
   */
  async initialize() {
    this.isInitialized = true
  }

  /**
   * Whether AI replies should be attempted. After a failure the service
   * reports unavailable for a short cooldown so callers use local replies.
   * @returns {boolean}
   */
  isAvailable() {
    if (this.apiWorking) return true
    return Date.now() - (this.lastApiTest || 0) > RETRY_COOLDOWN_MS
  }

  /**
   * POST to /api/chat with a timeout.
   * @param {string} message - The child's message.
   * @returns {Promise<string>} Reply text.
   * @throws {Error} On network error, timeout, non-2xx or empty reply.
   */
  async callServer(message) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.slice(0, 500),
          history: this.history.slice(-MAX_HISTORY_ITEMS),
          age: this.userAge
        }),
        signal: controller.signal
      })
      if (!response.ok) {
        throw new Error(`chat endpoint returned ${response.status}`)
      }
      const data = await response.json()
      if (!data || typeof data.text !== 'string' || !data.text.trim()) {
        throw new Error('empty chat response')
      }
      return data.text.trim()
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * Generate an AI reply. Falls back to a canned reply on any failure.
   * @param {string} userMessage - User's message.
   * @param {Object} [context] - Chat context (unused server-side; kept for compatibility).
   * @returns {Promise<string>} Reply text.
   */
  async generateResponse(userMessage, context = {}) {
    const age = context && (context.age ?? context.userAge)
    if (age !== undefined) this.setAge(age)

    if (!this.isAvailable()) {
      return FALLBACK_MESSAGE
    }

    try {
      const text = await this.callServer(userMessage)
      this.apiWorking = true
      this.lastApiTest = Date.now()
      this.lastError = null
      this.retryCount = 0
      this.history.push({ role: 'user', content: userMessage.slice(0, 500) })
      this.history.push({ role: 'assistant', content: text.slice(0, 1000) })
      this.history = this.history.slice(-MAX_HISTORY_ITEMS)
      return text
    } catch (error) {
      this.apiWorking = false
      this.lastApiTest = Date.now()
      this.lastError = error.name === 'AbortError' ? 'timeout' : error.message
      this.retryCount += 1
      return FALLBACK_MESSAGE
    }
  }

  /**
   * Probe the endpoint with a harmless message.
   * @returns {Promise<boolean>} True if the server answered.
   */
  async testApiConnectivity() {
    try {
      await this.callServer('Say woof!')
      this.apiWorking = true
      this.lastError = null
    } catch (error) {
      this.apiWorking = false
      this.lastError = error.name === 'AbortError' ? 'timeout' : error.message
    }
    this.lastApiTest = Date.now()
    return this.apiWorking
  }

  /**
   * Ignore the cooldown and re-test now.
   * @returns {Promise<boolean>}
   */
  async forceRetry() {
    this.lastApiTest = null
    this.retryCount = 0
    return this.testApiConnectivity()
  }

  /**
   * Status snapshot for debug panels.
   * @returns {Object}
   */
  getStatus() {
    return {
      endpoint: CHAT_ENDPOINT,
      isAvailable: this.isAvailable(),
      apiWorking: this.apiWorking,
      lastTested: this.lastApiTest,
      lastError: this.lastError,
      isInitialized: this.isInitialized,
      retryCount: this.retryCount
    }
  }

  /**
   * Status snapshot, also printed to the console for debugging.
   * @returns {Object}
   */
  debugStatus() {
    const status = this.getStatus()
    console.table(status)
    return status
  }
}

const geminiService = new GeminiService()

if (typeof window !== 'undefined') {
  window.GeminiService = geminiService
  window.geminiStatus = () => geminiService.getStatus()
  window.testGemini = () => geminiService.testApiConnectivity()
}

export default geminiService
