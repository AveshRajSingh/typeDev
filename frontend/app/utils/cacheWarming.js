/**
 * Cache Warming Utility
 * Preloads frequently-used data into cache for better performance
 */

import { getPara } from '../services/api';
import { setCachedData, getCachedData } from '../services/cacheService';

const CACHE_TTL = {
  PARAGRAPH: 60 * 60 * 1000, // 1 hour
};

/**
 * Warm up paragraph cache by preloading all difficulty levels
 * This runs in the background and doesn't block the UI
 * @param {Object|null} user - User object (optional)
 */
export const warmParagraphCache = async (user = null) => {
  console.log('🔥 Warming up paragraph cache...');
  
  const difficulties = ['easy', 'medium', 'hard'];
  const specialCharOptions = [false, true];
  const timeOptions = [60]; // Default 60 seconds
  
  const promises = [];
  
  for (const difficulty of difficulties) {
    for (const includeSpecialChars of specialCharOptions) {
      for (const time of timeOptions) {
        // Preload in background without checking cache first
        // This ensures fresh data is always preloaded
        const promise = getPara(includeSpecialChars, 'en', difficulty, time, user)
          .then(() => {
            console.log(`✅ Preloaded: ${difficulty} (special: ${includeSpecialChars})`);
          })
          .catch((error) => {
            console.warn(`⚠️ Failed to preload ${difficulty}:`, error.message);
          });
        
        promises.push(promise);
      }
    }
  }
  
  // Wait for all preloads to complete (with timeout)
  await Promise.race([
    Promise.all(promises),
    new Promise((resolve) => setTimeout(resolve, 10000)), // 10 second timeout
  ]);
  
  console.log('🔥 Cache warming complete!');
};

/**
 * Warm up cache on app initialization
 * This should be called once when the app loads
 * @param {Object|null} user - User object (optional)
 */
export const initializeCacheWarming = async (user = null) => {
  // Run cache warming in the background
  // Don't await to avoid blocking the UI
  setTimeout(() => {
    warmParagraphCache(user).catch((error) => {
      console.error('Cache warming error:', error);
    });
  }, 2000); // Wait 2 seconds after app load to avoid interfering with initial render
};

/**
 * Warm cache for specific user preferences
 * @param {Object} preferences - User preferences object
 * @param {Object|null} user - User object (optional)
 */
export const warmCacheByPreferences = async (preferences, user = null) => {
  const { difficulty = 'medium', includeSpecialChars = false, timer = 60 } = preferences;
  
  console.log(`🔥 Warming cache for user preferences: ${difficulty}, special: ${includeSpecialChars}`);
  
  try {
    await getPara(includeSpecialChars, 'en', difficulty, timer, user);
    console.log('✅ Preloaded preferred settings');
  } catch (error) {
    console.warn('⚠️ Failed to preload preferred settings:', error.message);
  }
};
