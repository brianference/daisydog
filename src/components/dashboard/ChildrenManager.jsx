import { useState, useEffect } from 'react';
import dashboardApiService from '../../services/DashboardApiService';
import './ChildrenManager.css';

export default function ChildrenManager() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [linkCode, setLinkCode] = useState(null);

  const [formData, setFormData] = useState({
    nickname: '',
    ageRange: '8-12',
    avatarColor: '#4A90E2'
  });

  const avatarColors = [
    '#4A90E2', '#764ba2', '#FFD700', '#FF6B6B', '#4ECDC4', 
    '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8E6CF'
  ];

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const data = await dashboardApiService.getChildren();
      setChildren(data.children);
    } catch (error) {
      alert('Error loading children: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();

    try {
      await dashboardApiService.addChild(
        formData.nickname,
        formData.ageRange,
        formData.avatarColor
      );

      setShowAddForm(false);
      setFormData({ nickname: '', ageRange: '8-12', avatarColor: '#4A90E2' });
      loadChildren();
      alert('Child added successfully!');
    } catch (error) {
      alert('Error adding child: ' + error.message);
    }
  };

  const handleDeleteChild = async (childId) => {
    if (!confirm('Are you sure you want to remove this child?')) return;

    try {
      await dashboardApiService.deleteChild(childId);
      loadChildren();
      alert('Child removed successfully');
    } catch (error) {
      alert('Error removing child: ' + error.message);
    }
  };

  const handleGenerateCode = async (child) => {
    try {
      const data = await dashboardApiService.generateLinkCode(child.id);
      setSelectedChild(child);
      setLinkCode(data);
    } catch (error) {
      alert('Error generating code: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading children...</div>;
  }

  return (
    <div className="children-manager">
      <div className="page-header">
        <h1>Manage Children</h1>
        <button 
          className="add-child-button"
          onClick={() => setShowAddForm(true)}
          disabled={children.length >= 3}
        >
          + Add Child {children.length >= 3 && '(Max 3)'}
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Child</h2>
            <form onSubmit={handleAddChild}>
              <div className="form-group">
                <label>Nickname</label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  required
                  maxLength={50}
                  placeholder="E.g., Johnny, Sarah"
                />
              </div>

              <div className="form-group">
                <label>Age Range</label>
                <select
                  value={formData.ageRange}
                  onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                >
                  <option value="4-7">4-7 years</option>
                  <option value="8-12">8-12 years</option>
                  <option value="13-16">13-16 years</option>
                </select>
              </div>

              <div className="form-group">
                <label>Avatar Color</label>
                <div className="color-picker">
                  {avatarColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.avatarColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, avatarColor: color })}
                    />
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit">Add Child</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {linkCode && selectedChild && (
        <div className="modal-overlay" onClick={() => setLinkCode(null)}>
          <div className="modal-content link-code-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Link Code for {selectedChild.nickname}</h2>
            <div className="link-code-display">
              <div className="code">{linkCode.code}</div>
              <p className="code-instructions">
                Have {selectedChild.nickname} enter this code at:<br/>
                <strong>{window.location.origin}/link-child</strong>
              </p>
              <p className="code-expiry">
                Expires: {new Date(linkCode.expiresAt).toLocaleString()}
              </p>
            </div>
            <button onClick={() => setLinkCode(null)}>Close</button>
          </div>
        </div>
      )}

      <div className="children-grid">
        {children.length === 0 ? (
          <div className="empty-state">
            <p>No children added yet.</p>
            <p>Click "Add Child" to get started!</p>
          </div>
        ) : (
          children.map(child => (
            <div key={child.id} className="child-card">
              <div 
                className="child-avatar" 
                style={{ backgroundColor: child.avatar_color }}
              >
                {child.nickname.charAt(0).toUpperCase()}
              </div>
              <h3>{child.nickname}</h3>
              <p className="age-range">Age: {child.age_range}</p>
              <p className="created-date">
                Added: {new Date(child.created_at).toLocaleDateString()}
              </p>
              <div className="child-actions">
                <button 
                  className="generate-code-button"
                  onClick={() => handleGenerateCode(child)}
                >
                  📱 Get Link Code
                </button>
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteChild(child.id)}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
