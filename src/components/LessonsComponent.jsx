import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import lessonsService from '../services/LessonsService';
import daisyAdapter from '../services/DaisyLessonAdapter';
import './LessonsComponent.css';

export default function LessonsComponent({ childSessionId, onClose }) {
  const [view, setView] = useState('browse'); // 'browse', 'lesson', 'teaching'
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [adaptedLesson, setAdaptedLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: null,
    age: null,
    season: null
  });
  const [topics, setTopics] = useState(null);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [lessonStartTime, setLessonStartTime] = useState(null);

  useEffect(() => {
    loadTopics();
    loadCurrentSeason();
    loadLessons();
  }, [filters]);

  async function loadTopics() {
    try {
      const data = await lessonsService.getTopics();
      setTopics(data);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  }

  async function loadCurrentSeason() {
    try {
      const season = await lessonsService.getCurrentSeason();
      setCurrentSeason(season);
    } catch (error) {
      console.error('Error loading season:', error);
    }
  }

  async function loadLessons() {
    setLoading(true);
    try {
      const data = await lessonsService.getLessons(filters);
      setLessons(data);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  }

  async function selectLesson(lesson) {
    setLoading(true);
    try {
      const fullLesson = await lessonsService.getLessonById(lesson.id);
      setSelectedLesson(fullLesson);
      setView('lesson');
    } catch (error) {
      console.error('Error loading lesson details:', error);
    } finally {
      setLoading(false);
    }
  }

  async function startTeaching() {
    setLoading(true);
    setLessonStartTime(Date.now());
    
    try {
      // Start lesson tracking
      if (childSessionId) {
        await lessonsService.startLesson(childSessionId, selectedLesson.id);
      }

      // Get Daisy's adaptation
      const adapted = await daisyAdapter.adaptLessonForDaisy(
        selectedLesson,
        selectedLesson.age_group
      );
      setAdaptedLesson(adapted);
      setView('teaching');
    } catch (error) {
      console.error('Error starting lesson:', error);
      alert('Oops! I had trouble preparing the lesson. Please try again!');
    } finally {
      setLoading(false);
    }
  }

  async function completeLesson() {
    if (childSessionId && lessonStartTime) {
      const timeSpentMinutes = Math.round((Date.now() - lessonStartTime) / 60000);
      try {
        await lessonsService.completeLesson(
          childSessionId,
          selectedLesson.id,
          timeSpentMinutes
        );
      } catch (error) {
        console.error('Error completing lesson:', error);
      }
    }
    
    setView('browse');
    setSelectedLesson(null);
    setAdaptedLesson(null);
    setLessonStartTime(null);
  }

  return (
    <div className="lessons-component">
      <div className="lessons-header">
        <h2>📚 Faith Lessons with Daisy</h2>
        <button onClick={onClose} className="close-button">✕</button>
      </div>

      {currentSeason && view === 'browse' && (
        <div className="current-season-banner">
          <span className="season-icon" style={{ color: currentSeason.color }}>●</span>
          <span>Current Season: <strong>{currentSeason.season}</strong></span>
          <span className="season-desc">{currentSeason.description}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="browse-view"
          >
            <div className="filters-section">
              <div className="filter-group">
                <label>Topic Type:</label>
                <div className="filter-buttons">
                  <button
                    className={!filters.type ? 'active' : ''}
                    onClick={() => setFilters({ ...filters, type: null })}
                  >
                    All
                  </button>
                  {topics?.types.map(t => (
                    <button
                      key={t.lesson_type}
                      className={filters.type === t.lesson_type ? 'active' : ''}
                      onClick={() => setFilters({ ...filters, type: t.lesson_type })}
                    >
                      {t.lesson_type} ({t.count})
                    </button>
                  ))}
                </div>
              </div>

              {currentSeason && (
                <div className="season-suggestion">
                  <button
                    className="season-filter-btn"
                    onClick={() => setFilters({ ...filters, season: currentSeason.season })}
                  >
                    🌟 Show {currentSeason.season} Lessons
                  </button>
                </div>
              )}
            </div>

            <div className="lessons-grid">
              {loading ? (
                <div className="loading">Loading lessons... 🐾</div>
              ) : lessons.length === 0 ? (
                <div className="no-lessons">
                  <p>No lessons found with these filters.</p>
                  <button onClick={() => setFilters({ type: null, age: null, season: null })}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                lessons.map(lesson => (
                  <motion.div
                    key={lesson.id}
                    className="lesson-card"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectLesson(lesson)}
                  >
                    <div className="lesson-type-badge">{lesson.lesson_type}</div>
                    <h3>{lesson.title}</h3>
                    <p className="lesson-age">{lesson.age_group}</p>
                    {lesson.liturgical_season && (
                      <p className="lesson-season">⛪ {lesson.liturgical_season}</p>
                    )}
                    {lesson.objectives && lesson.objectives.length > 0 && (
                      <p className="lesson-preview">{lesson.objectives[0]}</p>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {view === 'lesson' && selectedLesson && (
          <motion.div
            key="lesson"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="lesson-detail-view"
          >
            <button onClick={() => setView('browse')} className="back-button">
              ← Back to Lessons
            </button>

            <div className="lesson-detail">
              <div className="lesson-header">
                <span className="lesson-type-tag">{selectedLesson.lesson_type}</span>
                <h2>{selectedLesson.title}</h2>
                <p className="lesson-meta">
                  {selectedLesson.age_group}
                  {selectedLesson.liturgical_season && ` • ${selectedLesson.liturgical_season}`}
                </p>
              </div>

              {selectedLesson.objectives && selectedLesson.objectives.length > 0 && (
                <div className="lesson-section">
                  <h3>What We'll Learn:</h3>
                  <ul>
                    {selectedLesson.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedLesson.vocabulary_words && selectedLesson.vocabulary_words.length > 0 && (
                <div className="lesson-section">
                  <h3>Important Words:</h3>
                  <div className="vocab-tags">
                    {selectedLesson.vocabulary_words.map((word, i) => (
                      <span key={i} className="vocab-tag">{word}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedLesson.activities && selectedLesson.activities.length > 0 && (
                <div className="lesson-section">
                  <h3>Activities ({selectedLesson.activities.length}):</h3>
                  <div className="activities-list">
                    {selectedLesson.activities.map((activity, i) => (
                      <div key={i} className="activity-item">
                        <span className="activity-type">{activity.type}</span>
                        <div className="activity-content">
                          <div className="activity-header">
                            <strong>{activity.name}</strong>
                          </div>
                          {activity.description && activity.description !== activity.name && (
                            <p className="activity-description">{activity.description}</p>
                          )}
                          {activity.links && activity.links.length > 0 && (
                            <div className="activity-links">
                              {activity.links.map((link, idx) => (
                                <a 
                                  key={idx} 
                                  href={link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="activity-link"
                                >
                                  🔗 {link.includes('dltk') ? 'DLTK' : 
                                      link.includes('daniellesplace') ? "Danielle's Place" :
                                      link.includes('sundayschool') ? 'Sunday School' :
                                      link.includes('childrens') ? 'Children\'s Ministry' :
                                      link.includes('craft') ? 'Craft Ideas' :
                                      'View Resource'}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="lesson-actions">
                <button
                  onClick={startTeaching}
                  className="start-lesson-btn"
                  disabled={loading}
                >
                  {loading ? 'Preparing lesson...' : '🐾 Start Learning with Daisy!'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'teaching' && adaptedLesson && (
          <motion.div
            key="teaching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="teaching-view"
          >
            <div className="daisy-teaching">
              <div className="daisy-welcome">
                <div className="daisy-avatar">🐕</div>
                <div className="welcome-message">
                  <p>{adaptedLesson.welcome}</p>
                </div>
              </div>

              <div className="teaching-section">
                <h3>📖 The Story</h3>
                <p className="story-text">{adaptedLesson.story}</p>
              </div>

              {adaptedLesson.wondering_questions && (
                <div className="teaching-section">
                  <h3>💭 Let's Wonder Together...</h3>
                  <ul className="wondering-list">
                    {adaptedLesson.wondering_questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {adaptedLesson.discussion_prompts && (
                <div className="teaching-section">
                  <h3>💬 Let's Talk</h3>
                  <ul className="discussion-list">
                    {adaptedLesson.discussion_prompts.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {adaptedLesson.activities && (
                <div className="teaching-section">
                  <h3>🎨 Fun Activities</h3>
                  <ul className="activities-suggestions">
                    {adaptedLesson.activities.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {adaptedLesson.prayer && (
                <div className="teaching-section prayer-section">
                  <h3>🙏 Let's Pray Together</h3>
                  <div className="prayer-text">{adaptedLesson.prayer}</div>
                </div>
              )}

              {adaptedLesson.parent_tips && (
                <div className="teaching-section parent-tips">
                  <h3>📝 For Parents</h3>
                  <ul>
                    {adaptedLesson.parent_tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="lesson-complete-actions">
                <button onClick={completeLesson} className="complete-btn">
                  ✅ I Finished This Lesson!
                </button>
                <button onClick={() => setView('lesson')} className="back-btn">
                  ← Back to Lesson Details
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
