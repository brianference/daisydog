/**
 * useSafetyFilter Hook - Enhanced Safety System for DaisyDog v4.0.0
 * Integrates drug safety responses with existing content filtering
 * Provides comprehensive child protection with substance abuse prevention
 */

import { useState, useCallback, useMemo } from 'react'
import ContentFilter from '../services/ContentFilter.js'
import { 
  DRUG_SAFETY_RESPONSES, 
  DRUG_SAFETY_KEYWORDS,
  SAFETY_TIPS,
  getRandomDrugSafetyResponse,
  getRandomSafetyResponse,
  detectDrugSafetyKeywords,
  COMPREHENSIVE_SAFETY_KEYWORDS,
  COMPREHENSIVE_SAFETY_RESPONSES,
  detectComprehensiveSafetyKeywords,
  getComprehensiveSafetyResponse,
  detectExtendedSafetyKeywords,
  getExtendedSafetyResponse
} from '../constants/safetyResponses.js'

export const useSafetyFilter = () => {
  const [safetyStats, setSafetyStats] = useState({
    totalChecks: 0,
    safetyTriggered: 0,
    drugSafetyTriggered: 0,
    comprehensiveSafetyTriggered: 0,
    contentFiltered: 0,
    lastTriggerType: null,
    lastTriggerCategory: null
  })

  // Enhanced safety check that includes drug safety
  const checkSafety = useCallback((message) => {
    const startTime = performance.now()
    
    // Debug logging for safety checks
    console.log('🔍 Safety check on message:', message)
    
    // Update stats
    setSafetyStats(prev => ({
      ...prev,
      totalChecks: prev.totalChecks + 1
    }))

    // Priority 1: Check for drug safety keywords (highest priority)
    const drugCategory = detectDrugSafetyKeywords(message)
    console.log('🔍 Drug safety check result:', drugCategory)
    if (drugCategory) {
      const response = getRandomDrugSafetyResponse(drugCategory)
      const safetyTip = SAFETY_TIPS[Math.floor(Math.random() * SAFETY_TIPS.length)]
      
      setSafetyStats(prev => ({
        ...prev,
        safetyTriggered: prev.safetyTriggered + 1,
        drugSafetyTriggered: prev.drugSafetyTriggered + 1,
        lastTriggerType: 'drug_safety'
      }))

      const responseTime = performance.now() - startTime
      
      return {
        isSafe: false,
        requiresIntervention: true,
        type: 'drug_safety',
        category: drugCategory,
        response: response,
        safetyTip: safetyTip,
        responseTime: responseTime,
        priority: 'critical',
        emotion: 'nervous'
      }
    }

    // Priority 2: Check for comprehensive safety keywords (violence, mental health, etc.)
    const comprehensiveCategory = detectComprehensiveSafetyKeywords(message)
    console.log('🔍 Comprehensive safety check result:', comprehensiveCategory)
    if (comprehensiveCategory) {
      const response = getComprehensiveSafetyResponse(comprehensiveCategory)
      const safetyTip = SAFETY_TIPS[Math.floor(Math.random() * SAFETY_TIPS.length)]
      
      setSafetyStats(prev => ({
        ...prev,
        safetyTriggered: prev.safetyTriggered + 1,
        comprehensiveSafetyTriggered: prev.comprehensiveSafetyTriggered + 1,
        lastTriggerType: 'comprehensive_safety',
        lastTriggerCategory: comprehensiveCategory
      }))

      const responseTime = performance.now() - startTime
      
      // Determine priority and emotion based on category
      let priority = 'high'
      let emotion = 'concerned'
      
      if (comprehensiveCategory === 'mental_health' || comprehensiveCategory === 'family_safety') {
        priority = 'critical'
        emotion = 'concerned'
      } else if (comprehensiveCategory === 'violence' || comprehensiveCategory === 'strangers') {
        priority = 'critical'
        emotion = 'protective'
      }
      
      return {
        isSafe: false,
        requiresIntervention: true,
        type: 'comprehensive_safety',
        category: comprehensiveCategory,
        response: response,
        safetyTip: safetyTip,
        responseTime: responseTime,
        priority: priority,
        emotion: emotion
      }
    }

    // Priority 3: Check extended safety system (50 comprehensive questions)
    const extendedSafetyCategory = detectExtendedSafetyKeywords(message)
    if (extendedSafetyCategory) {
      const response = getExtendedSafetyResponse(extendedSafetyCategory)
      
      setSafetyStats(prev => ({
        ...prev,
        safetyTriggered: prev.safetyTriggered + 1,
        comprehensiveSafetyTriggered: prev.comprehensiveSafetyTriggered + 1,
        lastTriggerType: 'extended_safety',
        lastTriggerCategory: extendedSafetyCategory
      }))

      const responseTime = performance.now() - startTime
      
      // Determine priority based on category type
      let priority = 'medium'
      let emotion = 'caring'
      
      if (extendedSafetyCategory.includes('pills') || extendedSafetyCategory.includes('smoking') || 
          extendedSafetyCategory.includes('alcohol') || extendedSafetyCategory.includes('powder') ||
          extendedSafetyCategory.includes('candy') || extendedSafetyCategory.includes('cleaning') ||
          extendedSafetyCategory.includes('sniffing')) {
        priority = 'critical'
        emotion = 'concerned'
      } else if (extendedSafetyCategory.includes('online') || extendedSafetyCategory.includes('pictures') ||
                 extendedSafetyCategory.includes('address') || extendedSafetyCategory.includes('cyberbullying')) {
        priority = 'high'
        emotion = 'protective'
      }
      
      return {
        isSafe: false,
        requiresIntervention: true,
        type: 'extended_safety',
        category: extendedSafetyCategory,
        response: response,
        responseTime: responseTime,
        priority: priority,
        emotion: emotion
      }
    }

    // Priority 4: Check existing content filter
    const contentCheck = ContentFilter.checkContent(message)
    if (!contentCheck.isAppropriate) {
      setSafetyStats(prev => ({
        ...prev,
        safetyTriggered: prev.safetyTriggered + 1,
        contentFiltered: prev.contentFiltered + 1,
        lastTriggerType: 'content_filter'
      }))

      const responseTime = performance.now() - startTime

      return {
        isSafe: false,
        requiresIntervention: true,
        type: 'content_filter',
        category: contentCheck.reason,
        response: contentCheck.response,
        responseTime: responseTime,
        priority: 'high',
        emotion: 'nervous'
      }
    }

    // Priority 5: Content is safe
    const responseTime = performance.now() - startTime
    return {
      isSafe: true,
      requiresIntervention: false,
      type: 'safe',
      responseTime: responseTime,
      priority: 'normal'
    }
  }, [])

  // Get safety response for a specific drug category
  const getDrugSafetyResponse = useCallback((category) => {
    const response = getRandomSafetyResponse(category)
    const tip = SAFETY_TIPS[Math.floor(Math.random() * SAFETY_TIPS.length)]
    
    return {
      response,
      tip,
      category,
      type: 'drug_safety'
    }
  }, [])

  // Test drug safety keyword detection
  const testDrugKeywords = useCallback((text) => {
    const category = detectDrugSafetyKeywords(text)
    return {
      detected: !!category,
      category,
      keywords: category ? DRUG_SAFETY_KEYWORDS[category] : [],
      response: category ? getRandomSafetyResponse(category) : null
    }
  }, [])

  // Get comprehensive safety analysis
  const getSafetyAnalysis = useCallback((message) => {
    const drugCheck = detectDrugSafetyKeywords(message)
    const comprehensiveCheck = detectComprehensiveSafetyKeywords(message)
    const contentCheck = ContentFilter.checkContent(message)
    const safetyLevel = ContentFilter.getSafetyLevel(message)

    return {
      message,
      drugSafety: {
        triggered: !!drugCheck,
        category: drugCheck,
        keywords: drugCheck ? DRUG_SAFETY_KEYWORDS[drugCheck] : []
      },
      comprehensiveSafety: {
        triggered: !!comprehensiveCheck,
        category: comprehensiveCheck,
        keywords: comprehensiveCheck ? COMPREHENSIVE_SAFETY_KEYWORDS[comprehensiveCheck] : []
      },
      contentFilter: {
        appropriate: contentCheck.isAppropriate,
        reason: contentCheck.reason || null,
        word: contentCheck.word || null
      },
      safetyLevel: safetyLevel.level,
      overallSafe: contentCheck.isAppropriate && !drugCheck && !comprehensiveCheck,
      recommendedAction: comprehensiveCheck ? 'comprehensive_safety_response' : 
                        drugCheck ? 'drug_safety_response' : 
                        !contentCheck.isAppropriate ? 'content_filter_response' : 
                        'normal_response'
    }
  }, [])

  // Get random safety tip
  const getRandomSafetyTip = useCallback(() => {
    return SAFETY_TIPS[Math.floor(Math.random() * SAFETY_TIPS.length)]
  }, [])

  // Get comprehensive safety system statistics
  const getComprehensiveSafetyStats = useCallback(() => {
    return {
      ...safetyStats,
      extendedSafetySystem: {
        totalCategories: Object.keys(window.SafetyResponses?.EXTENDED_SAFETY_KEYWORDS || {}).length,
        totalKeywords: Object.values(window.SafetyResponses?.EXTENDED_SAFETY_KEYWORDS || {}).reduce((sum, keywords) => sum + keywords.length, 0)
      }
    }
  }, [safetyStats])

  // Reset safety statistics
  const resetStats = useCallback(() => {
    setSafetyStats({
      totalChecks: 0,
      safetyTriggered: 0,
      drugSafetyTriggered: 0,
      comprehensiveSafetyTriggered: 0,
      contentFiltered: 0,
      lastTriggerType: null,
      lastTriggerCategory: null
    })
  }, [])

  // Get all available drug safety categories
  const getDrugSafetyCategories = useMemo(() => {
    return Object.keys(DRUG_SAFETY_RESPONSES)
  }, [])

  // Get all drug safety keywords
  const getAllDrugKeywords = useMemo(() => {
    return Object.values(DRUG_SAFETY_KEYWORDS).flat()
  }, [])

  // Get all comprehensive safety categories
  const getComprehensiveSafetyCategories = useMemo(() => {
    return Object.keys(COMPREHENSIVE_SAFETY_RESPONSES)
  }, [])

  // Get all comprehensive safety keywords
  const getAllComprehensiveKeywords = useMemo(() => {
    return Object.values(COMPREHENSIVE_SAFETY_KEYWORDS).flat()
  }, [])

  // Calculate safety effectiveness
  const getSafetyEffectiveness = useMemo(() => {
    if (safetyStats.totalChecks === 0) return 0
    return (safetyStats.safetyTriggered / safetyStats.totalChecks) * 100
  }, [safetyStats])

  // Make available globally for testing
  if (typeof window !== 'undefined') {
    window.SafetyFilter = {
      checkSafety,
      testDrugKeywords,
      getSafetyAnalysis,
      getDrugSafetyResponse,
      getRandomSafetyTip,
      stats: safetyStats,
      categories: getDrugSafetyCategories,
      keywords: getAllDrugKeywords,
      comprehensiveCategories: getComprehensiveSafetyCategories,
      comprehensiveKeywords: getAllComprehensiveKeywords
    }
  }

  return {
    // Core safety functions
    checkSafety,
    getDrugSafetyResponse,
    getSafetyAnalysis,
    
    // Testing and debugging
    testDrugKeywords,
    getRandomSafetyTip,
    
    // Statistics and monitoring
    safetyStats,
    resetStats,
    getSafetyEffectiveness,
    getComprehensiveSafetyStats,
    
    // Data access
    getDrugSafetyCategories,
    getAllDrugKeywords,
    getComprehensiveSafetyCategories,
    getAllComprehensiveKeywords,
    
    // Constants for external use
    DRUG_SAFETY_RESPONSES,
    DRUG_SAFETY_KEYWORDS,
    COMPREHENSIVE_SAFETY_RESPONSES,
    COMPREHENSIVE_SAFETY_KEYWORDS,
    SAFETY_TIPS
  }
}

export default useSafetyFilter
