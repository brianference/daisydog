/**
 * DashboardApiService - Frontend API service for parent dashboard
 * Handles children management, activity data, settings
 */

import parentAuthService from './ParentAuthService'

class DashboardApiService {
  /**
   * Make authenticated API request
   */
  async apiRequest(action, body = {}) {
    try {
      const response = await fetch(`/.netlify/functions/dashboard-api?action=${action}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...parentAuthService.getAuthHeader(),
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'API request failed')
      }

      return data
    } catch (error) {
      console.error('Dashboard API error:', error)
      throw error
    }
  }

  /**
   * Get all children for current parent
   */
  async getChildren() {
    return this.apiRequest('get-children')
  }

  /**
   * Add new child
   */
  async addChild(nickname, ageRange, avatarColor = '#4A90E2') {
    return this.apiRequest('add-child', { nickname, ageRange, avatarColor })
  }

  /**
   * Update child info
   */
  async updateChild(childId, updates) {
    return this.apiRequest('update-child', { childId, ...updates })
  }

  /**
   * Delete child
   */
  async deleteChild(childId) {
    return this.apiRequest('delete-child', { childId })
  }

  /**
   * Generate link code for child
   */
  async generateLinkCode(childId) {
    return this.apiRequest('generate-link-code', { childId })
  }

  /**
   * Get activity data
   */
  async getActivity(childId = null, startDate = null, endDate = null) {
    return this.apiRequest('get-activity', { childId, startDate, endDate })
  }

  /**
   * Get safety events
   */
  async getSafetyEvents(childId = null, startDate = null, endDate = null) {
    return this.apiRequest('get-safety-events', { childId, startDate, endDate })
  }

  /**
   * Get learning progress
   */
  async getLearningProgress(childId = null, startDate = null, endDate = null) {
    return this.apiRequest('get-learning-progress', { childId, startDate, endDate })
  }

  /**
   * Get parent settings
   */
  async getSettings() {
    return this.apiRequest('get-settings')
  }

  /**
   * Update parent settings
   */
  async updateSettings(settings) {
    return this.apiRequest('update-settings', settings)
  }

  /**
   * Export safety events to CSV
   */
  async exportSafetyEventsCSV(events) {
    const headers = ['Date', 'Time', 'Child', 'Event Type', 'Category', 'Keyword']
    const rows = events.map(e => [
      new Date(e.timestamp).toLocaleDateString(),
      new Date(e.timestamp).toLocaleTimeString(),
      e.nickname || 'Unknown',
      e.event_type,
      e.category || '',
      e.keyword_matched || '',
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    this.downloadFile(csv, 'safety-events.csv', 'text/csv')
  }

  /**
   * Export safety events to PDF
   */
  async exportSafetyEventsPDF(events) {
    const { jsPDF } = await import('jspdf')
    await import('jspdf-autotable')

    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text('DaisyDog Safety Events Report', 14, 20)
    
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)

    const tableData = events.map(e => [
      new Date(e.timestamp).toLocaleDateString(),
      new Date(e.timestamp).toLocaleTimeString(),
      e.nickname || 'Unknown',
      e.event_type,
      e.category || '',
      e.keyword_matched || '',
    ])

    doc.autoTable({
      head: [['Date', 'Time', 'Child', 'Event Type', 'Category', 'Keyword']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [74, 144, 226] }, // DaisyDog blue
    })

    doc.save('safety-events.pdf')
  }

  /**
   * Download file helper
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// Create singleton instance
const dashboardApiService = new DashboardApiService()

export default dashboardApiService
