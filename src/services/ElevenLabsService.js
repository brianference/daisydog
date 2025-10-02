class ElevenLabsService {
  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.soundCache = new Map();
    this.volume = 0.7; // 70% volume for sound effects
    this.isMuted = false;
    
    this.soundDefinitions = {
      buttonClick: {
        prompt: 'soft button click sound cheerful child-friendly',
        duration: 0.5
      },
      success: {
        prompt: 'success chime for children bright happy',
        duration: 1
      },
      cardFlip: {
        prompt: 'card flip sound gentle whoosh',
        duration: 0.5
      },
      match: {
        prompt: 'match found success bell child-friendly',
        duration: 1
      },
      victory: {
        prompt: 'victory fanfare children cheerful celebration',
        duration: 2
      },
      incorrect: {
        prompt: 'gentle wrong answer buzzer soft child-friendly',
        duration: 1
      },
      daisyBark: {
        prompt: 'happy cavalier spaniel bark cheerful friendly',
        duration: 1
      },
      notification: {
        prompt: 'notification bell soft child-friendly',
        duration: 0.5
      }
    };

    console.log('🔊 ElevenLabsService initialized');
  }

  async generateSound(soundType) {
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not configured');
      return null;
    }

    const soundDef = this.soundDefinitions[soundType];
    if (!soundDef) {
      console.warn(`Unknown sound type: ${soundType}`);
      return null;
    }

    if (this.soundCache.has(soundType)) {
      return this.soundCache.get(soundType);
    }

    try {
      const response = await fetch(`${this.baseUrl}/sound-generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: soundDef.prompt,
          duration_seconds: soundDef.duration,
          prompt_influence: 0.8
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.audio_base64) {
        const audioBlob = this.base64ToBlob(data.audio_base64, 'audio/mpeg');
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (this.soundCache.has(soundType)) {
          const oldUrl = this.soundCache.get(soundType);
          URL.revokeObjectURL(oldUrl);
        }
        
        this.soundCache.set(soundType, audioUrl);
        console.log(`✅ Generated sound: ${soundType}`);
        
        return audioUrl;
      }

      return null;
    } catch (error) {
      console.error(`Failed to generate sound ${soundType}:`, error);
      return null;
    }
  }

  base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  }

  async playSound(soundType) {
    if (this.isMuted) return;

    try {
      let soundUrl = this.soundCache.get(soundType);
      
      if (!soundUrl) {
        soundUrl = await this.generateSound(soundType);
        if (!soundUrl) return;
      }

      const audio = new Audio(soundUrl);
      audio.volume = this.volume;
      
      await audio.play();
      
    } catch (error) {
      console.warn(`Failed to play sound ${soundType}:`, error);
    }
  }

  preloadSounds(soundTypes = []) {
    if (!this.apiKey) {
      console.warn('Cannot preload sounds: API key not configured');
      return;
    }

    const types = soundTypes.length > 0 
      ? soundTypes 
      : Object.keys(this.soundDefinitions);

    console.log(`🔄 Preloading ${types.length} sound effects...`);

    types.forEach(soundType => {
      this.generateSound(soundType);
    });
  }

  setVolume(newVolume) {
    this.volume = Math.max(0, Math.min(1, newVolume));
  }

  mute() {
    this.isMuted = true;
    console.log('🔇 Sound effects muted');
  }

  unmute() {
    this.isMuted = false;
    console.log('🔊 Sound effects unmuted');
  }

  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.isMuted;
  }

  clearCache() {
    this.soundCache.forEach(url => URL.revokeObjectURL(url));
    this.soundCache.clear();
    console.log('🗑️ Sound cache cleared');
  }

  getStatus() {
    return {
      apiKeyConfigured: !!this.apiKey,
      cachedSounds: Array.from(this.soundCache.keys()),
      cacheSize: this.soundCache.size,
      isMuted: this.isMuted,
      volume: this.volume
    };
  }
}

const elevenLabsServiceInstance = new ElevenLabsService();
export default elevenLabsServiceInstance;
