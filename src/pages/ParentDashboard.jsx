import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import parentAuthService from '../services/ParentAuthService';
import ActivityOverview from '../components/dashboard/ActivityOverview';
import SafetyLog from '../components/dashboard/SafetyLog';
import LearningProgress from '../components/dashboard/LearningProgress';
import ChildrenManager from '../components/dashboard/ChildrenManager';
import SettingsPanel from '../components/dashboard/SettingsPanel';
import BillingPage from '../components/dashboard/BillingPage';
import './ParentDashboard.css';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProcessingBanner, setShowProcessingBanner] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!parentAuthService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      const parentData = parentAuthService.getParent();
      setParent(parentData);
      setLoading(false);

      // Show processing banner if subscription status is not active
      if (parentData.subscriptionStatus !== 'active') {
        setShowProcessingBanner(true);
        
        // Poll for subscription status every 5 seconds
        const pollInterval = setInterval(async () => {
          const verified = await parentAuthService.verifyToken();
          if (verified) {
            const updatedParent = parentAuthService.getParent();
            setParent(updatedParent);
            
            if (updatedParent.subscriptionStatus === 'active') {
              setShowProcessingBanner(false);
              clearInterval(pollInterval);
            }
          }
        }, 5000);

        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          setShowProcessingBanner(false);
        }, 5 * 60 * 1000);

        return () => clearInterval(pollInterval);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    parentAuthService.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {showProcessingBanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          color: '#333',
          padding: '12px 20px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          ⏳ Processing your payment... Your subscription will be activated shortly. (This usually takes less than 1 minute)
        </div>
      )}
      <aside className="dashboard-sidebar" style={{ marginTop: showProcessingBanner ? '44px' : '0' }}>
        <div className="sidebar-header">
          <h2>🐾 DaisyDog</h2>
          <p className="parent-email">{parent?.email}</p>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={location.pathname === '/dashboard' ? 'active' : ''}
          >
            📊 Activity Overview
          </Link>
          <Link 
            to="/dashboard/children" 
            className={location.pathname === '/dashboard/children' ? 'active' : ''}
          >
            👨‍👩‍👧‍👦 Manage Children
          </Link>
          <Link 
            to="/dashboard/safety" 
            className={location.pathname === '/dashboard/safety' ? 'active' : ''}
          >
            🛡️ Safety Events
          </Link>
          <Link 
            to="/dashboard/learning" 
            className={location.pathname === '/dashboard/learning' ? 'active' : ''}
          >
            📚 Learning Progress
          </Link>
          <Link 
            to="/dashboard/settings" 
            className={location.pathname === '/dashboard/settings' ? 'active' : ''}
          >
            ⚙️ Settings
          </Link>
          <Link 
            to="/dashboard/billing" 
            className={location.pathname === '/dashboard/billing' ? 'active' : ''}
          >
            💳 Billing
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => navigate('/')} className="home-button">
            🏠 Back to DaisyDog
          </button>
          <button onClick={handleLogout} className="logout-button">
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-content">
        <Routes>
          <Route index element={<ActivityOverview />} />
          <Route path="children" element={<ChildrenManager />} />
          <Route path="safety" element={<SafetyLog />} />
          <Route path="learning" element={<LearningProgress />} />
          <Route path="settings" element={<SettingsPanel />} />
          <Route path="billing" element={<BillingPage />} />
        </Routes>
      </main>
    </div>
  );
}
