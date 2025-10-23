import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { neon } from '@neondatabase/serverless';
import './ChildLinkPage.css';

export default function ChildLinkPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify code exists and is not expired
      const sql = neon(import.meta.env.VITE_DATABASE_URL || import.meta.env.DATABASE_URL);
      
      const result = await sql`
        SELECT clc.*, c.nickname
        FROM child_link_codes clc
        JOIN children c ON c.id = clc.child_id
        WHERE clc.code = ${code}
        AND clc.expires_at > NOW()
        AND clc.used_at IS NULL
        LIMIT 1
      `;

      if (result.length === 0) {
        setError('Invalid or expired code. Please check the code and try again.');
        setLoading(false);
        return;
      }

      const linkData = result[0];

      // Mark code as used
      await sql`
        UPDATE child_link_codes
        SET used_at = NOW()
        WHERE id = ${linkData.id}
      `;

      // Store child ID in localStorage for session linking
      localStorage.setItem('linkedChildId', linkData.child_id);
      localStorage.setItem('childNickname', linkData.nickname);

      alert(`Successfully linked to ${linkData.nickname}'s account!`);
      navigate('/chat');
    } catch (err) {
      console.error('Link error:', err);
      setError('Failed to link account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="child-link-page">
      <div className="link-container">
        <div className="link-header">
          <h1>Link Your Account 🐾</h1>
          <p>Enter the code your parent gave you</p>
        </div>

        <form onSubmit={handleSubmit} className="link-form">
          {error && <div className="error-message">{error}</div>}

          <div className="code-input-container">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="000000"
              className="code-input"
              required
              pattern="[0-9]{6}"
            />
            <p className="input-hint">6-digit code</p>
          </div>

          <button type="submit" disabled={loading || code.length !== 6} className="link-button">
            {loading ? 'Linking...' : 'Link Account'}
          </button>
        </form>

        <div className="link-info">
          <h3>How to get a code:</h3>
          <ol>
            <li>Ask your parent to log in to their dashboard</li>
            <li>They'll click "Manage Children"</li>
            <li>Select your profile and click "Get Link Code"</li>
            <li>They'll give you the 6-digit code</li>
          </ol>
          <p className="note">Codes expire after 3 days</p>
        </div>

        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
