class MusicService {
  constructor() {
    this.audio = null;
    this.currentTrack = null;
    this.isPlaying = false;
    this.volume = 0.3; // 30% volume for background music
    this.isMuted = false;
    
    this.tracks = [
      '/sounds/music/song1.mp3',
      '/sounds/music/song2.mp3',
      '/sounds/music/song3.mp3',
      '/sounds/music/song4.mp3'
    ];
  }

  selectRandomTrack() {
    const randomIndex = Math.floor(Math.random() * this.tracks.length);
    return this.tracks[randomIndex];
  }

  play(trackPath = null) {
    try {
      if (this.isMuted) return;

      if (this.isPlaying && this.audio) {
        console.log('🎵 Music already playing, skipping restart');
        return this.audio;
      }

      if (this.audio) {
        this.stop();
      }

      const selectedTrack = trackPath || this.selectRandomTrack();
      this.currentTrack = selectedTrack;

      this.audio = new Audio(selectedTrack);
      this.audio.volume = this.volume;
      this.audio.loop = true;

      this.audio.play()
        .then(() => {
          this.isPlaying = true;
          console.log(`🎵 Playing music: ${selectedTrack}`);
        })
        .catch(error => {
          console.warn('Music playback failed:', error);
          this.isPlaying = false;
        });

      this.audio.addEventListener('ended', () => {
        if (this.audio && this.audio.loop) {
          this.audio.currentTime = 0;
          this.audio.play().catch(err => console.warn('Loop failed:', err));
        }
      });

      return this.audio;
    } catch (error) {
      console.error('Failed to play music:', error);
      return null;
    }
  }

  pause() {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      console.log('⏸️ Music paused');
    }
  }

  resume() {
    if (this.audio && !this.isPlaying && !this.isMuted) {
      this.audio.play()
        .then(() => {
          this.isPlaying = true;
          console.log('▶️ Music resumed');
        })
        .catch(error => console.warn('Resume failed:', error));
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
      this.isPlaying = false;
      this.currentTrack = null;
      console.log('⏹️ Music stopped');
    }
  }

  setVolume(newVolume) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  mute() {
    this.isMuted = true;
    if (this.audio) {
      this.audio.volume = 0;
    }
    console.log('🔇 Music muted');
  }

  unmute() {
    this.isMuted = false;
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    console.log('🔊 Music unmuted');
  }

  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.isMuted;
  }

  getStatus() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume,
      currentTrack: this.currentTrack,
      availableTracks: this.tracks.length
    };
  }
}

const musicServiceInstance = new MusicService();
export default musicServiceInstance;
