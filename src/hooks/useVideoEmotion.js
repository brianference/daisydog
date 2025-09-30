/**
 * useVideoEmotion - Hook for analyzing responses and mapping to video emotions
 * Integrates with existing safety system and emotion detection
 * Follows existing DaisyDog patterns for seamless integration
 */

import { useState, useCallback, useMemo } from 'react'

const useVideoEmotion = () => {
  const [lastAnalysis, setLastAnalysis] = useState(null)

  /**
   * Emotion mapping configuration - Comprehensive video system
   */
  const emotionMapping = useMemo(() => ({
    // BARKING VIDEO - safety, alerts, protective, warning situations
    safety: {
      keywords: [
        // Drugs & substances
        'drug', 'drugs', 'alcohol', 'smoking', 'cigarette', 'vape', 'marijuana', 'weed', 'pills', 'medicine',
        // Violence & danger
        'hurt', 'pain', 'fight', 'hit', 'punch', 'kick', 'violence', 'weapon', 'gun', 'knife', 'blood',
        // Emergencies
        'emergency', 'help', 'danger', 'unsafe', 'scared', 'afraid', 'terrified', 'panic', 'call 911',
        // Inappropriate content
        'sex', 'naked', 'private parts', 'inappropriate', 'adult', 'mature', 'explicit',
        // Bullying & threats
        'bully', 'threat', 'mean', 'cruel', 'hate', 'kill', 'die', 'suicide', 'self-harm',
        // Stranger danger
        'stranger', 'unknown person', 'follow me', 'come with me', 'secret', 'don\'t tell',
        // Online safety
        'password', 'personal information', 'address', 'phone number', 'meet in person',
        // General warnings
        'warning', 'stop', 'no', 'bad', 'wrong', 'dangerous', 'risky', 'careful', 'watch out'
      ],
      videoEmotion: 'barking',
      priority: 'high'
    },

    // EARS-UP VIDEO - Curious, learning, educational, attentive situations
    curious: {
      keywords: [
        // Learning & education
        'learn', 'teach', 'explain', 'understand', 'study', 'school', 'homework', 'lesson', 'class',
        // Questions & inquiry
        'how', 'what', 'why', 'when', 'where', 'who', 'which', 'question', 'wonder', 'curious', 'ask',
        // Bible & religious education
        'bible', 'jesus', 'god', 'prayer', 'church', 'christian', 'faith', 'believe', 'holy', 'scripture',
        'verse', 'psalm', 'commandment', 'parable', 'miracle', 'angel', 'heaven', 'blessing',
        // Academic subjects
        'math', 'science', 'history', 'reading', 'writing', 'art', 'music', 'geography', 'nature',
        // Thinking & pondering
        'think', 'consider', 'ponder', 'reflect', 'contemplate', 'analyze', 'examine', 'explore',
        // Information seeking
        'tell me about', 'information', 'facts', 'details', 'knowledge', 'wisdom', 'insight',
        // Problem solving
        'solve', 'figure out', 'work out', 'calculate', 'determine', 'find out', 'discover'
      ],
      videoEmotion: 'ears-up',
      priority: 'medium'
    },

    // HAPPY VIDEO - Joy, excitement, fun, positive situations
    positive: {
      keywords: [
        // Emotions & feelings
        'happy', 'joy', 'excited', 'thrilled', 'delighted', 'cheerful', 'glad', 'pleased', 'content',
        'amazing', 'wonderful', 'fantastic', 'awesome', 'great', 'excellent', 'perfect', 'brilliant',
        // Fun & entertainment
        'fun', 'funny', 'hilarious', 'joke', 'laugh', 'giggle', 'smile', 'grin', 'chuckle',
        'entertainment', 'amusing', 'silly', 'playful', 'whimsical', 'delightful',
        // Play & games
        'play', 'game', 'toy', 'puzzle', 'quiz', 'challenge', 'competition', 'win', 'victory',
        'score', 'level', 'achievement', 'success', 'accomplish', 'complete',
        // Social & relationships
        'friend', 'friendship', 'love', 'care', 'kind', 'nice', 'sweet', 'gentle', 'warm',
        'hug', 'cuddle', 'snuggle', 'comfort', 'support', 'encourage',
        // Celebrations
        'birthday', 'party', 'celebrate', 'festival', 'holiday', 'christmas', 'easter', 'thanksgiving',
        'gift', 'present', 'surprise', 'special', 'occasion', 'event',
        // Activities
        'dance', 'sing', 'music', 'song', 'melody', 'rhythm', 'beat', 'tune',
        'adventure', 'explore', 'journey', 'trip', 'vacation', 'outing',
        // Food & treats
        'treat', 'snack', 'cookie', 'cake', 'ice cream', 'candy', 'sweet', 'delicious', 'yummy',
        // Animals & pets
        'puppy', 'dog', 'cat', 'kitten', 'pet', 'animal', 'cute', 'adorable', 'fluffy',
        // Nature & outdoors
        'sunshine', 'rainbow', 'flowers', 'garden', 'park', 'playground', 'outside', 'fresh air'
      ],
      videoEmotion: 'happy',
      priority: 'medium'
    },

    // Additional context-specific mappings
    games: {
      keywords: [
        'tic tac toe', 'memory game', 'word game', 'riddle', 'brain teaser', 'trivia',
        'hide and seek', 'tag', 'catch', 'fetch', 'ball', 'frisbee', 'jump rope',
        'board game', 'card game', 'video game', 'computer game', 'mobile game',
        'sport', 'soccer', 'basketball', 'baseball', 'tennis', 'swimming'
      ],
      videoEmotion: 'happy',
      priority: 'medium'
    },

    // LAY-DOWN VIDEO - Calm, relaxed, peaceful, resting situations
    calm: {
      keywords: [
        'calm', 'relax', 'peaceful', 'quiet', 'rest', 'sleep', 'nap', 'tired', 'sleepy',
        'comfortable', 'cozy', 'soft', 'gentle', 'soothing', 'tranquil', 'serene',
        'meditation', 'breathe', 'slow down', 'take a break', 'pause', 'stillness',
        'bedtime', 'lullaby', 'dream', 'pillow', 'blanket', 'snuggle up'
      ],
      videoEmotion: 'lay-down',
      priority: 'low'
    },

    // ROLL-OVER VIDEO - Playful tricks, silly, entertaining situations
    tricks: {
      keywords: [
        'trick', 'roll over', 'flip', 'tumble', 'acrobat', 'gymnastics', 'somersault',
        'silly', 'goofy', 'funny trick', 'show off', 'perform', 'demonstration',
        'upside down', 'backwards', 'spin', 'twirl', 'rotate', 'turn around',
        'entertaining', 'performance', 'show', 'talent', 'skill', 'ability'
      ],
      videoEmotion: 'roll-over',
      priority: 'low'
    },

    // DANCE VIDEO - Music, rhythm, celebration, party situations
    dance: {
      keywords: [
        'dance', 'dancing', 'music', 'song', 'rhythm', 'beat', 'melody', 'tune',
        'celebration', 'party', 'festival', 'birthday', 'celebrate', 'festive',
        'groove', 'move', 'sway', 'bounce', 'wiggle', 'shake', 'boogie',
        'concert', 'musical'
      ],
      videoEmotion: 'dance',
      priority: 'medium'
    },

    buttons: {
      keywords: [
        'button', 'click', 'press', 'tap', 'touch', 'select', 'choose', 'pick',
        'menu', 'option', 'setting', 'preference', 'configuration', 'control',
        'navigate', 'go to', 'open', 'close', 'start', 'begin', 'launch'
      ],
      videoEmotion: 'ears-up',
      priority: 'low'
    },

    // Emotional support situations
    comfort: {
      keywords: [
        'sad', 'upset', 'crying', 'tears', 'disappointed', 'frustrated', 'angry', 'mad',
        'lonely', 'miss', 'homesick', 'worried', 'anxious', 'nervous', 'stress',
        'comfort', 'better', 'feel good', 'cheer up', 'support', 'help me feel'
      ],
      videoEmotion: 'happy', // Happy video to cheer them up
      priority: 'medium'
    },

    // Daily activities
    routine: {
      keywords: [
        'morning', 'wake up', 'breakfast', 'lunch', 'dinner', 'bedtime', 'sleep',
        'brush teeth', 'wash hands', 'bath', 'shower', 'clean', 'tidy',
        'chores', 'homework', 'study time', 'reading time', 'quiet time'
      ],
      videoEmotion: 'ears-up', // Attentive for routine activities
      priority: 'low'
    },

    // NEW VIDEO MAPPINGS - More variation for richer interactions
    
    // BOUNCING VIDEO - High energy, hyperactive, very excited situations
    bouncing: {
      keywords: [
        'bounce', 'bouncing', 'bouncy', 'hyper', 'hyperactive', 'energetic', 'super excited',
        'jumping up and down', 'can\'t sit still', 'so much energy', 'zoom', 'zoomies',
        'running around', 'crazy energy', 'wild', 'lively', 'vigorous', 'active'
      ],
      videoEmotion: 'bouncing',
      priority: 'medium'
    },

    // DIGGING VIDEO - Exploring, searching, investigating situations  
    digging: {
      keywords: [
        'dig', 'digging', 'excavate', 'burrow', 'tunnel', 'uncover', 'unearth',
        'explore', 'search for', 'look for', 'hunt', 'seek', 'investigate', 'examine',
        'find something', 'discover', 'buried', 'hidden', 'treasure hunt'
      ],
      videoEmotion: 'digging',
      priority: 'low'
    },

    // JUMPING VIDEO - Excited jumping, leaping, hopping situations
    jumping: {
      keywords: [
        'jump', 'jumping', 'leap', 'leaping', 'hop', 'hopping', 'spring', 'bound',
        'jump for joy', 'jump up', 'jump around', 'high jump', 'jump high',
        'enthusiastic', 'can\'t contain', 'burst with', 'overcome with joy'
      ],
      videoEmotion: 'jumping',
      priority: 'medium'
    },

    // LAYBACK VIDEO - Lounging, comfortable, content situations (different mood from lay-down)
    layback: {
      keywords: [
        'layback', 'lay back', 'lounge', 'lounging', 'kick back', 'chill out',
        'comfortable', 'content', 'satisfied', 'pleased', 'fulfilled',
        'easy going', 'mellow', 'casual', 'informal', 'unhurried', 'leisurely'
      ],
      videoEmotion: 'layback',
      priority: 'low'
    },

    // PAWS VIDEO - Requesting, begging, asking for attention/treats
    paws: {
      keywords: [
        'paws', 'paw', 'beg', 'begging', 'please', 'pretty please', 'can i have',
        'give me', 'want', 'need', 'request', 'asking', 'asking nicely',
        'treat', 'snack', 'cookie', 'food', 'attention', 'pet me', 'play with me',
        'shake hands', 'high five', 'fist bump'
      ],
      videoEmotion: 'paws',
      priority: 'medium'
    },

    // TAIL-CHASE VIDEO - Super silly, goofy, ridiculous, comical situations
    'tail-chase': {
      keywords: [
        'tail', 'chase tail', 'chasing', 'catch', 'silly', 'goofy', 'ridiculous',
        'funny', 'hilarious', 'comical', 'absurd', 'nonsense', 'foolish',
        'dizzy', 'spin', 'circle', 'round and round', 'whirlwind',
        'crazy', 'wacky', 'zany', 'nutty', 'loopy', 'bonkers'
      ],
      videoEmotion: 'tail-chase',
      priority: 'low'
    },

    // TIRED VIDEO - Exhausted, very sleepy, low energy, worn out
    tired: {
      keywords: [
        'tired', 'exhausted', 'worn out', 'drained', 'fatigued', 'weary', 'beat',
        'sleepy', 'drowsy', 'yawn', 'yawning', 'need rest', 'need sleep',
        'no energy', 'low energy', 'can\'t keep eyes open', 'so tired',
        'ready for bed', 'time to rest', 'tuckered out', 'pooped', 'wiped out'
      ],
      videoEmotion: 'tired',
      priority: 'low'
    },

    // WAVING VIDEO - Greetings, hellos, friendly welcomes
    waving: {
      keywords: [
        'wave', 'waving', 'hello', 'hi', 'hey', 'greet', 'greeting', 'welcome',
        'good morning', 'good afternoon', 'good evening', 'howdy', 'yo',
        'nice to meet', 'pleased to meet', 'salute', 'say hi', 'say hello',
        'welcome back', 'glad to see', 'happy to see'
      ],
      videoEmotion: 'waving',
      priority: 'medium'
    }
  }), [])

  /**
   * Analyze response text and context to determine appropriate video emotion
   */
  const analyzeResponseForVideo = useCallback((responseData) => {
    try {
      // Handle different response formats
      const text = typeof responseData === 'string' ? responseData : responseData?.text || ''
      const emotion = responseData?.emotion || 'happy'
      const safetyContext = responseData?.safetyContext || null
      const responseType = responseData?.type || 'general'

      console.log('🎬 Analyzing response for video:', { 
        text: text.substring(0, 50), 
        emotion, 
        safetyContext, 
        responseType,
        fullResponseData: responseData 
      })

      // EXCLUDE ALL button-triggered responses (comprehensive check)
      const isButtonResponse = (
        responseType === 'button' || 
        responseData?.isButtonTriggered || 
        responseData?.source === 'button' ||
        text.includes('Once upon a time') ||
        text.includes('Here is a Bible verse') ||
        text.includes('Bible Search Results') ||
        text.includes('Here are some verses') ||
        text.includes('I found these verses') ||
        text.includes('Let me search') ||
        responseData?.type === 'bible_search' ||
        responseData?.type === 'bible_verse' ||
        responseData?.type === 'story' ||
        responseData?.type === 'lesson'
      )
      
      if (isButtonResponse) {
        const analysis = {
          videoEmotion: 'happy',
          priority: 'low',
          confidence: 0.1,
          reason: 'button_triggered_excluded',
          context: 'button_interaction'
        }
        console.log('🎬 BUTTON/SEARCH RESPONSE EXCLUDED - No video for button interactions')
        setLastAnalysis(analysis)
        return analysis
      }

      // PRIORITY 1: Safety responses always get barking video
      if (safetyContext || responseType?.includes('safety')) {
        const analysis = {
          videoEmotion: 'barking',
          priority: 'high',
          confidence: 1.0,
          reason: 'safety_response',
          context: safetyContext || responseType
        }
        console.log('🎬 SAFETY RESPONSE DETECTED - Using barking video:', analysis)
        setLastAnalysis(analysis)
        return analysis
      }

      // PRIORITY 2: Check for safety keywords in text
      const lowerText = text.toLowerCase()
      if (emotionMapping.safety.keywords.some(keyword => lowerText.includes(keyword))) {
        const analysis = {
          videoEmotion: 'barking',
          priority: 'high', 
          confidence: 0.9,
          reason: 'safety_keywords',
          context: 'safety_content'
        }
        setLastAnalysis(analysis)
        return analysis
      }

      // PRIORITY 3: Map based on current emotion
      if (emotion === 'nervous' || emotion === 'concerned' || emotion === 'protective') {
        const analysis = {
          videoEmotion: 'barking',
          priority: 'medium',
          confidence: 0.8,
          reason: 'emotion_mapping',
          context: emotion
        }
        console.log('🎬 NERVOUS EMOTION DETECTED - Using barking video:', analysis)
        setLastAnalysis(analysis)
        return analysis
      }

      // PRIORITY 4: Analyze text content for HIGH-IMPACT situations only
      const positiveScore = emotionMapping.positive.keywords.reduce((score, keyword) => {
        return score + (lowerText.includes(keyword) ? 1 : 0)
      }, 0)

      const curiousScore = emotionMapping.curious.keywords.reduce((score, keyword) => {
        return score + (lowerText.includes(keyword) ? 1 : 0)
      }, 0)

      const gamesScore = emotionMapping.games.keywords.reduce((score, keyword) => {
        return score + (lowerText.includes(keyword) ? 1 : 0)
      }, 0)

      const calmScore = emotionMapping.calm.keywords.reduce((score, keyword) => {
        return score + (lowerText.includes(keyword) ? 1 : 0)
      }, 0)

      const tricksScore = emotionMapping.tricks.keywords.reduce((score, keyword) => {
        return score + (lowerText.includes(keyword) ? 1 : 0)
      }, 0)

      const danceScore = emotionMapping.dance.keywords.reduce((score, keyword) => {
        return score + (lowerText.includes(keyword) ? 1 : 0)
      }, 0)

      // Skip low-impact categories (buttons, routine) to reduce video frequency
      // Only use videos for meaningful interactions

      // Determine best match - MUCH MORE SELECTIVE
      let videoEmotion = 'happy' // Default
      let priority = 'low'
      let confidence = 0.3 // Lower default confidence
      let reason = 'default'

      // Trigger videos for STRONG matches - Check specific categories first
      if (danceScore >= 2) { // Check dance first (most specific)
        videoEmotion = 'dance'
        priority = 'medium'
        confidence = Math.min(0.9, 0.7 + (danceScore * 0.1))
        reason = 'dance_content'
      } else if (tricksScore >= 2) { // Check tricks second (specific)
        videoEmotion = 'roll-over'
        priority = 'low'
        confidence = Math.min(0.8, 0.6 + (tricksScore * 0.1))
        reason = 'tricks_content'
      } else if (calmScore >= 2) { // Check calm third (specific)
        videoEmotion = 'lay-down'
        priority = 'low'
        confidence = Math.min(0.8, 0.6 + (calmScore * 0.1))
        reason = 'calm_content'
      } else if (curiousScore >= 2) { // Check learning fourth
        videoEmotion = 'ears-up'
        priority = 'medium'
        confidence = Math.min(0.9, 0.7 + (curiousScore * 0.1))
        reason = 'strong_curious_content'
      } else if (gamesScore >= 2) { // Check games fifth
        videoEmotion = 'happy'
        priority = 'medium'
        confidence = Math.min(0.9, 0.7 + (gamesScore * 0.1))
        reason = 'strong_games_content'
      } else if (positiveScore >= 2) { // Check general positive last (least specific)
        videoEmotion = 'happy'
        priority = 'medium'
        confidence = Math.min(0.9, 0.7 + (positiveScore * 0.1))
        reason = 'strong_positive_keywords'
      }
      // If scores are low (1-2 for main categories), no video will be shown

      const analysis = {
        videoEmotion,
        priority,
        confidence,
        reason,
        context: responseType || 'general',
        scores: {
          positive: positiveScore,
          curious: curiousScore,
          games: gamesScore,
          calm: calmScore,
          tricks: tricksScore,
          dance: danceScore
        }
      }

      setLastAnalysis(analysis)
      console.log('🎬 Video emotion analysis:', analysis)
      return analysis

    } catch (error) {
      console.warn('🎬 Video emotion analysis failed:', error)
      
      // Safe fallback
      const fallbackAnalysis = {
        videoEmotion: 'happy',
        priority: 'low',
        confidence: 0.3,
        reason: 'error_fallback',
        context: 'error',
        error: error.message
      }
      
      setLastAnalysis(fallbackAnalysis)
      return fallbackAnalysis
    }
  }, [emotionMapping])

  /**
   * Quick check if response should trigger video - MUCH MORE SELECTIVE
   */
  const shouldUseVideo = useCallback((responseData, options = {}) => {
    const { minConfidence = 0.7, allowLowPriority = true } = options // Lowered threshold for better responsiveness
    
    const analysis = analyzeResponseForVideo(responseData)
    
    // Always use video for safety responses (HIGH priority only)
    if (analysis.priority === 'high') {
      return true
    }
    
    // Adjust confidence threshold based on priority
    const effectiveMinConfidence = analysis.priority === 'low' ? 0.6 : minConfidence
    if (analysis.confidence < effectiveMinConfidence) {
      console.log(`🎬 Video skipped - confidence too low: ${analysis.confidence} < ${effectiveMinConfidence}`)
      return false
    }
    
    // Allow low priority videos if enabled
    if (!allowLowPriority && analysis.priority === 'low') {
      console.log(`🎬 Video skipped - low priority disabled: ${analysis.priority}`)
      return false
    }
    
    // Only medium+ priority with high confidence
    console.log(`🎬 Video approved - priority: ${analysis.priority}, confidence: ${analysis.confidence}`)
    return true
  }, [analyzeResponseForVideo])

  /**
   * Debug function to get analysis details
   */
  const getAnalysisDebug = useCallback(() => {
    return {
      lastAnalysis,
      emotionMapping,
      availableEmotions: Object.keys(emotionMapping)
    }
  }, [lastAnalysis, emotionMapping])

  // Make available globally for debugging
  if (typeof window !== 'undefined') {
    window.VideoEmotionAnalyzer = {
      analyze: analyzeResponseForVideo,
      shouldUse: shouldUseVideo,
      debug: getAnalysisDebug
    }
  }

  return {
    analyzeResponseForVideo,
    shouldUseVideo,
    getAnalysisDebug,
    lastAnalysis
  }
}

export default useVideoEmotion
