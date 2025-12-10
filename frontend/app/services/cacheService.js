/**
 * Cache Service
 * Manages browser Cache Storage API for offline-first data access
 * Supports TTL-based expiration and user-specific caching
 */

import { getCacheKeyPrefix } from '../utils/userIdentity';

const CACHE_NAME = 'typedev-api-cache-v1';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Cache metadata structure stored alongside cached data
 * @typedef {Object} CacheMetadata
 * @property {number} timestamp - When the data was cached
 * @property {number} ttl - Time to live in milliseconds
 * @property {string} version - Cache version for invalidation
 */

/**
 * Check if Cache API is supported
 * @returns {boolean}
 */
const isCacheSupported = () => {
  try {
    return typeof window !== 'undefined' && typeof caches !== 'undefined';
  } catch (error) {
    return false;
  }
};

/**
 * Generate a unique cache URL for a key
 * @param {string} key - Base cache key
 * @param {Object|null} user - User object (optional)
 * @returns {string} - Unique URL for cache
 */
const generateCacheURL = (key, user = null) => {
  const prefix = getCacheKeyPrefix(user);
  const fullKey = `${prefix}_${key}`;
  // Use a unique domain to avoid conflicts
  return `https://typedev.cache.local/${fullKey}`;
};

/**
 * Open or create cache storage
 * @returns {Promise<Cache>}
 */
const openCache = async () => {
  if (!isCacheSupported()) {
    throw new Error('Cache API not supported');
  }
  return await caches.open(CACHE_NAME);
};

/**
 * Create a Response object with metadata
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Response}
 */
const createCacheResponse = (data, ttl) => {
  const cacheData = {
    data,
    metadata: {
      timestamp: Date.now(),
      ttl,
      version: '1.0',
    },
  };
  
  return new Response(JSON.stringify(cacheData), {
    headers: {
      'Content-Type': 'application/json',
      'X-Cache-Date': new Date().toISOString(),
    },
  });
};

/**
 * Parse cached response and check if it's still valid
 * @param {Response} response - Cached response
 * @returns {Object|null} - Parsed data or null if expired
 */
const parseCacheResponse = async (response) => {
  try {
    const text = await response.text();
    const { data, metadata } = JSON.parse(text);
    
    if (!metadata) {
      return null; // Old cache format, invalid
    }
    
    const age = Date.now() - metadata.timestamp;
    
    // Check if cache has expired
    if (age > metadata.ttl) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to parse cache response:', error);
    return null;
  }
};

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @param {Object|null} user - User object (optional)
 * @returns {Promise<any|null>} - Cached data or null if not found/expired
 */
export const getCachedData = async (key, user = null) => {
  if (!isCacheSupported()) {
    console.warn('Cache API not supported');
    return null;
  }
  
  try {
    const cache = await openCache();
    const cacheURL = generateCacheURL(key, user);
    const response = await cache.match(cacheURL);
    
    if (!response) {
      console.log(`❌ Cache MISS for key: ${key}`);
      return null;
    }
    
    const data = await parseCacheResponse(response);
    
    if (data === null) {
      // Cache expired, remove it
      console.log(`⏰ Cache EXPIRED for key: ${key}`);
      await cache.delete(cacheURL);
      return null;
    }
    
    console.log(`✅ Cache HIT for key: ${key}`);
    return data;
  } catch (error) {
    console.error('Failed to get cached data:', error);
    return null;
  }
};

/**
 * Set data in cache with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (default: 24 hours)
 * @param {Object|null} user - User object (optional)
 * @returns {Promise<boolean>} - Success status
 */
export const setCachedData = async (key, data, ttl = DEFAULT_TTL, user = null) => {
  if (!isCacheSupported()) {
    console.warn('Cache API not supported');
    return false;
  }
  
  try {
    const cache = await openCache();
    const cacheURL = generateCacheURL(key, user);
    const response = createCacheResponse(data, ttl);
    
    await cache.put(cacheURL, response);
    console.log(`💾 Cached data for key: ${key} (TTL: ${ttl / 1000}s)`);
    return true;
  } catch (error) {
    console.error('Failed to set cached data:', error);
    return false;
  }
};

/**
 * Invalidate cache entries matching a pattern
 * @param {string|RegExp} pattern - Pattern to match cache keys
 * @param {Object|null} user - User object (optional)
 * @returns {Promise<number>} - Number of entries deleted
 */
