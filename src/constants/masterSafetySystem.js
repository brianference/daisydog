/**
 * Master Safety System Integration for DaisyDog
 * Combines all 50 safety questions with existing drug safety system
 * Maintains Christian values and parental authority
 */

import {
  SUBSTANCE_SAFETY_KEYWORDS,
  SUBSTANCE_SAFETY_RESPONSES,
  INAPPROPRIATE_CONTENT_KEYWORDS,
  INAPPROPRIATE_CONTENT_RESPONSES,
  VIOLENCE_KEYWORDS,
  VIOLENCE_RESPONSES
} from './comprehensiveSafety.js';

import {
  FAMILY_AUTHORITY_KEYWORDS,
  FAMILY_AUTHORITY_RESPONSES,
  ONLINE_SAFETY_KEYWORDS,
  ONLINE_SAFETY_RESPONSES
} from './comprehensiveSafety2.js';

// Master keyword detection system
const MASTER_SAFETY_KEYWORDS = {
  // Category 1: Substance & Drug Safety
  ...SUBSTANCE_SAFETY_KEYWORDS,
  
  // Category 2: Inappropriate Content & Behavior
  ...INAPPROPRIATE_CONTENT_KEYWORDS,
  
  // Category 3: Violence & Self-Defense
  ...VIOLENCE_KEYWORDS,
  
  // Category 4: Family & Authority Challenges
  ...FAMILY_AUTHORITY_KEYWORDS,
  
  // Category 5: Online Safety & Digital Concerns
  ...ONLINE_SAFETY_KEYWORDS
};

// Master response system
const MASTER_SAFETY_RESPONSES = {
  // Category 1: Substance & Drug Safety
  ...SUBSTANCE_SAFETY_RESPONSES,
  
  // Category 2: Inappropriate Content & Behavior
  ...INAPPROPRIATE_CONTENT_RESPONSES,
  
  // Category 3: Violence & Self-Defense
  ...VIOLENCE_RESPONSES,
  
  // Category 4: Family & Authority Challenges
  ...FAMILY_AUTHORITY_RESPONSES,
  
  // Category 5: Online Safety & Digital Concerns
  ...ONLINE_SAFETY_RESPONSES
};

// Enhanced detection function with priority system
const detectMasterSafetyKeyword = (text) => {
  const lowerText = text.toLowerCase();
  
  // Priority 1: Immediate danger keywords (violence, substances)
  const highPriorityCategories = [
    ...Object.keys(SUBSTANCE_SAFETY_KEYWORDS),
    ...Object.keys(VIOLENCE_KEYWORDS)
  ];
  
  for (const category of highPriorityCategories) {
    const keywords = MASTER_SAFETY_KEYWORDS[category];
    if (keywords) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return { category, priority: 'critical' };
        }
      }
    }
  }
  
  // Priority 2: Inappropriate content and online safety
  const mediumPriorityCategories = [
    ...Object.keys(INAPPROPRIATE_CONTENT_KEYWORDS),
    ...Object.keys(ONLINE_SAFETY_KEYWORDS)
  ];
  
  for (const category of mediumPriorityCategories) {
    const keywords = MASTER_SAFETY_KEYWORDS[category];
    if (keywords) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return { category, priority: 'high' };
        }
      }
    }
  }
  
  // Priority 3: Family and authority issues
  const lowPriorityCategories = Object.keys(FAMILY_AUTHORITY_KEYWORDS);
  
  for (const category of lowPriorityCategories) {
    const keywords = MASTER_SAFETY_KEYWORDS[category];
    if (keywords) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return { category, priority: 'medium' };
        }
      }
    }
  }
  
  return null;
};

// Get appropriate response with safety tips
const getMasterSafetyResponse = (category) => {
  const response = MASTER_SAFETY_RESPONSES[category];
  
  if (!response) {
    return "*looks concerned with caring eyes* That's a very important topic, dear one. Please talk to your parents or a trusted adult about this right away. God has put people in your life to help and protect you! 🙏💙";
  }
  
  // Add appropriate safety tip based on category
  const safetyTips = {
    // Substance safety tips
    pills_found: "🏥 When in doubt, always ask your parents or doctor first!",
    smoking_curiosity: "💨 Your lungs are precious - keep them clean and healthy!",
    alcohol_curiosity: "🥛 Water, milk, and juice are the best drinks for growing kids!",
    
    // Violence prevention tips
    hurt_someone: "☮️ Peace is always better than violence - talk to trusted adults!",
    fighting: "🤝 Kind words and adult help solve problems better than fighting!",
    
    // Online safety tips
    meet_online_person: "🛡️ Real friends are people you know in person with your parents' approval!",
    send_pictures: "📸 Pictures are special - only share them with parent-approved people!",
    
    // Family guidance tips
    disobey_parents: "👨‍👩‍👧 Your parents' rules come from love and wisdom - trust their guidance!",
    skip_church: "⛪ Church helps us grow closer to God and make good friends!"
  };
  
  const tip = safetyTips[category] || "🙏 Always remember: your parents and trusted adults are there to help you!";
  
  return `${response}\n\n${tip}`;
};

// Integration with existing safety system
const integrateWithExistingSafety = (existingCheckFunction) => {
  return (message) => {
    // First check existing drug safety system
    const existingResult = existingCheckFunction(message);
    if (existingResult && existingResult.type === 'drug_safety') {
      return existingResult;
    }
    
    // Then check comprehensive safety system
    const masterResult = detectMasterSafetyKeyword(message);
    if (masterResult) {
      const response = getMasterSafetyResponse(masterResult.category);
      
      return {
        isSafe: false,
        requiresIntervention: true,
        type: 'comprehensive_safety',
        category: masterResult.category,
        response: response,
        priority: masterResult.priority,
        emotion: masterResult.priority === 'critical' ? 'concerned' : 'caring'
      };
    }
    
    // If no safety issues detected, return existing result
    return existingResult;
  };
};

// Statistics and monitoring
const getSafetyStats = () => {
  return {
    totalCategories: Object.keys(MASTER_SAFETY_KEYWORDS).length,
    totalKeywords: Object.values(MASTER_SAFETY_KEYWORDS).reduce((sum, keywords) => sum + keywords.length, 0),
    totalResponses: Object.keys(MASTER_SAFETY_RESPONSES).length,
    categories: {
      substance: Object.keys(SUBSTANCE_SAFETY_KEYWORDS).length,
      inappropriate: Object.keys(INAPPROPRIATE_CONTENT_KEYWORDS).length,
      violence: Object.keys(VIOLENCE_KEYWORDS).length,
      family: Object.keys(FAMILY_AUTHORITY_KEYWORDS).length,
      online: Object.keys(ONLINE_SAFETY_KEYWORDS).length
    }
  };
};

export {
  MASTER_SAFETY_KEYWORDS,
  MASTER_SAFETY_RESPONSES,
  detectMasterSafetyKeyword,
  getMasterSafetyResponse,
  integrateWithExistingSafety,
  getSafetyStats
};
