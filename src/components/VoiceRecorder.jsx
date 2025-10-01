/**
 * VoiceRecorder Component
 * Voice recording UI with 30-second limit and visual waveform feedback
 */

import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaSpinner } from 'react-icons/fa';
import voiceService from '../services/VoiceService';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onTranscriptComplete, onError, disabled = false, onMuteSound, onUnmuteSound }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformData, setWaveformData] = useState(Array(20).fill(0.1));
  const timerRef = useRef(null);
  const animationRef = useRef(null);
  const previousMuteState = useRef(null);
  const isStoppingRef = useRef(false); // Prevent duplicate stop calls
  const isRecordingRef = useRef(false); // Sync recording state (React state is async)

  const startRecording = async () => {
    if (!voiceService.isAvailable()) {
      onError?.('Voice features are not available. Please check your API key.');
      return;
    }
    
    // Prevent starting while already recording
    if (isRecording || voiceService.isRecording) {
      console.warn('Already recording');
      return;
    }

    try {
      setIsRecording(true);
      isRecordingRef.current = true; // Sync ref immediately
      setRecordingTime(0);
      isStoppingRef.current = false; // Reset stopping flag

      // Mute sound effects during voice recording
      if (onMuteSound) {
        onMuteSound();
      }

      // Start recording with visual feedback
      await voiceService.startRecording((progress) => {
        // Simulate waveform animation
        setWaveformData(prev => {
          const newData = [...prev];
          newData.shift();
          newData.push(Math.random() * 0.8 + 0.2);
          return newData;
        });
      });

      // Start timer and check if service is still recording
      timerRef.current = setInterval(() => {
        // Check if service wants to stop due to silence detection
        // Use isStoppingRef to ensure we only trigger once
        if (voiceService.shouldStopRecording() && !isStoppingRef.current) {
          console.log('🔇 Silence detected (timer), triggering stop with audio submission');
          isStoppingRef.current = true; // Prevent duplicate calls
          stopRecording();
          return;
        }
        
        setRecordingTime(prev => {
          if (prev >= 29) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

      // Animate waveform
      const animate = () => {
        // Check if service wants to stop due to silence detection
        // Use isStoppingRef to ensure we only trigger once
        if (voiceService.shouldStopRecording() && !isStoppingRef.current) {
          console.log('🔇 Silence detected (animation), triggering stop with audio submission');
          isStoppingRef.current = true; // Prevent duplicate calls
          // Service detected silence, stop and process audio
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }
          // Call stopRecording to process and submit the audio
          stopRecording();
          return;
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();

    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      isRecordingRef.current = false;
      
      // Restore sound on error
      if (onUnmuteSound) {
        onUnmuteSound();
      }
      
      onError?.('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = async () => {
    // Use ref for synchronous check (React state is async)
    const wasRecording = isRecordingRef.current;
    
    // Always clear intervals and animation frames FIRST
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Guard against duplicate calls using synchronous ref
    if (!wasRecording) {
      isStoppingRef.current = false;
      return;
    }
    
    // Now update UI state and ref
    isRecordingRef.current = false;
    setIsRecording(false);

    try {
      setIsProcessing(true);

      const audioBlob = await voiceService.stopRecording();
      
      if (!audioBlob) {
        setIsProcessing(false);
        isStoppingRef.current = false;
        if (onUnmuteSound) onUnmuteSound();
        onError?.('Recording failed - no audio captured. Please try again.');
        return;
      }
      
      if (audioBlob) {
        // Transcribe audio
        const result = await voiceService.transcribeAudio(audioBlob);
        
        // Safety check
        const safety = await voiceService.applyContentSafetyFilter(result.text);
        
        if (onTranscriptComplete) {
          // If safe, pass the transcript text; otherwise show error
          if (safety.isSafe) {
            onTranscriptComplete(result.text);
          } else {
            onError?.(`That message wasn't appropriate. Let's talk about something else!`);
            return;
          }
        }
      }

      setIsProcessing(false);
      setRecordingTime(0);
      setWaveformData(Array(20).fill(0.1));
      isStoppingRef.current = false; // Reset flag after processing

      // Restore sound effects after processing
      if (onUnmuteSound) {
        onUnmuteSound();
      }

    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsProcessing(false);
      isStoppingRef.current = false; // Reset flag on error too
      
      // Restore sound on error too
      if (onUnmuteSound) {
        onUnmuteSound();
      }
      
      onError?.('Failed to process recording. Please try again.');
    }
  };

  // Auto-start recording when component mounts
  useEffect(() => {
    startRecording();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recorder">
      {isRecording && (
        <div className="voice-recorder-active">
          <button
            className="voice-recorder-button stop"
            onClick={stopRecording}
            aria-label="Stop recording"
          >
            <FaStop className="icon" />
          </button>

          <div className="waveform-container">
            <div className="waveform">
              {waveformData.map((height, index) => (
                <div
                  key={index}
                  className="waveform-bar"
                  style={{
                    height: `${height * 100}%`,
                    animationDelay: `${index * 0.05}s`
                  }}
                />
              ))}
            </div>
          </div>

          <div className="recording-info">
            <span className="recording-indicator">
              <span className="pulse"></span>
              Recording
            </span>
            <span className="recording-time">
              {formatTime(recordingTime)} / 0:30
            </span>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="voice-recorder-processing">
          <div className="thinking-paw">🐾</div>
          <div className="thinking-dots">
            <span className="thinking-text">Daisy is thinking</span>
            <span className="dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
