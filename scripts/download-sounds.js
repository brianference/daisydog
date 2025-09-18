#!/usr/bin/env node

/**
 * DaisyDog Sound Download Script
 * Downloads free sound files from various sources
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

console.log('🎵 DaisyDog Sound Download Script')
console.log('==================================\n')

// Sound file URLs (using free, royalty-free sources)
const soundUrls = {
  'public/sounds/dog/happy-bark.mp3': 'https://www.soundjay.com/misc/sounds-1/dog-barking-1.mp3',
  'public/sounds/dog/excited-bark.mp3': 'https://www.soundjay.com/misc/sounds-1/dog-barking-2.mp3',
  'public/sounds/games/ball-bounce.mp3': 'https://www.soundjay.com/misc/sounds-1/ball-bounce-1.mp3',
  'public/sounds/eating/crunchy-treats.mp3': 'https://www.soundjay.com/misc/sounds-1/eating-chips-1.mp3',
  'public/sounds/ui/button-click.mp3': 'https://www.soundjay.com/misc/sounds-1/button-click-1.mp3'
}

// Alternative URLs if primary fails
const alternativeUrls = {
  'public/sounds/dog/happy-bark.mp3': 'https://orangefreesounds.com/wp-content/uploads/2019/04/Dog-barking-sound.mp3',
  'public/sounds/dog/excited-bark.mp3': 'https://orangefreesounds.com/wp-content/uploads/2019/04/Small-dog-barking.mp3',
  'public/sounds/games/ball-bounce.mp3': 'https://orangefreesounds.com/wp-content/uploads/2018/04/Ball-bouncing-sound-effect.mp3',
  'public/sounds/eating/crunchy-treats.mp3': 'https://orangefreesounds.com/wp-content/uploads/2020/02/Crunching-sound-effect.mp3',
  'public/sounds/ui/button-click.mp3': 'https://orangefreesounds.com/wp-content/uploads/2018/12/Button-click-sound-effect.mp3'
}

async function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(projectRoot, filePath)
    const dir = path.dirname(fullPath)
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    const file = fs.createWriteStream(fullPath)
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve(fullPath)
        })
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
      }
    }).on('error', (error) => {
      reject(error)
    })
  })
}

async function downloadAllSounds() {
  console.log('📥 Starting sound file downloads...\n')
  
  for (const [filePath, url] of Object.entries(soundUrls)) {
    try {
      console.log(`Downloading: ${path.basename(filePath)}`)
      console.log(`From: ${url}`)
      
      await downloadFile(url, filePath)
      console.log(`✅ Downloaded: ${filePath}\n`)
      
    } catch (error) {
      console.log(`❌ Failed to download from primary source: ${error.message}`)
      
      // Try alternative URL
      const altUrl = alternativeUrls[filePath]
      if (altUrl) {
        try {
          console.log(`Trying alternative: ${altUrl}`)
          await downloadFile(altUrl, filePath)
          console.log(`✅ Downloaded from alternative: ${filePath}\n`)
        } catch (altError) {
          console.log(`❌ Alternative also failed: ${altError.message}`)
          console.log(`⚠️  You'll need to manually download: ${path.basename(filePath)}\n`)
        }
      } else {
        console.log(`⚠️  No alternative URL available for: ${path.basename(filePath)}\n`)
      }
    }
  }
  
  console.log('🎉 Sound download process complete!')
  console.log('\n📋 Next Steps:')
  console.log('1. Check that all MP3 files are in their correct folders')
  console.log('2. Test sounds by running: npm run dev')
  console.log('3. Open browser console to check for any loading errors')
  console.log('4. Test mute/volume controls in the chat interface')
}

// Manual download instructions
function showManualInstructions() {
  console.log('\n📖 Manual Download Instructions:')
  console.log('================================')
  console.log('If automatic download fails, manually download from these sources:\n')
  
  console.log('🐕 Dog Sounds:')
  console.log('- Visit: https://mixkit.co/free-sound-effects/dog/')
  console.log('- Download "Happy puppy barks" → save as happy-bark.mp3')
  console.log('- Download "Dog barking twice" → save as excited-bark.mp3\n')
  
  console.log('🎮 Game Sounds:')
  console.log('- Visit: https://mixkit.co/free-sound-effects/game/')
  console.log('- Search "bounce" → save as ball-bounce.mp3\n')
  
  console.log('🍖 Eating Sounds:')
  console.log('- Visit: https://mixkit.co/free-sound-effects/')
  console.log('- Search "crunch" → save as crunchy-treats.mp3\n')
  
  console.log('🖱️ UI Sounds:')
  console.log('- Visit: https://mixkit.co/free-sound-effects/game/')
  console.log('- Search "click" → save as button-click.mp3\n')
  
  console.log('💡 Tips:')
  console.log('- All files should be MP3 format')
  console.log('- Keep files under 100KB each')
  console.log('- 1-2 seconds duration maximum')
  console.log('- Place in exact folder structure shown above')
}

// Run the download process
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadAllSounds().catch(error => {
    console.error('Download process failed:', error)
    showManualInstructions()
  })
}