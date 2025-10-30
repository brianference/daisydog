class LessonsService {
  constructor() {
    this.baseUrl = '/.netlify/functions/lessons-api';
  }

  async getLessons(filters = {}) {
    const params = new URLSearchParams();
    if (filters.topic) params.append('topic', filters.topic);
    if (filters.age) params.append('age', filters.age);
    if (filters.season) params.append('season', filters.season);
    if (filters.type) params.append('type', filters.type);
    params.append('action', 'get-lessons');

    const response = await fetch(`${this.baseUrl}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch lessons');
    
    const data = await response.json();
    return data.lessons || [];
  }

  async getLessonById(lessonId) {
    const response = await fetch(`${this.baseUrl}/lessons/${lessonId}`);
    if (!response.ok) throw new Error('Failed to fetch lesson');
    
    const data = await response.json();
    return data.lesson;
  }

  async getCurrentSeason() {
    const response = await fetch(`${this.baseUrl}?action=get-current-season`);
    if (!response.ok) throw new Error('Failed to fetch current season');
    
    const data = await response.json();
    return data.season;
  }

  async getTopics() {
    const response = await fetch(`${this.baseUrl}?action=get-topics`);
    if (!response.ok) throw new Error('Failed to fetch topics');
    
    const data = await response.json();
    return data;
  }

  async startLesson(childId, lessonId) {
    const headers = { 'Content-Type': 'application/json' };
    
    // Add child session token if available
    const childToken = localStorage.getItem('childSessionToken');
    if (childToken) {
      headers['Authorization'] = `Bearer ${childToken}`;
    }

    const response = await fetch(`${this.baseUrl}?action=start-lesson`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ childId, lessonId })
    });

    if (!response.ok) throw new Error('Failed to start lesson');
    return await response.json();
  }

  async completeLesson(childId, lessonId, timeSpentMinutes, notes = null) {
    const headers = { 'Content-Type': 'application/json' };
    
    // Add child session token if available
    const childToken = localStorage.getItem('childSessionToken');
    if (childToken) {
      headers['Authorization'] = `Bearer ${childToken}`;
    }

    const response = await fetch(`${this.baseUrl}?action=complete-lesson`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ childId, lessonId, timeSpentMinutes, notes })
    });

    if (!response.ok) throw new Error('Failed to complete lesson');
    return await response.json();
  }

  async getProgress(childId, authToken = null) {
    const headers = { 'Content-Type': 'application/json' };
    
    // Add parent auth token if provided (for dashboard queries)
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${this.baseUrl}?action=get-progress`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ childId })
    });

    if (!response.ok) throw new Error('Failed to fetch progress');
    return await response.json();
  }
}

export default new LessonsService();
