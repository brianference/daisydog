/**
 * DaisyVoice Component
 * Handles Daisy's voice responses with contextual tones and emotions
 */

import React, { useState, useEffect, useRef } from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import voiceService from '../services/VoiceService';
import './DaisyVoice.css';

const DaisyVoice = ({ 
  text, 
  emotion = 'HAPPY', 
  mode = 'play',
  autoPlay = false,
  onComplete,
  showControls = true 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const audioBlobRef = useRef(null);

  useEffect(() => {
    if (autoPlay && text) {
      playVoice();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioBlobRef.current) {
        URL.revokeObjectURL(audioBlobRef.current);
      }
    };
  }, [text, autoPlay]);

  const playVoice = async () => {
    if (!voiceService.isAvailable()) {
      setError('Voice features not available');
      return;
    }

    if (!text || text.trim().length === 0) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Generate speech with contextual tone
      const audioBlob = await voiceService.generateSpeech(text, emotion, mode);
      
      // Create audio element and play
      const audioUrl = URL.createObjectURL(audioBlob);
      audioBlobRef.current = audioUrl;
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('play', () => {
        setIsPlaying(true);
        setIsLoading(false);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        if (onComplete) onComplete();
      });

      audio.addEventListener('error', (e) => {
        setIsPlaying(false);
        setIsLoading(false);
        setError('Failed to play audio');
        console.error('Audio playback error:', e);
      });

      await audio.play();

    } catch (err) {
      console.error('Voice generation failed:', err);
      setError('Failed to generate voice');
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const stopVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'prayer':
        return '🙏';
      case 'story':
        return '📖';
      case 'teaching':
        return '📚';
      case 'play':
      default:
        return '🐕';
    }
  };

  if (!showControls) {
    return null;
  }

  return (
    <div className="daisy-voice">
      {error && (
        <div className="daisy-voice-error">
          <span>{error}</span>
        </div>
      )}

      {!error && (
        <button
          className={`daisy-voice-button ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
          onClick={isPlaying ? stopVoice : playVoice}
          disabled={isLoading || !text}
          aria-label={isPlaying ? 'Stop Daisy\'s voice' : 'Hear Daisy speak'}
          title={isPlaying ? 'Stop' : 'Hear Daisy speak'}
        >
          {isLoading ? (
            <div className="loading-spinner" />
          ) : isPlaying ? (
            <FaVolumeMute className="icon" />
          ) : (
            <FaVolumeUp className="icon" />
          )}
          
          <span className="mode-indicator">{getModeIcon()}</span>
        </button>
      )}

      {isPlaying && (
        <div className="voice-visualizer">
          <div className="voice-wave">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DaisyVoice;
