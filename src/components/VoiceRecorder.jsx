/**
 * VoiceRecorder Component
 * Voice recording UI with 30-second limit and visual waveform feedback
 */

import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaSpinner } from 'react-icons/fa';
import voiceService from '../services/VoiceService';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onTranscriptComplete, onError, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformData, setWaveformData] = useState(Array(20).fill(0.1));
  const timerRef = useRef(null);
  const animationRef = useRef(null);

  const startRecording = async () => {
    if (!voiceService.isAvailable()) {
      onError?.('Voice features are not available. Please check your API key.');
      return;
    }

    try {
      setIsRecording(true);
      setRecordingTime(0);

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

      // Start timer
      timerRef.current = setInterval(() => {
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
        if (voiceService.isRecording) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animate();

    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      onError?.('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const audioBlob = await voiceService.stopRecording();
      
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

    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsProcessing(false);
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
          <FaSpinner className="spinner" />
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
