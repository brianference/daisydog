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

  useEffect(() => {
    const checkAuth = async () => {
      if (!parentAuthService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      const parentData = parentAuthService.getParent();
      setParent(parentData);
      setLoading(false);

      // Note: Temporarily allowing access even without active subscription
      // This gives time for Stripe webhook to process
      // In production, you may want to poll for subscription status
      // or show a "Processing payment..." message
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
      <aside className="dashboard-sidebar">
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
