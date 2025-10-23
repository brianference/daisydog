import { useState, useEffect } from 'react';
import dashboardApiService from '../../services/DashboardApiService';
import './SettingsPanel.css';

export default function SettingsPanel() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await dashboardApiService.getSettings();
      setSettings(data.settings || getDefaultSettings());
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSettings = () => {
    return {
      emailReportsEnabled: true,
      safetyAlertsEnabled: true,
      contentFilterLevel: 'moderate',
      dailyTimeLimitMinutes: null,
      bedtimeStart: null,
      bedtimeEnd: null,
      allowedFeatures: { games: true, chat: true, prayers: true }
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dashboardApiService.updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings-panel">
      <div className="page-header">
        <h1>Settings</h1>
        <button onClick={handleSave} disabled={saving} className="save-button">
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <h2>Email Preferences</h2>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.emailReportsEnabled}
              onChange={(e) => setSettings({...settings, emailReportsEnabled: e.target.checked})}
            />
            <span>Weekly email reports</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.safetyAlertsEnabled}
              onChange={(e) => setSettings({...settings, safetyAlertsEnabled: e.target.checked})}
            />
            <span>Real-time safety alerts</span>
          </label>
        </div>

        <div className="settings-card">
          <h2>Content Filtering</h2>
          
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="filterLevel"
                value="relaxed"
                checked={settings.contentFilterLevel === 'relaxed'}
                onChange={(e) => setSettings({...settings, contentFilterLevel: e.target.value})}
              />
              <div className="radio-info">
                <strong>Relaxed</strong>
                <p>Basic safety filtering only</p>
              </div>
            </label>

            <label className="radio-label">
              <input
                type="radio"
                name="filterLevel"
                value="moderate"
                checked={settings.contentFilterLevel === 'moderate'}
                onChange={(e) => setSettings({...settings, contentFilterLevel: e.target.value})}
              />
              <div className="radio-info">
                <strong>Moderate (Recommended)</strong>
                <p>Balanced protection and freedom</p>
              </div>
            </label>

            <label className="radio-label">
              <input
                type="radio"
                name="filterLevel"
                value="strict"
                checked={settings.contentFilterLevel === 'strict'}
                onChange={(e) => setSettings({...settings, contentFilterLevel: e.target.value})}
              />
              <div className="radio-info">
                <strong>Strict</strong>
                <p>Maximum safety filtering</p>
              </div>
            </label>
          </div>
        </div>

        <div className="settings-card">
          <h2>Time Limits</h2>
          
          <div className="form-group">
            <label>Daily time limit (minutes)</label>
            <input
              type="number"
              value={settings.dailyTimeLimitMinutes || ''}
              onChange={(e) => setSettings({...settings, dailyTimeLimitMinutes: parseInt(e.target.value) || null})}
              placeholder="No limit"
              min="0"
              max="480"
            />
            <p className="help-text">Leave empty for no limit</p>
          </div>

          <div className="form-group">
            <label>Bedtime start</label>
            <input
              type="time"
              value={settings.bedtimeStart || ''}
              onChange={(e) => setSettings({...settings, bedtimeStart: e.target.value || null})}
            />
          </div>

          <div className="form-group">
            <label>Bedtime end</label>
            <input
              type="time"
              value={settings.bedtimeEnd || ''}
              onChange={(e) => setSettings({...settings, bedtimeEnd: e.target.value || null})}
            />
            <p className="help-text">DaisyDog will be unavailable during bedtime hours</p>
          </div>
        </div>

        <div className="settings-card">
          <h2>Allowed Features</h2>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.allowedFeatures?.games}
              onChange={(e) => setSettings({
                ...settings,
                allowedFeatures: {...settings.allowedFeatures, games: e.target.checked}
              })}
            />
            <span>🎮 Games</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.allowedFeatures?.chat}
              onChange={(e) => setSettings({
                ...settings,
                allowedFeatures: {...settings.allowedFeatures, chat: e.target.checked}
              })}
            />
            <span>💬 Chat with Daisy</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.allowedFeatures?.prayers}
              onChange={(e) => setSettings({
                ...settings,
                allowedFeatures: {...settings.allowedFeatures, prayers: e.target.checked}
              })}
            />
            <span>🙏 Prayers & Faith Content</span>
          </label>
        </div>
      </div>
    </div>
  );
}
