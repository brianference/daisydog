/**
 * BibleTestPanel - Development component for testing Bible API integration
 * Remove or hide in production
 */

import React, { useState } from 'react';
import { useBibleVerse, useBibleSearch, useBibleStatus } from '../hooks/useBibleVerse.js';

const BibleTestPanel = () => {
  const [testReference, setTestReference] = useState('John 3:16');
  const [searchQuery, setSearchQuery] = useState('love');
  
  const { verse, loading: verseLoading, error: verseError, refetch } = useBibleVerse(testReference, { autoFetch: false });
  const { results, loading: searchLoading, error: searchError, search } = useBibleSearch();
  const status = useBibleStatus();

  const handleTestVerse = () => {
    refetch();
  };

  const handleTestSearch = () => {
    search(searchQuery, 3);
  };

  const testReferences = [
    'John 3:16',
    '1st commandment',
    'Psalm 23:1',
    'Matthew 5:44',
    'Genesis 1:27'
  ];

  if (import.meta.env.PROD) {
    return null; // Hide in production
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '400px',
      background: 'white',
      border: '2px solid #ccc',
      borderRadius: '8px',
      padding: '15px',
      fontSize: '12px',
      zIndex: 9999,
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>📖 Bible API Test Panel</h3>
      
      {/* API Status */}
      <div style={{ marginBottom: '15px', padding: '8px', background: '#f0f0f0', borderRadius: '4px' }}>
        <strong>API Status:</strong>
        <div>Initialized: {status.isInitialized ? '✅' : '❌'}</div>
        <div>Working: {status.apiWorking ? '✅' : '❌'}</div>
        <div>NAB ID: {status.confirmedNabId || 'Not found'}</div>
        <div>Requests: {status.requestCount}/{status.dailyLimit}</div>
        <div>Cache: {status.cacheSize} items</div>
      </div>

      {/* Quick Test Buttons */}
      <div style={{ marginBottom: '15px' }}>
        <strong>Quick Tests:</strong>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
          {testReferences.map(ref => (
            <button
              key={ref}
              onClick={() => setTestReference(ref)}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: testReference === ref ? '#007bff' : 'white',
                color: testReference === ref ? 'white' : 'black',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              {ref}
            </button>
          ))}
        </div>
      </div>

      {/* Verse Test */}
      <div style={{ marginBottom: '15px' }}>
        <strong>Verse Test:</strong>
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
          <input
            type="text"
            value={testReference}
            onChange={(e) => setTestReference(e.target.value)}
            placeholder="Enter reference (e.g., John 3:16)"
            style={{
              flex: 1,
              padding: '4px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '11px'
            }}
          />
          <button
            onClick={handleTestVerse}
            disabled={verseLoading}
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#28a745',
              color: 'white',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            {verseLoading ? '⏳' : 'Test'}
          </button>
        </div>
        
        {verseError && (
          <div style={{ color: 'red', marginTop: '5px', fontSize: '10px' }}>
            Error: {verseError}
          </div>
        )}
        
        {verse && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            background: '#e8f5e8', 
            borderRadius: '4px',
            fontSize: '10px'
          }}>
            <strong>{verse.reference}:</strong>
            <div style={{ marginTop: '4px', color: '#333' }}>
              {verse.cleanText || verse.text?.replace(/<[^>]*>/g, '') || verse.content?.replace(/<[^>]*>/g, '') || 'No text available'}
            </div>
            {verse.text && verse.text.includes('<') && (
              <div style={{ marginTop: '4px', fontSize: '8px', color: '#666' }}>
                <details>
                  <summary>Raw HTML (click to expand)</summary>
                  <div style={{ marginTop: '2px', fontFamily: 'monospace', fontSize: '8px' }}>
                    {verse.text || verse.content}
                  </div>
                </details>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Test */}
      <div style={{ marginBottom: '15px' }}>
        <strong>Search Test:</strong>
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search term (e.g., love)"
            style={{
              flex: 1,
              padding: '4px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '11px'
            }}
          />
          <button
            onClick={handleTestSearch}
            disabled={searchLoading}
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#17a2b8',
              color: 'white',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            {searchLoading ? '⏳' : 'Search'}
          </button>
        </div>
        
        {searchError && (
          <div style={{ color: 'red', marginTop: '5px', fontSize: '10px' }}>
            Search Error: {searchError}
          </div>
        )}
        
        {results.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            {results.map((result, index) => (
              <div key={index} style={{ 
                marginBottom: '6px', 
                padding: '6px', 
                background: '#e8f4f8', 
                borderRadius: '4px',
                fontSize: '9px'
              }}>
                <strong>{result.reference}:</strong>
                <div style={{ marginTop: '2px' }}>
                  {result.text?.replace(/<[^>]*>/g, '') || 'No text'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ fontSize: '9px', color: '#666', textAlign: 'center' }}>
        Development Only - Hidden in Production
      </div>
    </div>
  );
};

export default BibleTestPanel;
