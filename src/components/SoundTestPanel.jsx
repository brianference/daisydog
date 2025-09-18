import React from 'react'
import useSoundManagerModular from '../hooks/useSoundManagerModular.js'

const SoundTestPanel = () => {
  const {
    isReady,
    isMuted,
    volumes,
    playSound,
    playEmotionSound,
    playGameSound,
    playUISound,
    playEatingSound
  } = useSoundManagerModular()

  if (!isReady) {
    return (
      <div style={{ padding: '20px', background: '#f0f0f0', margin: '10px', borderRadius: '8px' }}>
        <h3>🔊 Sound System Loading...</h3>
        <p>Initializing audio system...</p>
      </div>
    )
  }

  const testSounds = [
    { category: 'dog', name: 'happyBark', label: '🐕 Happy Bark' },
    { category: 'dog', name: 'excitedBark', label: '🐕 Excited Bark' },
    { category: 'dog', name: 'sadWhimper', label: '🐕 Sad Whimper' },
    { category: 'games', name: 'ballBounce', label: '🎾 Ball Bounce' },
    { category: 'eating', name: 'crunchyTreats', label: '🦴 Crunchy Treats' },
    { category: 'ui', name: 'buttonClick', label: '🔘 Button Click' }
  ]

  const handleTestSound = async (category, name) => {
    try {
      await playSound(category, name)
      console.log(`✅ Played sound: ${category}.${name}`)
    } catch (error) {
      console.error(`❌ Failed to play sound: ${category}.${name}`, error)
    }
  }

  const testEmotionSounds = async () => {
    const emotions = ['happy', 'excited', 'hungry', 'playfetch']
    for (const emotion of emotions) {
      await playEmotionSound(emotion)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second between sounds
    }
  }

  const testGameSounds = async () => {
    const games = [
      { action: 'fetch' },
      { action: 'tug', result: 'success' },
      { action: 'guess', result: 'correct' },
      { action: 'guess', result: 'wrong' }
    ]
    
    for (const game of games) {
      await playGameSound(game.action, game.result)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f8f9fa', 
      margin: '10px', 
      borderRadius: '12px',
      border: '2px solid #e9ecef'
    }}>
      <h3>🔊 Sound System Test Panel</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Status:</strong> {isReady ? '✅ Ready' : '❌ Not Ready'} | 
        <strong> Muted:</strong> {isMuted ? '🔇 Yes' : '🔊 No'} |
        <strong> Master Volume:</strong> {Math.round(volumes.master * 100)}%
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Individual Sound Tests:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {testSounds.map(({ category, name, label }) => (
            <button
              key={`${category}-${name}`}
              onClick={() => handleTestSound(category, name)}
              style={{
                padding: '8px 12px',
                border: 'none',
                background: '#007bff',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>System Tests:</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={testEmotionSounds}
            style={{
              padding: '10px 15px',
              border: 'none',
              background: '#28a745',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🎭 Test Emotion Sounds
          </button>
          
          <button
            onClick={testGameSounds}
            style={{
              padding: '10px 15px',
              border: 'none',
              background: '#ffc107',
              color: 'black',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🎮 Test Game Sounds
          </button>
          
          <button
            onClick={() => playEatingSound('treats')}
            style={{
              padding: '10px 15px',
              border: 'none',
              background: '#fd7e14',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🍖 Test Eating Sound
          </button>
          
          <button
            onClick={() => playUISound('click')}
            style={{
              padding: '10px 15px',
              border: 'none',
              background: '#6f42c1',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔘 Test UI Sound
          </button>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#666', marginTop: '15px' }}>
        <strong>Instructions:</strong> Click buttons to test individual sounds. Check browser console for detailed logs.
        If sounds don't play, check that your browser allows audio and volume is up.
      </div>
    </div>
  )
}

export default SoundTestPanel
