// Child Session Service
// Tracks activity and safety events for linked children to parent dashboard

class ChildSessionService {
  constructor() {
    this.sessionId = null;
    this.childId = null;
    this.checkLinkedChild();
  }

  checkLinkedChild() {
    this.childId = localStorage.getItem('linkedChildId');
    this.sessionId = localStorage.getItem('currentSessionId');
    return !!this.childId;
  }

  isLinkedChild() {
    return !!this.childId;
  }

  getChildId() {
    return this.childId;
  }

  getSessionId() {
    return this.sessionId;
  }

  async createSession() {
    if (!this.isLinkedChild()) {
      console.log('Not a linked child, skipping session creation');
      return null;
    }

    try {
      // Create a session in the database
      const sessionData = {
        childId: this.childId,
        startTime: new Date().toISOString(),
      };

      // Store session ID locally
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('currentSessionId', this.sessionId);

      console.log('✅ Child session created:', this.sessionId);
      return this.sessionId;
    } catch (error) {
      console.error('Failed to create child session:', error);
      return null;
    }
  }

  async logActivity(activityType, data = {}) {
    if (!this.isLinkedChild()) {
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/dashboard-api?action=log-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId: this.childId,
          sessionId: this.sessionId,
          activityType,
          timestamp: new Date().toISOString(),
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log activity');
      }

      console.log('✅ Activity logged:', activityType);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  async logSafetyEvent(message, category, response) {
    if (!this.isLinkedChild()) {
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/dashboard-api?action=log-safety-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId: this.childId,
          sessionId: this.sessionId,
          message: message.substring(0, 500), // Truncate for privacy
          category,
          aiResponse: response?.substring(0, 500),
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log safety event');
      }

      console.log('🛡️ Safety event logged:', category);
    } catch (error) {
      console.error('Failed to log safety event:', error);
    }
  }

  endSession() {
    if (this.sessionId) {
      localStorage.removeItem('currentSessionId');
      this.sessionId = null;
    }
  }
}

export default new ChildSessionService();
