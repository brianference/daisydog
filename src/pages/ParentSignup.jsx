import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import parentAuthService from '../services/ParentAuthService';
import './ParentAuth.css';

export default function ParentSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fromStripe, setFromStripe] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const sessionId = searchParams.get('session_id');
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    
    if (sessionId) {
      setFromStripe(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await parentAuthService.signup(email, password);
      
      if (fromStripe) {
        alert('Account created! You can now log in to access your dashboard.');
        navigate('/login');
      } else {
        alert('Account created! Please check your email to verify your account.');
        navigate('/pricing');
      }
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Create Parent Account 🐾</h1>
          <p>{fromStripe ? 'Complete your account setup to access the dashboard' : "Start monitoring your child's journey with Daisy"}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {fromStripe && (
            <div className="success-message" style={{
              background: '#d4edda',
              color: '#155724',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #c3e6cb'
            }}>
              ✅ Payment successful! Create your account below.
            </div>
          )}
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your password"
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-links">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
          <p><Link to="/">← Back to home</Link></p>
        </div>
      </div>
    </div>
  );
}
