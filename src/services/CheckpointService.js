/**
 * CheckpointService - Manages conversation persistence and state restoration
 * Implements encapsulation for localStorage operations
 */

import { STORAGE_KEYS, ERROR_MESSAGES } from '../constants/index.js'

class CheckpointService {
  constructor() {
    this.storageKey = STORAGE_KEYS.CHAT_STATE
    this.isStorageAvailable = this.checkStorageAvailability()
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} Whether localStorage is available
   */
  checkStorageAvailability() {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      console.warn('localStorage not available:', error)
      return false
    }
  }

  /**
   * Save chat state to localStorage
   * @param {Object} state - Complete chat state to save
   * @returns {boolean} Whether save was successful
   */
  saveState(state) {
    if (!this.isStorageAvailable) {
      console.warn('Storage not available, cannot save state')
      return false
    }

    try {
      const serializedState = {
        ...state,
        messages: state.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        })),
        savedAt: new Date().toISOString()
      }

      localStorage.setItem(this.storageKey, JSON.stringify(serializedState))
      return true
    } catch (error) {
      console.error(ERROR_MESSAGES.SAVE_FAILED, error)
      return false
    }
  }

  /**
   * Load chat state from localStorage
   * @returns {Object|null} Loaded state or null if not found/error
   */
  loadState() {
    if (!this.isStorageAvailable) {
      return null
    }

    try {
      const savedState = localStorage.getItem(this.storageKey)
      if (!savedState) {
        return null
      }

      const state = JSON.parse(savedState)
      
      // Restore Date objects
      return {
        ...state,
        messages: state.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })),
        savedAt: new Date(state.savedAt)
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.LOAD_FAILED, error)
      return null
    }
  }

  /**
   * Clear saved state
   * @returns {boolean} Whether clear was successful
   */
  clearState() {
    if (!this.isStorageAvailable) {
      return false
    }

    try {
      localStorage.removeItem(this.storageKey)
      return true
    } catch (error) {
      console.error('Failed to clear state:', error)
      return false
    }
  }

  /**
   * Get last save timestamp
   * @returns {Date|null} Last save time or null
   */
  getLastSaveTime() {
    const state = this.loadState()
    return state ? state.savedAt : null
  }

  /**
   * Check if saved state exists
   * @returns {boolean} Whether saved state exists
   */
  hasSavedState() {
    if (!this.isStorageAvailable) {
      return false
    }
    return localStorage.getItem(this.storageKey) !== null
  }

  /**
   * Get storage usage information
   * @returns {Object} Storage usage stats
   */
  getStorageInfo() {
    if (!this.isStorageAvailable) {
      return { available: false, used: 0, total: 0 }
    }

    try {
      const savedState = localStorage.getItem(this.storageKey)
      const used = savedState ? new Blob([savedState]).size : 0
      const total = 5 * 1024 * 1024 // 5MB typical localStorage limit

      return {
        available: true,
        used,
        total,
        percentage: (used / total) * 100
      }
    } catch (error) {
      return { available: false, used: 0, total: 0 }
    }
  }

  /**
   * Create a backup of current state
   * @param {string} backupName - Name for the backup
   * @returns {boolean} Whether backup was successful
   */
  createBackup(backupName) {
    const state = this.loadState()
    if (!state) {
      return false
    }

    try {
      const backupKey = `${this.storageKey}_backup_${backupName}`
      localStorage.setItem(backupKey, JSON.stringify(state))
      return true
    } catch (error) {
      console.error('Failed to create backup:', error)
      return false
    }
  }

  /**
   * List available backups
   * @returns {string[]} Array of backup names
   */
  listBackups() {
    if (!this.isStorageAvailable) {
      return []
    }

    const backups = []
    const prefix = `${this.storageKey}_backup_`

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        backups.push(key.replace(prefix, ''))
      }
    }

    return backups
  }

  /**
   * Restore from backup
   * @param {string} backupName - Name of backup to restore
   * @returns {boolean} Whether restore was successful
   */
  restoreFromBackup(backupName) {
    try {
      const backupKey = `${this.storageKey}_backup_${backupName}`
      const backupData = localStorage.getItem(backupKey)
      
      if (!backupData) {
        return false
      }

      localStorage.setItem(this.storageKey, backupData)
      return true
    } catch (error) {
      console.error('Failed to restore from backup:', error)
      return false
    }
  }
}

// Export singleton instance
export default new CheckpointService()
