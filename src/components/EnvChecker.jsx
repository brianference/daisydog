/**
 * EnvChecker - Development component for checking environment variables
 * Remove or hide in production
 */

import React from 'react';

const EnvChecker = () => {
  if (import.meta.env.PROD) {
    return null; // Hide in production
  }

  const envVars = {
    'VITE_BIBLE_API_KEY': import.meta.env.VITE_BIBLE_API_KEY,
    'VITE_API_BIBLE_KEY': import.meta.env.VITE_API_BIBLE_KEY,
    'VITE_GEMINI_API_KEY': import.meta.env.VITE_GEMINI_API_KEY,
    'VITE_DEBUG_MODE': import.meta.env.VITE_DEBUG_MODE,
    'NODE_ENV': import.meta.env.NODE_ENV,
    'MODE': import.meta.env.MODE
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      width: '300px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '10px',
      fontSize: '11px',
      zIndex: 9998,
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#4CAF50' }}>🔧 Environment Variables</h4>
      
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key} style={{ 
          marginBottom: '4px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span style={{ color: '#81C784' }}>{key}:</span>
          <span style={{ 
            color: value ? '#4CAF50' : '#F44336',
            marginLeft: '8px'
          }}>
            {value ? (
              key.includes('KEY') ? `${value.substring(0, 8)}...` : value
            ) : 'Not set'}
          </span>
        </div>
      ))}
      
      <div style={{ 
        marginTop: '8px', 
        paddingTop: '8px', 
        borderTop: '1px solid #333',
        fontSize: '9px',
        color: '#999'
      }}>
        Dev Only - Check your .env file
      </div>
    </div>
  );
};

export default EnvChecker;
