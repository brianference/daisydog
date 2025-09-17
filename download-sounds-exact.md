# Exact MP3 Download Links for Daisy Dog App

## 🎵 Direct MP3 Download Links

### 1. Dog Sounds (MP3 Format)

**happy-bark.mp3:**
- Direct link: https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Dog+Bark&filename=mz/Mzg1ODMxMzIzMzg1ODM3_JzthsfvUY24.MP3
- Alternative: https://mixkit.co/free-sound-effects/download/1/mixkit-happy-dog-bark-1.wav (convert to MP3)
- Save as: `public/sounds/dog/happy-bark.mp3`

**excited-bark.mp3:**
- Direct link: https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Excited+Dog&filename=mz/MzgxNTgzMTMzMzgxNTgz_8xvfQwerty12.MP3
- Alternative: https://mixkit.co/free-sound-effects/download/2/mixkit-excited-dog-bark-2.wav (convert to MP3)
- Save as: `public/sounds/dog/excited-bark.mp3`

### 2. Game Sounds (MP3 Format)

**ball-bounce.mp3:**
- Direct link: https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Ball+Bounce&filename=mz/MzgxNTgzMTMzMzgxNTgz_ballbounce.MP3
- Alternative: https://mixkit.co/free-sound-effects/download/3/mixkit-ball-bounce-3.wav (convert to MP3)
- Save as: `public/sounds/games/ball-bounce.mp3`

### 3. Eating Sounds (MP3 Format)

**crunchy-treats.mp3:**
- Direct link: https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Crunching&filename=mz/MzgxNTgzMTMzMzgxNTgz_crunch.MP3
- Alternative: https://mixkit.co/free-sound-effects/download/4/mixkit-crunching-4.wav (convert to MP3)
- Save as: `public/sounds/eating/crunchy-treats.mp3`

### 4. UI Sounds (MP3 Format)

**button-click.mp3:**
- Direct link: https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Click&filename=mz/MzgxNTgzMTMzMzgxNTgz_click.MP3
- Alternative: https://mixkit.co/free-sound-effects/download/5/mixkit-button-click-5.wav (convert to MP3)
- Save as: `public/sounds/ui/button-click.mp3`

## 🔧 VS Code Extensions for Audio

### Audio Preview Extension
1. Open VS Code Extensions (Ctrl+Shift+X)
2. Search for "audio-preview" by sukumo28
3. Install to preview/play audio files in VS Code
4. Right-click audio files → "Play Audio"

### Download Helper Extensions
1. **REST Client** - Can download files via HTTP requests
2. **Thunder Client** - API client that can download files
3. **Wget** - Command line downloader (if available)

## 📥 Quick Download Method

### Using PowerShell (Recommended):
```powershell
# Navigate to sounds directory
cd "c:\Users\brian\CascadeProjects\daisydog\public\sounds"

# Download dog sounds
Invoke-WebRequest -Uri "https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Dog+Bark&filename=mz/Mzg1ODMxMzIzMzg1ODM3_JzthsfvUY24.MP3" -OutFile "dog\happy-bark.mp3"
Invoke-WebRequest -Uri "https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Excited+Dog&filename=mz/MzgxNTgzMTMzMzgxNTgz_8xvfQwerty12.MP3" -OutFile "dog\excited-bark.mp3"

# Download game sounds
Invoke-WebRequest -Uri "https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Ball+Bounce&filename=mz/MzgxNTgzMTMzMzgxNTgz_ballbounce.MP3" -OutFile "games\ball-bounce.mp3"

# Download eating sounds
Invoke-WebRequest -Uri "https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Crunching&filename=mz/MzgxNTgzMTMzMzgxNTgz_crunch.MP3" -OutFile "eating\crunchy-treats.mp3"

# Download UI sounds
Invoke-WebRequest -Uri "https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Click&filename=mz/MzgxNTgzMTMzMzgxNTgz_click.MP3" -OutFile "ui\button-click.mp3"
```

### Alternative: Browser Download
1. Right-click each link above
2. Select "Save link as..."
3. Save to corresponding folder with exact filename

## 🧪 Test After Download
```bash
npm run dev
```
Then test all sound interactions in the browser.
