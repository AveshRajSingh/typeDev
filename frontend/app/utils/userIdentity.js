/**
 * User Identity Utility
 * Manages persistent user identification via cookies for cache management
 * Works for both authenticated and guest users
 */

const USER_ID_COOKIE = 'type_dev_user_id';
const COOKIE_EXPIRY_DAYS = 365; // 1 year

/**
 * Generate a unique user ID
 * @returns {string} - Unique identifier
 */
const generateUserId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `user_${timestamp}_${random}`;
};

/**
 * Set a cookie value
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Expiry in days
 */
const setCookie = (name, value, days) => {
  if (typeof document === 'undefined') return; // SSR safety
  
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
};

/**
 * Get a cookie value
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null
 */
const getCookie = (name) => {
  if (typeof document === 'undefined') return null; // SSR safety
  
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
};

/**
 * Delete a cookie
 * @param {string} name - Cookie name
 */
const deleteCookie = (name) => {
  if (typeof document === 'undefined') return; // SSR safety
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Get or create a persistent user ID for cache management
 * This ID persists across sessions and is used for user-specific caching
 * @param {Object|null} user - Authenticated user object (optional)
 * @returns {string} - User identifier
 */
export const getUserId = (user = null) => {
  // SSR safety check
  if (typeof window === 'undefined') {
    return 'ssr_user';
  }
  
  // If authenticated user, use their ID
  if (user && user._id) {
    return `auth_${user._id}`;
  }
  
  // For guest users, check if we have a cookie-based ID
  let userId = getCookie(USER_ID_COOKIE);
  
  if (!userId) {
    // Generate new ID for first-time guest
    userId = generateUserId();
    setCookie(USER_ID_COOKIE, userId, COOKIE_EXPIRY_DAYS);
  }
  
  return userId;
};

/**
 * Set a custom user ID (typically after login)
 * @param {string} userId - User identifier
 */
export const setUserId = (userId) => {
  setCookie(USER_ID_COOKIE, userId, COOKIE_EXPIRY_DAYS);
};

/**
 * Clear user ID from cookies (typically on logout)
 */
export const clearUserId = () => {
  deleteCookie(USER_ID_COOKIE);
};

/**
 * Get cache key prefix for current user
 * @param {Object|null} user - Authenticated user object (optional)
 * @returns {string} - Cache key prefix
 */
export const getCacheKeyPrefix = (user = null) => {
  // SSR safety check
  if (typeof window === 'undefined') {
    return 'typedev_cache_ssr';
  }
  
  const userId = getUserId(user);
  return `typedev_cache_${userId}`;
};

/**
 * Check if we have a valid user identity
 * @returns {boolean}
 */
export const hasUserIdentity = () => {
  return getCookie(USER_ID_COOKIE) !== null;
};
