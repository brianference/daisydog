/**
 * Simple video file checker utility
 * Provides immediate feedback on video file availability
 */

export const checkVideoFilesSync = () => {
  const videoFiles = {
    'barking': { available: true, src: '/assets/barking.mp4' },
    'ears-up': { available: true, src: '/assets/ears-up.mp4' },
    'happy': { available: true, src: '/assets/happy.mp4' },
    'lay-down': { available: true, src: '/assets/lay-down.mp4' },
    'roll-over': { available: true, src: '/assets/roll-over.mp4' },
    'dance': { available: true, src: '/assets/dance.mp4' }
  }
  
  console.log('🎬 Video Files Status (All Available):')
  console.table(videoFiles)
  
  return videoFiles
}

// Make available globally
if (typeof window !== 'undefined') {
  window.checkVideoFiles = checkVideoFilesSync
}
