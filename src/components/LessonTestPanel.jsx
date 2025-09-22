import React, { useState } from 'react';
import { 
  catholicCurriculum, 
  containsCurriculumKeywords, 
  getCurriculumResponse,
  containsLessonKeywords,
  getLessonResponse,
  findCurriculumGrade,
  containsBibleTopicKeywords,
  getBibleTopicResponse,
  bibleTopics
} from '../data/catholicCurriculum';

const LessonTestPanel = () => {
  const [testResults, setTestResults] = useState([]);
  const [customTest, setCustomTest] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test, result, status = 'info') => {
    setTestResults(prev => [...prev, { 
      test, 
      result: typeof result === 'object' ? JSON.stringify(result, null, 2) : result, 
      status,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTest = async (testName, testFunction) => {
    try {
      setIsLoading(true);
      addResult(testName, 'Running...', 'loading');
      const result = await testFunction();
      addResult(testName, result || 'No result', result ? 'success' : 'error');
    } catch (error) {
      addResult(testName, `Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testTenCommandments = async () => {
    const testMessages = [
      'tell me the full 10 commandments',
      'what are the 10 commandments',
      'show me the ten commandments',
      'ten commandments',
      'full ten commandments'
    ];

    for (const message of testMessages) {
      addResult(`Ten Commandments Detection: "${message}"`, 'Testing...', 'loading');
      
      // Test keyword detection
      const topicDetected = containsBibleTopicKeywords(message);
      addResult(`  → Topic Detected`, topicDetected || 'NONE', topicDetected ? 'success' : 'error');
      
      // Test response generation
      if (topicDetected) {
        try {
          const response = await getBibleTopicResponse(message);
          addResult(`  → Response Generated`, response ? 'SUCCESS' : 'FAILED', response ? 'success' : 'error');
          if (response) {
            addResult(`  → Response Preview`, response.substring(0, 100) + '...', 'info');
          }
        } catch (error) {
          addResult(`  → Response Error`, error.message, 'error');
        }
      }
    }
  };

  const testLessonDetection = async () => {
    const testMessages = [
      'Grade 1 lesson 1',
      'Grade 1 lesson 2',
      'Grade 2 lesson 1',
      'Kindergarten lesson 1',
      'what is the first lesson',
      'lesson 2'
    ];

    for (const message of testMessages) {
      addResult(`Lesson Detection: "${message}"`, 'Testing...', 'loading');
      
      // Test lesson keyword detection
      const lessonDetected = containsLessonKeywords(message);
      addResult(`  → Lesson Keywords`, lessonDetected ? 'DETECTED' : 'NOT DETECTED', lessonDetected ? 'success' : 'error');
      
      // Test grade detection
      const grade = findCurriculumGrade(message);
      addResult(`  → Grade Detected`, grade ? grade.grade : 'NONE', grade ? 'success' : 'error');
      
      // Test lesson response
      if (lessonDetected && grade) {
        try {
          const response = await getLessonResponse(message, grade);
          addResult(`  → Lesson Response`, response ? 'SUCCESS' : 'FAILED', response ? 'success' : 'error');
        } catch (error) {
          addResult(`  → Lesson Error`, error.message, 'error');
        }
      }
    }
  };

  const testCurriculumDetection = async () => {
    const testMessages = [
      'Teach me Kindergarten faith',
      'Teach me Grade 1 faith',
      'Teach me Grade 2 faith'
    ];

    for (const message of testMessages) {
      addResult(`Curriculum Detection: "${message}"`, 'Testing...', 'loading');
      
      // Test curriculum keyword detection
      const curriculumDetected = containsCurriculumKeywords(message);
      addResult(`  → Curriculum Keywords`, curriculumDetected ? 'DETECTED' : 'NOT DETECTED', curriculumDetected ? 'success' : 'error');
      
      // Test curriculum response
      if (curriculumDetected) {
        try {
          const response = await getCurriculumResponse(message);
          addResult(`  → Curriculum Response`, response ? 'SUCCESS' : 'FAILED', response ? 'success' : 'error');
        } catch (error) {
          addResult(`  → Curriculum Error`, error.message, 'error');
        }
      }
    }
  };

  const testCustomMessage = async () => {
    if (!customTest.trim()) return;
    
    addResult(`Custom Test: "${customTest}"`, 'Testing all systems...', 'loading');
    
    // Test all detection systems
    const curriculumDetected = containsCurriculumKeywords(customTest);
    const lessonDetected = containsLessonKeywords(customTest);
    const topicDetected = containsBibleTopicKeywords(customTest);
    const grade = findCurriculumGrade(customTest);
    
    addResult(`  → Curriculum Keywords`, curriculumDetected ? 'YES' : 'NO', curriculumDetected ? 'success' : 'info');
    addResult(`  → Lesson Keywords`, lessonDetected ? 'YES' : 'NO', lessonDetected ? 'success' : 'info');
    addResult(`  → Bible Topic Keywords`, topicDetected || 'NO', topicDetected ? 'success' : 'info');
    addResult(`  → Grade Detected`, grade ? grade.grade : 'NO', grade ? 'success' : 'info');
  };

  const inspectTenCommandmentsData = () => {
    addResult('Ten Commandments Data Inspection', 'Inspecting...', 'loading');
    
    if (bibleTopics.tenCommandments) {
      addResult('  → Ten Commandments Object', 'EXISTS', 'success');
      addResult('  → Keywords', bibleTopics.tenCommandments.keywords.join(', '), 'info');
      addResult('  → Full Text Length', bibleTopics.tenCommandments.fullText ? bibleTopics.tenCommandments.fullText.length : 'NO FULLTEXT', bibleTopics.tenCommandments.fullText ? 'success' : 'error');
      addResult('  → Responses Length', bibleTopics.tenCommandments.responses.length, 'info');
    } else {
      addResult('  → Ten Commandments Object', 'MISSING!', 'error');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      width: '400px', 
      maxHeight: '80vh', 
      backgroundColor: 'white', 
      border: '2px solid #ccc', 
      borderRadius: '8px', 
      padding: '15px',
      zIndex: 1000,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📚 Lesson Test Panel</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button onClick={() => runTest('Ten Commandments', testTenCommandments)} disabled={isLoading} style={{ margin: '2px', padding: '5px 10px', fontSize: '12px' }}>
          Test Ten Commandments
        </button>
        <button onClick={() => runTest('Lesson Detection', testLessonDetection)} disabled={isLoading} style={{ margin: '2px', padding: '5px 10px', fontSize: '12px' }}>
          Test Lessons
        </button>
        <button onClick={() => runTest('Curriculum', testCurriculumDetection)} disabled={isLoading} style={{ margin: '2px', padding: '5px 10px', fontSize: '12px' }}>
          Test Curriculum
        </button>
        <button onClick={inspectTenCommandmentsData} style={{ margin: '2px', padding: '5px 10px', fontSize: '12px' }}>
          Inspect Data
        </button>
        <button onClick={clearResults} style={{ margin: '2px', padding: '5px 10px', fontSize: '12px', backgroundColor: '#ff6b35', color: 'white' }}>
          Clear
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          value={customTest}
          onChange={(e) => setCustomTest(e.target.value)}
          placeholder="Enter custom test message"
          style={{ width: '100%', padding: '5px', marginBottom: '5px' }}
        />
        <button onClick={testCustomMessage} disabled={!customTest.trim()} style={{ padding: '5px 10px', fontSize: '12px' }}>
          Test Custom Message
        </button>
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        border: '1px solid #ddd', 
        padding: '10px', 
        backgroundColor: '#f9f9f9',
        fontSize: '11px'
      }}>
        {testResults.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No tests run yet. Click a test button above.</p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} style={{ 
              marginBottom: '8px', 
              padding: '5px',
              backgroundColor: result.status === 'success' ? '#d4edda' : 
                             result.status === 'error' ? '#f8d7da' : 
                             result.status === 'loading' ? '#fff3cd' : '#e2e3e5',
              borderRadius: '3px',
              fontSize: '10px'
            }}>
              <strong>{result.test}</strong> <span style={{ color: '#666' }}>({result.timestamp})</span>
              <div style={{ marginTop: '3px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {result.result}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LessonTestPanel;
