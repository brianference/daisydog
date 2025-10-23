import { useState, useEffect } from 'react';
import dashboardApiService from '../../services/DashboardApiService';
import './SafetyLog.css';

export default function SafetyLog() {
  const [children, setChildren] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedChild, setSelectedChild] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [selectedChild, selectedType, events]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [childrenData, eventsData] = await Promise.all([
        dashboardApiService.getChildren(),
        dashboardApiService.getSafetyEvents()
      ]);

      setChildren(childrenData.children);
      setEvents(eventsData.events);
    } catch (error) {
      console.error('Error loading safety events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (selectedChild !== 'all') {
      filtered = filtered.filter(e => e.child_id === selectedChild);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(e => e.event_type === selectedType);
    }

    setFilteredEvents(filtered);
  };

  const handleExportCSV = () => {
    dashboardApiService.exportSafetyEventsCSV(filteredEvents);
  };

  const handleExportPDF = () => {
    dashboardApiService.exportSafetyEventsPDF(filteredEvents);
  };

  if (loading) {
    return <div className="loading">Loading safety events...</div>;
  }

  return (
    <div className="safety-log">
      <div className="page-header">
        <h1>Safety Events</h1>
        <div className="export-buttons">
          <button onClick={handleExportCSV} className="export-button">
            📄 Export CSV
          </button>
          <button onClick={handleExportPDF} className="export-button">
            📋 Export PDF
          </button>
        </div>
      </div>

      <div className="filters">
        <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}>
          <option value="all">All Children</option>
          {children.map(child => (
            <option key={child.id} value={child.id}>{child.nickname}</option>
          ))}
        </select>

        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="all">All Event Types</option>
          <option value="drug_safety">Drug Safety</option>
          <option value="comprehensive_safety">Comprehensive Safety</option>
          <option value="false_positive">False Positive</option>
        </select>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <p>No safety events found</p>
          <p>This is great news! 🎉</p>
        </div>
      ) : (
        <div className="events-table-container">
          <table className="events-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Child</th>
                <th>Event Type</th>
                <th>Category</th>
                <th>Keyword</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => (
                <tr key={event.id}>
                  <td>
                    <div className="datetime">
                      <div>{new Date(event.timestamp).toLocaleDateString()}</div>
                      <div className="time">{new Date(event.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </td>
                  <td className="child-name">{event.nickname || 'Unknown'}</td>
                  <td>
                    <span className={`event-badge ${event.event_type}`}>
                      {event.event_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{event.category || '-'}</td>
                  <td className="keyword">{event.keyword_matched || '-'}</td>
                  <td>
                    <span className={`status-badge ${event.parent_reviewed ? 'reviewed' : 'pending'}`}>
                      {event.parent_reviewed ? '✓ Reviewed' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
