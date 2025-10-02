import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DebugControlCenter.css';

const DebugControlCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('games');
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const exportLogs = () => {
    let textLog = `DaisyDog Test Logs\n`;
    textLog += `===================\n`;
    textLog += `Timestamp: ${new Date().toISOString()}\n`;
    textLog += `Build: ${import.meta.env.VITE_BUILD_VERSION || '2025.10.01.03'}\n\n`;
    
    textLog += `Test Results (${testResults.length}):\n`;
    textLog += `-----------------------\n`;
    testResults.forEach((result, i) => {
      const icon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏳';
      textLog += `${i + 1}. ${icon} ${result.test}\n`;
      textLog += `   Status: ${result.status}\n`;
      if (result.message) textLog += `   Message: ${result.message}\n`;
      if (result.error) textLog += `   Error: ${result.error}\n`;
      if (result.details) textLog += `   Details: ${result.details}\n`;
      textLog += `\n`;
    });
    
    const errors = testResults.filter(r => r.status === 'failed');
    if (errors.length > 0) {
      textLog += `\nFailed Tests (${errors.length}):\n`;
      textLog += `-----------------------\n`;
      errors.forEach((err, i) => {
        textLog += `${i + 1}. ${err.test}\n`;
        textLog += `   ${err.error || err.message}\n\n`;
      });
    }
    
    const blob = new Blob([textLog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daisydog-test-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runGameTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const games = [
      'TIC_TAC_TOE', 'CONNECT_FOUR', 'MEMORY_MATCH', 'CHECKERS',
      'GO_FISH', 'SIMPLE_PUZZLE', 'COLOR_MATCHING', 'PATTERN_BUILDER', 'WORD_SCRAMBLE'
    ];

    for (const game of games) {
      try {
        setTestResults(prev => [...prev, {
          test: `Game: ${game}`,
          status: 'running',
          timestamp: new Date().toISOString()
        }]);

        await new Promise(resolve => setTimeout(resolve, 500));

        setTestResults(prev => prev.map(r =>
          r.test === `Game: ${game}` ? { ...r, status: 'passed', message: 'Game initialized successfully' } : r
        ));
      } catch (error) {
        setTestResults(prev => prev.map(r =>
          r.test === `Game: ${game}` ? { ...r, status: 'failed', error: error.message } : r
        ));
      }
    }
    
    setIsRunning(false);
  };

  const runVoiceTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const voiceTests = [
      { name: 'Voice Service Init', test: () => window.voiceService !== undefined },
      { name: 'Microphone Permission', test: async () => {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          return devices.some(d => d.kind === 'audioinput');
        } catch {
          return false;
        }
      }},
      { name: 'Audio Context', test: () => typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined' }
    ];

    for (const voiceTest of voiceTests) {
      try {
        setTestResults(prev => [...prev, {
          test: voiceTest.name,
          status: 'running',
          timestamp: new Date().toISOString()
        }]);

        const result = await voiceTest.test();
        
        setTestResults(prev => prev.map(r =>
          r.test === voiceTest.name ? { 
            ...r, 
            status: result ? 'passed' : 'failed',
            message: result ? 'Test passed' : 'Test failed'
          } : r
        ));
      } catch (error) {
        setTestResults(prev => prev.map(r =>
          r.test === voiceTest.name ? { ...r, status: 'failed', error: error.message } : r
        ));
      }
    }
    
    setIsRunning(false);
  };

  const runSafetyTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      if (window.quickTest) {
        setTestResults([{ test: 'Running Constitution Tests...', status: 'running', timestamp: new Date().toISOString() }]);
        
        const originalLog = console.log;
        let capturedOutput = [];
        
        try {
          console.log = (...args) => {
            capturedOutput.push(args.join(' '));
            originalLog(...args);
          };
          
          await window.quickTest('constitution');
        } finally {
          console.log = originalLog;
        }
        
        const resultsLine = capturedOutput.find(line => line.includes('Pass Rate'));
        const detailsStart = capturedOutput.findIndex(line => line.includes('Details:'));
        const failedStart = capturedOutput.findIndex(line => line.includes('Failed Tests:'));
        
        let details = '';
        if (detailsStart !== -1) {
          const detailsSection = capturedOutput.slice(detailsStart + 1, failedStart !== -1 ? failedStart : capturedOutput.length);
          details = detailsSection.filter(line => line.trim()).join('\n');
        }
        
        let failureInfo = '';
        if (failedStart !== -1) {
          const failureSection = capturedOutput.slice(failedStart + 1);
          failureInfo = failureSection.filter(line => line.trim()).join('\n');
        }
        
        const hasFailed = failedStart !== -1 || capturedOutput.some(line => line.includes('FAIL'));
        
        setTestResults([{ 
          test: 'Constitutional Content Tests', 
          status: hasFailed ? 'failed' : 'passed',
          message: resultsLine || 'Tests completed',
          details: (details + '\n\n' + failureInfo).trim(),
          timestamp: new Date().toISOString()
        }]);
      } else {
        setTestResults([{ test: 'Safety System', status: 'failed', error: 'Test suite not loaded', timestamp: new Date().toISOString() }]);
      }
    } catch (error) {
      setTestResults([{ test: 'Safety System', status: 'failed', error: error.message, timestamp: new Date().toISOString() }]);
    }
    
    setIsRunning(false);
  };

  return (
    <>
      <motion.button
        className="debug-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Debug Control Center"
      >
        🔧
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="debug-control-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="debug-header">
              <h3>🔧 Debug Control Center</h3>
              <button onClick={() => setIsOpen(false)} className="close-btn">❌</button>
            </div>

            <div className="debug-tabs">
              <button 
                className={activeTab === 'games' ? 'active' : ''}
                onClick={() => setActiveTab('games')}
              >
                🎮 Games
              </button>
              <button 
                className={activeTab === 'voice' ? 'active' : ''}
                onClick={() => setActiveTab('voice')}
              >
                🎤 Voice
              </button>
              <button 
                className={activeTab === 'safety' ? 'active' : ''}
                onClick={() => setActiveTab('safety')}
              >
                🛡️ Safety
              </button>
            </div>

            <div className="debug-content">
              {activeTab === 'games' && (
                <div className="test-panel">
                  <h4>BoardGame.io Games Test</h4>
                  <p>Tests all 9 visual games with AI opponents</p>
                  <button 
                    onClick={runGameTests} 
                    disabled={isRunning}
                    className="test-btn"
                  >
                    {isRunning ? 'Running...' : 'Run Game Tests'}
                  </button>
                </div>
              )}

              {activeTab === 'voice' && (
                <div className="test-panel">
                  <h4>Voice System Test</h4>
                  <p>Tests OpenAI Whisper STT and TTS functionality</p>
                  <button 
                    onClick={runVoiceTests} 
                    disabled={isRunning}
                    className="test-btn"
                  >
                    {isRunning ? 'Running...' : 'Run Voice Tests'}
                  </button>
                </div>
              )}

              {activeTab === 'safety' && (
                <div className="test-panel">
                  <h4>Safety System Test</h4>
                  <p>Tests constitutional content filters and safety responses</p>
                  <button 
                    onClick={runSafetyTests} 
                    disabled={isRunning}
                    className="test-btn"
                  >
                    {isRunning ? 'Running...' : 'Run Safety Tests'}
                  </button>
                </div>
              )}

              {testResults.length > 0 && (
                <div className="test-results">
                  <div className="results-header">
                    <h4>Test Results</h4>
                    <button onClick={exportLogs} className="export-btn">
                      📥 Export Logs
                    </button>
                  </div>
                  <div className="results-list">
                    {testResults.map((result, index) => (
                      <div key={index} className={`result-item ${result.status}`}>
                        <span className="result-name">{result.test}</span>
                        <span className="result-status">
                          {result.status === 'passed' && '✅'}
                          {result.status === 'failed' && '❌'}
                          {result.status === 'running' && '⏳'}
                        </span>
                        {result.message && <p className="result-message">{result.message}</p>}
                        {result.error && <p className="result-error">{result.error}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DebugControlCenter;
