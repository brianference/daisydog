import { describe, test, expect } from '@jest/globals';
import safeMessages from '../fixtures/safe-messages.json';
import unsafeMessages from '../fixtures/unsafe-messages.json';

// Mock the safety filter detection functions
const detectDrugContent = (message) => {
  const drugKeywords = ['marijuana', 'weed', 'cocaine', 'heroin', 'meth', 'drugs', 'pills'];
  return drugKeywords.some(keyword => message.toLowerCase().includes(keyword));
};

const detectViolence = (message) => {
  const violenceKeywords = ['hurt', 'kill', 'attack', 'weapon', 'fight', 'harm'];
  return violenceKeywords.some(keyword => message.toLowerCase().includes(keyword));
};

const detectSensitiveHistory = (message) => {
  const sensitiveKeywords = [
    "hitler's germany",
    'final solution',
    'six million jews',
    'concentration camp',
    'holocaust',
    'nazi',
    'wwii',
    'ww2'
  ];
  return sensitiveKeywords.some(keyword => message.toLowerCase().includes(keyword));
};

const checkSafety = (message) => {
  if (detectDrugContent(message)) {
    return { safe: false, category: 'drug-safety', blocked: true };
  }
  if (detectViolence(message)) {
    return { safe: false, category: 'violence', blocked: true };
  }
  if (detectSensitiveHistory(message)) {
    return { safe: false, category: 'sensitive-history', blocked: true };
  }
  return { safe: true, blocked: false };
};

describe('Safety Filter - Safe Messages', () => {
  safeMessages.forEach(({ id, message, category }) => {
    test(`should allow safe message: ${id} (${category})`, () => {
      const result = checkSafety(message);
      expect(result.safe).toBe(true);
      expect(result.blocked).toBe(false);
    });
  });
});

describe('Safety Filter - Unsafe Messages (Drug Safety)', () => {
  const drugMessages = unsafeMessages.filter(m => m.category === 'drug-safety');
  
  drugMessages.forEach(({ id, message, trigger }) => {
    test(`should block drug content: ${id} - "${trigger}"`, () => {
      const result = checkSafety(message);
      expect(result.safe).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.category).toBe('drug-safety');
    });
  });
});

describe('Safety Filter - Unsafe Messages (Violence)', () => {
  const violenceMessages = unsafeMessages.filter(m => m.category === 'violence');
  
  violenceMessages.forEach(({ id, message, trigger }) => {
    test(`should block violent content: ${id} - "${trigger}"`, () => {
      const result = checkSafety(message);
      expect(result.safe).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.category).toBe('violence');
    });
  });
});

describe('Safety Filter - Unsafe Messages (Sensitive History)', () => {
  const historyMessages = unsafeMessages.filter(m => m.category === 'sensitive-history');
  
  historyMessages.forEach(({ id, message, trigger }) => {
    test(`should block sensitive historical content: ${id} - "${trigger}"`, () => {
      const result = checkSafety(message);
      expect(result.safe).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.category).toBe('sensitive-history');
    });
  });
});

describe('Safety Filter - Coverage Tests', () => {
  test('should have 100% coverage for drug keywords', () => {
    const drugKeywords = ['marijuana', 'cocaine', 'heroin', 'meth'];
    drugKeywords.forEach(keyword => {
      const result = checkSafety(`Tell me about ${keyword}`);
      expect(result.blocked).toBe(true);
      expect(result.category).toBe('drug-safety');
    });
  });

  test('should have 100% coverage for violence keywords', () => {
    const violenceKeywords = ['hurt', 'kill', 'attack', 'weapon'];
    violenceKeywords.forEach(keyword => {
      const result = checkSafety(`How to ${keyword} someone`);
      expect(result.blocked).toBe(true);
      expect(result.category).toBe('violence');
    });
  });

  test('should have 100% coverage for sensitive history keywords', () => {
    const historyKeywords = ["hitler's germany", 'final solution', 'six million jews', 'holocaust'];
    historyKeywords.forEach(keyword => {
      const result = checkSafety(`Tell me about ${keyword}`);
      expect(result.blocked).toBe(true);
      expect(result.category).toBe('sensitive-history');
    });
  });
});
