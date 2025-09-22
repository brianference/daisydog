/**
 * useBibleVerse - React hook for Bible API integration
 * Provides caching, loading states, and performance optimization
 */

import { useState, useEffect, useCallback } from 'react';
import BibleService from '../services/BibleService.js';

export const useBibleVerse = (reference, options = {}) => {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { 
    autoFetch = true, 
    fallbackEnabled = true,
    cacheTimeout = 5 * 60 * 1000 // 5 minutes
  } = options;

  const fetchVerse = useCallback(async (ref) => {
    if (!ref) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const verseData = await BibleService.getVerse(ref);
      setVerse(verseData);
    } catch (err) {
      console.error('Hook: Bible verse fetch failed:', err);
      setError(err.message);
      
      if (fallbackEnabled) {
        const fallback = BibleService.getFallbackVerse(ref);
        setVerse(fallback);
      }
    } finally {
      setLoading(false);
    }
  }, [fallbackEnabled]);

  useEffect(() => {
    if (autoFetch && reference) {
      fetchVerse(reference);
    }
  }, [reference, autoFetch, fetchVerse]);

  const refetch = useCallback(() => {
    if (reference) {
      fetchVerse(reference);
    }
  }, [reference, fetchVerse]);

  return {
    verse,
    loading,
    error,
    refetch,
    isAvailable: BibleService.isAvailable()
  };
};

export const useBibleSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query, limit = 5) => {
    if (!query) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await BibleService.searchVerses(query, limit);
      setResults(searchResults);
    } catch (err) {
      console.error('Hook: Bible search failed:', err);
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    search,
    isAvailable: BibleService.isAvailable()
  };
};

export const useBibleStatus = () => {
  const [status, setStatus] = useState(BibleService.getStatus());
  
  useEffect(() => {
    const updateStatus = () => {
      setStatus(BibleService.getStatus());
    };
    
    // Update status every 30 seconds
    const interval = setInterval(updateStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return status;
};