export const invalidateCache = async (pattern, user = null) => {
  if (!isCacheSupported()) {
    return 0;
  }
  
  try {
    const cache = await openCache();
    const keys = await cache.keys();
    const prefix = getCacheKeyPrefix(user);
    let deletedCount = 0;
    
    for (const request of keys) {
      const url = request.url;
      
      // Extract the key from URL
      if (url.includes(prefix)) {
        const shouldDelete = typeof pattern === 'string' 
          ? url.includes(pattern)
          : pattern.test(url);
        
        if (shouldDelete) {
          await cache.delete(request);
          deletedCount++;
        }
      }
    }
    
    console.log(`🗑️ Invalidated ${deletedCount} cache entries matching pattern:`, pattern);
    return deletedCount;
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
    return 0;
  }
};

/**
 * Clear all cache for current user
 * @param {Object|null} user - User object (optional)
 * @returns {Promise<number>} - Number of entries deleted
 */
export const clearUserCache = async (user = null) => {
  if (!isCacheSupported()) {
    return 0;
  }
  
  try {
    const cache = await openCache();
    const keys = await cache.keys();
    const prefix = getCacheKeyPrefix(user);
    let deletedCount = 0;
    
    for (const request of keys) {
      const url = request.url;
      
      if (url.includes(prefix)) {
        await cache.delete(request);
        deletedCount++;
      }
    }
    
    console.log(`🗑️ Cleared ${deletedCount} cache entries for user`);
    return deletedCount;
  } catch (error) {
    console.error('Failed to clear user cache:', error);
    return 0;
  }
};

/**
 * Get cache statistics for current user
 * @param {Object|null} user - User object (optional)
 * @returns {Promise<Object>} - Cache statistics
 */
export const getCacheStats = async (user = null) => {
  if (!isCacheSupported()) {
    return { supported: false, entries: 0, size: 0 };
  }
  
  try {
    const cache = await openCache();
    const keys = await cache.keys();
    const prefix = getCacheKeyPrefix(user);
    
    let entries = 0;
    let size = 0;
    let expired = 0;
    
    for (const request of keys) {
      const url = request.url;
      
      if (url.includes(prefix)) {
        entries++;
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          size += blob.size;
          
          // Check if expired
          const data = await parseCacheResponse(response.clone());
          if (data === null) {
            expired++;
          }
        }
      }
    }
    
    return {
      supported: true,
      entries,
      size, // in bytes
      sizeFormatted: formatBytes(size),
      expired,
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return { supported: true, entries: 0, size: 0, error: error.message };
  }
};

/**
 * Format bytes to human-readable string
 * @param {number} bytes
 * @returns {string}
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Clear all expired cache entries for current user
 * @param {Object|null} user - User object (optional)
 * @returns {Promise<number>} - Number of entries deleted
 */
export const clearExpiredCache = async (user = null) => {
  if (!isCacheSupported()) {
    return 0;
  }
  
  try {
    const cache = await openCache();
    const keys = await cache.keys();
    const prefix = getCacheKeyPrefix(user);
    let deletedCount = 0;
    
    for (const request of keys) {
      const url = request.url;
      
      if (url.includes(prefix)) {
        const response = await cache.match(request);
        if (response) {
          const data = await parseCacheResponse(response);
          if (data === null) {
            await cache.delete(request);
            deletedCount++;
          }
        }
      }
    }
    
    console.log(`🗑️ Cleared ${deletedCount} expired cache entries`);
    return deletedCount;
  } catch (error) {
    console.error('Failed to clear expired cache:', error);
    return 0;
  }
};

/**
 * Check if a specific cache key exists and is valid
 * @param {string} key - Cache key
 * @param {Object|null} user - User object (optional)
 * @returns {Promise<boolean>}
 */
export const hasCachedData = async (key, user = null) => {
  const data = await getCachedData(key, user);
  return data !== null;
};

/**
 * Check if browser is online
 * @returns {boolean}
 */
export const isOnline = () => {
  try {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.onLine;
  } catch (error) {
    // Default to online if we can't check
    return true;
  }
};

/**
 * Listen for online/offline events
 * @param {Function} callback - Callback function with online status
 * @returns {Function} - Cleanup function
 */
export const onConnectionChange = (callback) => {
  if (typeof window === 'undefined') return () => {};
  
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
