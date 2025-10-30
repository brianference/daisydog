import { useState, useEffect } from 'react';
import dashboardApiService from '../../services/DashboardApiService';
import lessonsService from '../../services/LessonsService';
import parentAuthService from '../../services/ParentAuthService';
import './LearningProgress.css';

export default function LearningProgress() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('all');
  const [features, setFeatures] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [lessonStats, setLessonStats] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedChild]);

  const loadData = async () => {
    setLoading(true);
    try {
      const childrenData = await dashboardApiService.getChildren();
      setChildren(childrenData.children);

      const childId = selectedChild === 'all' ? null : selectedChild;
      const data = await dashboardApiService.getLearningProgress(childId);

      setFeatures(data.features);
      processStats(data.features);

      // Get parent auth token for lesson queries
      const authToken = parentAuthService.getToken();

      // Load lesson progress for selected children
      if (selectedChild !== 'all') {
        try {
          const lessonData = await lessonsService.getProgress(selectedChild, authToken);
          setLessonProgress(lessonData.progress || []);
          setLessonStats(lessonData.stats || {});
        } catch (error) {
          console.error('Error loading lesson progress:', error);
        }
      } else {
        // Aggregate lesson progress for all children
        const allProgress = [];
        for (const child of childrenData.children) {
          try {
            const lessonData = await lessonsService.getProgress(child.id, authToken);
            allProgress.push(...(lessonData.progress || []));
          } catch (error) {
            console.error(`Error loading progress for child ${child.id}:`, error);
          }
        }
        setLessonProgress(allProgress);
        
        // Calculate aggregate stats
        const totalLessons = allProgress.length;
        const completedLessons = allProgress.filter(p => p.completed_at).length;
        const totalMinutes = allProgress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0);
        setLessonStats({
          total_lessons: totalLessons,
          completed_lessons: completedLessons,
          total_minutes: totalMinutes
        });
      }
    } catch (error) {
      console.error('Error loading learning progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const processStats = (featuresData) => {
    const topics = {};
    const games = {};
    const prayers = [];

    featuresData.forEach(f => {
      if (f.feature_name.startsWith('game_')) {
        const game = f.feature_name.replace('game_', '');
        games[game] = (games[game] || 0) + 1;
      } else if (f.feature_name === 'prayers') {
        prayers.push(f);
      } else {
        topics[f.feature_name] = (topics[f.feature_name] || 0) + 1;
      }
    });

    setStats({
      topicsCount: Object.keys(topics).length,
      gamesCount: Object.keys(games).length,
      prayersCount: prayers.length,
      totalActivities: featuresData.length,
      topTopics: Object.entries(topics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
      topGames: Object.entries(games)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
    });
  };

  if (loading) {
    return <div className="loading">Loading learning progress...</div>;
  }

  return (
    <div className="learning-progress">
      <div className="page-header">
        <h1>Learning Progress</h1>
        <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}>
          <option value="all">All Children</option>
          {children.map(child => (
            <option key={child.id} value={child.id}>{child.nickname}</option>
          ))}
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{stats?.topicsCount || 0}</div>
          <div className="stat-label">Topics Explored</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎮</div>
          <div className="stat-value">{stats?.gamesCount || 0}</div>
          <div className="stat-label">Games Played</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📿</div>
          <div className="stat-value">{lessonStats?.completed_lessons || 0}</div>
          <div className="stat-label">Faith Lessons Completed</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{lessonStats?.total_minutes || 0}</div>
          <div className="stat-label">Minutes Learning</div>
        </div>
      </div>

      <div className="progress-grid">
        <div className="progress-card">
          <h2>Top Topics Discussed</h2>
          {stats?.topTopics.length > 0 ? (
            <div className="topics-list">
              {stats.topTopics.map((topic, index) => (
                <div key={index} className="topic-item">
                  <div className="topic-name">{topic.name}</div>
                  <div className="topic-count">{topic.count} times</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">No topics discussed yet</p>
          )}
        </div>

        <div className="progress-card">
          <h2>Favorite Games</h2>
          {stats?.topGames.length > 0 ? (
            <div className="games-list">
              {stats.topGames.map((game, index) => (
                <div key={index} className="game-item">
                  <div className="game-rank">#{index + 1}</div>
                  <div className="game-info">
                    <div className="game-name">{game.name}</div>
                    <div className="game-count">{game.count} plays</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">No games played yet</p>
          )}
        </div>
      </div>

      {lessonProgress.length > 0 && (
        <div className="lessons-card">
          <h2>Catholic Faith Lessons</h2>
          <div className="lessons-table">
            <table>
              <thead>
                <tr>
                  <th>Lesson Title</th>
                  <th>Topic</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Time Spent</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {lessonProgress.slice(0, 10).map((progress, index) => (
                  <tr key={index}>
                    <td>{progress.title}</td>
                    <td>{progress.topic}</td>
                    <td>
                      <span className={`lesson-type-badge ${progress.lesson_type?.toLowerCase().replace(' ', '-')}`}>
                        {progress.lesson_type}
                      </span>
                    </td>
                    <td>
                      <span className={progress.completed_at ? 'status-completed' : 'status-in-progress'}>
                        {progress.completed_at ? '✅ Completed' : '▶️ In Progress'}
                      </span>
                    </td>
                    <td>{progress.time_spent_minutes || 0} min</td>
                    <td>{new Date(progress.started_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lessonProgress.length > 10 && (
            <p className="showing-count">Showing 10 of {lessonProgress.length} lessons</p>
          )}
        </div>
      )}

      <div className="curriculum-card">
        <h2>Curriculum Alignment (K-8)</h2>
        <div className="curriculum-grid">
          <div className="curriculum-item">
            <h3>Faith Formation</h3>
            <p>Prayer guidance, saint stories, and Catholic values</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${Math.min(100, (lessonStats?.completed_lessons || 0) * 10)}%`}}></div>
            </div>
          </div>

          <div className="curriculum-item">
            <h3>Bible Stories</h3>
            <p>Old Testament stories and teachings</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${Math.min(100, lessonProgress.filter(p => p.lesson_type === 'Bible Story' && p.completed_at).length * 20)}%`}}></div>
            </div>
          </div>

          <div className="curriculum-item">
            <h3>Sacraments</h3>
            <p>Baptism, Eucharist, and other sacred rites</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${Math.min(100, lessonProgress.filter(p => p.lesson_type === 'Sacrament' && p.completed_at).length * 25)}%`}}></div>
            </div>
          </div>

          <div className="curriculum-item">
            <h3>Liturgical Year</h3>
            <p>Advent, Lent, Easter, and holy seasons</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${Math.min(100, lessonProgress.filter(p => p.liturgical_season && p.completed_at).length * 20)}%`}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
