/**
 * VoiceService - OpenAI Audio API integration for DaisyDog
 * Handles voice input (Whisper) and voice output (TTS)
 * 
 * Privacy: Audio processed by OpenAI with 30-day retention
 * Transcripts stored locally for 7 days with parent access
 */

import OpenAI from 'openai';
import supabaseService from './SupabaseService';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side use
});

class VoiceService {
  constructor() {
    this.isInitialized = false;
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.currentEmotion = 'HAPPY';
    this.currentMode = 'play'; // prayer, story, teaching, play
    
    this.initialize();
  }

  /**
   * Initialize voice service
   */
  async initialize() {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        console.warn('⚠️ OpenAI API key not configured. Voice features will be disabled.');
        this.isInitialized = false;
        return;
      }

      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('⚠️ Browser does not support audio recording');
        this.isInitialized = false;
        return;
      }

      this.isInitialized = true;
      console.log('✅ VoiceService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize VoiceService:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Check if voice features are available
   */
  isAvailable() {
    return this.isInitialized && !!import.meta.env.VITE_OPENAI_API_KEY;
  }

  /**
   * Start recording audio (max 30 seconds)
   */
  async startRecording(onProgress) {
    if (!this.isAvailable()) {
      throw new Error('Voice service not available');
    }

    if (this.isRecording) {
      console.warn('Already recording');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      this.audioChunks = [];

      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      });

      this.mediaRecorder.start();
      this.isRecording = true;

      // 30-second limit for child safety
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, 30000);

      // Progress callback for visual feedback
      if (onProgress) {
        const interval = setInterval(() => {
          if (!this.isRecording) {
            clearInterval(interval);
          } else {
            onProgress(this.audioChunks.length);
          }
        }, 100);
      }

      console.log('🎤 Recording started');
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Stop recording audio
   */
  async stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      return null;
    }

    return new Promise((resolve) => {
      this.mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.isRecording = false;
        
        // Stop all tracks
        if (this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }

        console.log('🎤 Recording stopped');
        resolve(audioBlob);
      });

      this.mediaRecorder.stop();
    });
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   * @param {Blob} audioBlob - Audio blob to transcribe
   * @returns {Object} { text, duration, language }
   */
  async transcribeAudio(audioBlob) {
    if (!this.isAvailable()) {
      throw new Error('Voice service not available');
    }

    try {
      console.log('🔄 Transcribing audio...');

      // Convert blob to file
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en', // Can support Spanish later
        response_format: 'json'
      });

      console.log('✅ Transcription complete:', transcription.text);

      // Save transcript to database (7-day retention)
      await this.saveTranscript(transcription.text);

      return {
        text: transcription.text,
        language: 'en',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Transcription failed:', error);
      throw error;
    }
  }

  /**
   * Generate speech from text using OpenAI TTS
   * @param {string} text - Text to convert to speech
   * @param {string} emotion - Emotion for voice modulation
   * @param {string} mode - Context mode (prayer, story, teaching, play)
   * @returns {Blob} Audio blob
   */
  async generateSpeech(text, emotion = 'HAPPY', mode = 'play') {
    if (!this.isAvailable()) {
      throw new Error('Voice service not available');
    }

    try {
      console.log('🗣️ Generating speech:', { text: text.substring(0, 50), emotion, mode });

      this.currentEmotion = emotion;
      this.currentMode = mode;

      const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova', // Young, friendly female voice
        input: text,
        speed: 0.9, // Slightly slower for comprehension
        response_format: 'mp3'
      });

      const audioBlob = await response.blob();
      console.log('✅ Speech generated');

      return audioBlob;
    } catch (error) {
      console.error('❌ Speech generation failed:', error);
      throw error;
    }
  }

  /**
   * Play generated speech
   * @param {Blob} audioBlob - Audio blob to play
   * @returns {Promise} Resolves when audio finishes playing
   */
  async playSpeech(audioBlob) {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      });

      audio.addEventListener('error', (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      });

      audio.play().catch(reject);
    });
  }

  /**
   * Save transcript to database (7-day retention)
   */
  async saveTranscript(text) {
    try {
      if (!supabaseService.isAvailable()) {
        console.warn('⚠️ Database not available, transcript not saved');
        return;
      }

      const session = supabaseService.getCurrentSession();
      if (!session) {
        console.warn('⚠️ No active session for transcript save');
        return;
      }

      const { data, error } = await supabaseService.supabase
        .from('voice_transcripts')
        .insert({
          session_id: session.id,
          transcript_text: text,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });

      if (error) throw error;
      console.log('📝 Transcript saved (7-day retention)');
      return data;
    } catch (error) {
      console.error('❌ Failed to save transcript:', error);
    }
  }

  /**
   * Apply safety filtering to transcript
   * @param {string} text - Transcript text
   * @returns {Object} { isSafe, concerns }
   */
  async applycontentSafetyFilter(text) {
    try {
      // Use existing DaisyDog safety system
      const response = await openai.chat.completions.create({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: 'You are a child safety expert. Analyze this text from a child\'s voice input for any concerning content. Respond with JSON: { "isSafe": boolean, "concerns": ["array of concerns"], "category": "age_appropriate|mild_concern|serious_concern" }'
          },
          {
            role: 'user',
            content: text
          }
        ],
        response_format: { type: 'json_object' }
      });

      const safetyResult = JSON.parse(response.choices[0].message.content);

      // Log safety event if concerns found
      if (!safetyResult.isSafe) {
        await supabaseService.logSafetyEvent(
          'voice_input_concern',
          safetyResult.category,
          safetyResult.concerns.join(', ')
        );
      }

      return safetyResult;
    } catch (error) {
      console.error('❌ Safety filter failed:', error);
      return { isSafe: true, concerns: [] }; // Fail open for now
    }
  }

  /**
   * Get contextual tone instructions for TTS
   */
  getToneForMode(mode) {
    const tones = {
      prayer: 'Speak in a reverent, peaceful, gentle tone as if praying.',
      story: 'Use an animated, expressive storytelling voice with emotion and excitement.',
      teaching: 'Speak in a patient, encouraging teaching voice, clear and supportive.',
      play: 'Use an excited, enthusiastic, playful voice full of energy!'
    };

    return tones[mode] || tones.play;
  }

  /**
   * Record and transcribe in one flow
   */
  async recordAndTranscribe(onProgress) {
    try {
      await this.startRecording(onProgress);
      
      // Wait for user to stop or 30-second timeout
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(async () => {
          if (!this.isRecording) {
            clearInterval(checkInterval);
            try {
              const audioBlob = await this.stopRecording();
              if (audioBlob) {
                const result = await this.transcribeAudio(audioBlob);
                resolve(result);
              } else {
                reject(new Error('No audio recorded'));
              }
            } catch (error) {
              reject(error);
            }
          }
        }, 100);
      });
    } catch (error) {
      console.error('❌ Record and transcribe failed:', error);
      throw error;
    }
  }

  /**
   * Voice-to-voice conversation: Record → Transcribe → AI Response → Speak
   */
  async voiceToVoiceConversation(onTranscript, onResponse, onSpeaking) {
    try {
      // Step 1: Record and transcribe
      const { text } = await this.recordAndTranscribe((progress) => {
        if (onTranscript) onTranscript({ status: 'recording', progress });
      });

      if (onTranscript) onTranscript({ status: 'complete', text });

      // Step 2: Check safety
      const safety = await this.applycontentSafetyFilter(text);
      if (!safety.isSafe) {
        if (onResponse) {
          onResponse({
            text: "I'm not sure I understand that. Let's talk about something fun!",
            safety: safety
          });
        }
        return;
      }

      // Step 3: Get AI response (passed from ChatPage)
      if (onResponse) {
        onResponse({ userInput: text, isSafe: true });
      }

      // Note: Speech generation happens in ChatPage after AI responds
      return { text, isSafe: true };
    } catch (error) {
      console.error('❌ Voice conversation failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const voiceServiceInstance = new VoiceService();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.VoiceService = voiceServiceInstance;
}

export default voiceServiceInstance;
