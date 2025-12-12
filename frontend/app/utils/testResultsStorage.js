/**
 * Utility functions for managing test results in sessionStorage
 * This approach is PWA-friendly and works well with future cacheStorage implementation
 */

const STORAGE_KEY = 'latestTestResult';
const STORAGE_TIMESTAMP_KEY = 'latestTestResult_timestamp';
const EXPIRATION_TIME = 30 * 60 * 1000; // 30 minutes

/**
 * Save test results to sessionStorage
 * @param {Object} results - The test results object
 */
export const saveTestResults = (results) => {
  try {
    const timestamp = Date.now();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    sessionStorage.setItem(STORAGE_TIMESTAMP_KEY, timestamp.toString());
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Load test results from sessionStorage
 * Returns null if not found or expired
 */
export const loadTestResults = () => {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    const timestamp = sessionStorage.getItem(STORAGE_TIMESTAMP_KEY);
    
    if (!data || !timestamp) {
      return null;
    }

    // Check if data has expired
    const age = Date.now() - parseInt(timestamp);
    if (age > EXPIRATION_TIME) {
      clearTestResults();
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};

/**
 * Clear test results from sessionStorage
 */
export const clearTestResults = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_TIMESTAMP_KEY);
  } catch (error) {
    // Silent fail
  }
};

/**
 * Check if test results exist and are valid
 */
export const hasValidTestResults = () => {
  const results = loadTestResults();
  return results !== null;
};
