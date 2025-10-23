import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardApiService from '../../services/DashboardApiService';
import './ActivityOverview.css';

const COLORS = ['#4A90E2', '#764ba2', '#FFD700', '#FF6B6B', '#4ECDC4'];

export default function ActivityOverview() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedChild, dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const childrenData = await dashboardApiService.getChildren();
      setChildren(childrenData.children);

      const { startDate, endDate } = getDateRange(dateRange);
      const childId = selectedChild === 'all' ? null : selectedChild;

      const [sessions, features] = await Promise.all([
        dashboardApiService.getActivity(childId, startDate, endDate),
        dashboardApiService.getLearningProgress(childId, startDate, endDate)
      ]);

      processActivityData(sessions.sessions, features.features);
    } catch (error) {
      console.error('Error loading activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (range) => {
    const end = new Date();
    const start = new Date();
    
    if (range === 'week') start.setDate(start.getDate() - 7);
    else if (range === 'month') start.setDate(start.getDate() - 30);
    else if (range === 'year') start.setFullYear(start.getFullYear() - 1);

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    };
  };

  const processActivityData = (sessions, features) => {
    // Process sessions by day
    const dailyActivity = {};
    sessions.forEach(session => {
      const date = new Date(session.created_at).toLocaleDateString();
      if (!dailyActivity[date]) {
        dailyActivity[date] = { date, minutes: 0, sessions: 0 };
      }
      dailyActivity[date].minutes += Math.floor(session.session_duration / 60);
      dailyActivity[date].sessions += 1;
    });

    // Process features (games played)
    const gameStats = {};
    features.forEach(feature => {
      if (feature.feature_name.startsWith('game_')) {
        const game = feature.feature_name.replace('game_', '');
        if (!gameStats[game]) {
          gameStats[game] = 0;
        }
        gameStats[game] += 1;
      }
    });

    const totalMinutes = sessions.reduce((sum, s) => sum + Math.floor(s.session_duration / 60), 0);

    setActivityData({
      dailyChart: Object.values(dailyActivity).sort((a, b) => new Date(a.date) - new Date(b.date)),
      gamesChart: Object.entries(gameStats).map(([name, value]) => ({ name, value })),
      totalMinutes,
      totalSessions: sessions.length,
      averageMinutes: sessions.length > 0 ? Math.floor(totalMinutes / sessions.length) : 0
    });
  };

  if (loading) {
    return <div className="loading">Loading activity data...</div>;
  }

  return (
    <div className="activity-overview">
      <div className="page-header">
        <h1>Activity Overview</h1>
        <div className="filters">
          <select 
            value={selectedChild} 
            onChange={(e) => setSelectedChild(e.target.value)}
          >
            <option value="all">All Children</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.nickname}</option>
            ))}
          </select>

          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{activityData?.totalMinutes || 0}</div>
          <div className="stat-label">Total Minutes</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{activityData?.totalSessions || 0}</div>
          <div className="stat-label">Total Sessions</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{activityData?.averageMinutes || 0}</div>
          <div className="stat-label">Avg Minutes/Session</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎮</div>
          <div className="stat-value">{activityData?.gamesChart?.length || 0}</div>
          <div className="stat-label">Games Played</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Daily Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData?.dailyChart || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="minutes" fill="#4A90E2" name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Games Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activityData?.gamesChart || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {(activityData?.gamesChart || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
