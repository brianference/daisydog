import { useState, useEffect } from 'react';
import dashboardApiService from '../../services/DashboardApiService';
import './LearningProgress.css';

export default function LearningProgress() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('all');
  const [features, setFeatures] = useState([]);
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
          <div className="stat-icon">🙏</div>
          <div className="stat-value">{stats?.prayersCount || 0}</div>
          <div className="stat-label">Prayer Sessions</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✨</div>
          <div className="stat-value">{stats?.totalActivities || 0}</div>
          <div className="stat-label">Total Activities</div>
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

      <div className="curriculum-card">
        <h2>Curriculum Alignment (K-8)</h2>
        <div className="curriculum-grid">
          <div className="curriculum-item">
            <h3>Faith Formation</h3>
            <p>Prayer guidance, saint stories, and Catholic values</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '75%'}}></div>
            </div>
          </div>

          <div className="curriculum-item">
            <h3>Language Arts</h3>
            <p>Reading comprehension and vocabulary building</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '60%'}}></div>
            </div>
          </div>

          <div className="curriculum-item">
            <h3>Social Studies</h3>
            <p>History, geography, and cultural awareness</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '45%'}}></div>
            </div>
          </div>

          <div className="curriculum-item">
            <h3>STEM</h3>
            <p>Science, math, and problem-solving skills</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '50%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
