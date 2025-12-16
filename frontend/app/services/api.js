import axios from "axios";
import { getCachedData, setCachedData, invalidateCache, isOnline } from './cacheService';
import { getUserId } from '../utils/userIdentity';
import { generateOfflineParagraph } from '../utils/offlineCalculations';

// Use environment variable for API URL, fallback to localhost for development
const BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

// Cache TTL configurations (in milliseconds)
const CACHE_TTL = {
  PARAGRAPH: 60 * 60 * 1000, // 1 hour - paragraphs rarely change
  AI_FEEDBACK: 7 * 24 * 60 * 60 * 1000, // 7 days - feedback is tied to specific test results
  USER_PROFILE: 5 * 60 * 1000, // 5 minutes - profile data can change frequently
  CURRENT_USER: 2 * 60 * 1000, // 2 minutes - frequently accessed, short TTL
};

// Create axios instance with credentials
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Shuffle array to create random variations from cached paragraph
 * Fisher-Yates shuffle algorithm - O(n) time complexity
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Create random paragraph variation from cached data
 * Shuffles words to provide fresh content without server request
 */
const createRandomVariation = (cachedData) => {
  if (!cachedData || !cachedData.paragraph) return null;
  
  return {
    ...cachedData,
    paragraph: shuffleArray(cachedData.paragraph)
  };
};

const getPara = async (
  isSpecialCharIncluded = false,
  language = "en",
  difficultyLevel = "hard",
  timeInSeconds = 60,
  user = null
) => {
  const cacheKey = `para_${difficultyLevel}_${isSpecialCharIncluded}_${language}_${timeInSeconds}`;
  
  try {
    // Try cache first for fast retrieval (< 10ms)
    const cachedData = await getCachedData(cacheKey, user);
    if (cachedData) {
      console.log('⚡ Serving randomized paragraph from cache (< 10ms)');
      // Return shuffled version for variety while using cache
      return createRandomVariation(cachedData);
    }
    
    // Check if we're offline
    if (!isOnline()) {
      console.log('🔌 Offline - Generating paragraph locally');
      const offlineData = generateOfflineParagraph({
        difficulty: difficultyLevel,
        includeSpecialChars: isSpecialCharIncluded,
        timeInSeconds,
      });
      
      // Cache the offline-generated paragraph
      await setCachedData(cacheKey, offlineData, CACHE_TTL.PARAGRAPH, user);
      
      return offlineData;
    }
    
    // Cache miss and online - fetch from network
    console.log('🌐 Fetching paragraph from network (cache miss)...');
    const response = await axios.post(`${BASE_URL}/para/get-para`, {
      isSpecialCharIncluded,
      language,
      difficultyLevel,
      timeInSeconds
    });
    
    // Validate response
    if (!response.data || !response.data.paragraph) {
      throw new Error('Invalid response from server');
    }
    
    // Cache the response for future fast retrievals
    await setCachedData(cacheKey, response.data, CACHE_TTL.PARAGRAPH, user);
    
    return response.data;
  } catch (error) {
    console.error("Error in getPara:", error.message);
    
    // Fallback 1: Try stale cache
    try {
      const staleCache = await getCachedData(cacheKey, user);
      if (staleCache) {
        console.warn('⚠️ Using stale cache due to error');
        return staleCache;
      }
    } catch (cacheError) {
      console.error('Cache fallback failed:', cacheError);
    }
    
    // Fallback 2: Generate offline (always works)
    console.warn('🔧 Generating offline paragraph as final fallback');
    const offlineData = generateOfflineParagraph({
      difficulty: difficultyLevel,
      includeSpecialChars: isSpecialCharIncluded,
      timeInSeconds,
    });
    
    // Try to cache it (don't fail if caching fails)
    try {
      await setCachedData(cacheKey, offlineData, CACHE_TTL.PARAGRAPH, user);
    } catch (cacheError) {
      console.error('Failed to cache offline paragraph:', cacheError);
    }
    
    return offlineData;
  }
};

// User Authentication APIs
const loginUser = async (identifier, password) => {
  try {
    console.log('API: loginUser called with identifier:', identifier)
    const response = await api.post('/users/login', {
      identifier,
      password,
    });
    console.log('API: Login successful, response:', response.data)
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Login failed";
    console.error("Login error:", errorMessage);
    throw new Error(errorMessage);
  }
};

const getCurrentUser = async () => {
  try {
    // Try cache first for faster initial load
    const cacheKey = 'current_user';
    const cachedUser = await getCachedData(cacheKey);
    
    if (cachedUser) {
      console.log('📦 Serving current user from cache');
      return cachedUser;
    }
    
    // Cache miss - fetch from network
    const response = await api.get('/users/me');
    
    // Cache the user data
    await setCachedData(cacheKey, response.data, CACHE_TTL.CURRENT_USER);
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch user";
    console.error("Get current user error:", errorMessage);
    throw new Error(errorMessage);
  }
};

const signupUser = async (username, email, password) => {
  try {
    const response = await api.post('/users/create-user', {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Signup failed";
    console.error("API: Signup error:", errorMessage, error.response?.data);
    throw new Error(errorMessage);
  }
};

const verifyOtp = async (username, otp) => {
  try {
    const response = await api.post('/users/verify-otp', {
      username,
      otp,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "OTP verification failed";
    console.error("Verify OTP error:", errorMessage);
    throw new Error(errorMessage);
  }
};

const resendOtp = async (username) => {
  try {
    const response = await api.post('/users/resend-otp', {
      username,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to resend OTP";
    console.error("Resend OTP error:", errorMessage);
    throw new Error(errorMessage);
  }
};

const logoutUser = async () => {
  try {
    const response = await api.post('/users/logout');
    // Invalidate user cache
    await invalidateCache('current_user');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Logout failed";
    console.error("Logout error:", errorMessage);
    throw new Error(errorMessage);
  }
};

const getUserProfile = async (username) => {
  try {
    // Try cache first
    const cacheKey = `profile_${username}`;
    const cachedProfile = await getCachedData(cacheKey);
    
    if (cachedProfile) {
      console.log('📦 Serving user profile from cache');
      return cachedProfile;
    }
    
    // Cache miss - fetch from network
    const response = await api.get(`/users/profile/${username}`);
    
    // Cache the profile data
    await setCachedData(cacheKey, response.data, CACHE_TTL.USER_PROFILE);
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch user profile";
    console.error("Get user profile error:", errorMessage);
    throw new Error(errorMessage);
  }
};

const saveTestResult = async (testData) => {
  try {
    const response = await api.post('/users/save-result', testData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to save test result";
    console.error("Save test result error:", errorMessage);
    throw new Error(errorMessage);
  }
};

const startTest = async () => {
  try {
    const response = await api.post('/users/start-test');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to start test";
    console.error("Start test error:", errorMessage);
    throw new Error(errorMessage);
  }
};

// AI Feedback APIs
const getAIFeedback = async (testData, difficulty, timeInSeconds, guestToken = null, user = null) => {
  try {
    // Generate cache key based on test data (to avoid duplicate AI calls for same results)
    // Note: We cache based on a hash of the test data to handle identical test results
    const testHash = `${testData.wpm}_${testData.accuracy}_${difficulty}_${timeInSeconds}`;
    const cacheKey = `ai_feedback_${testHash}`;
    
    // Try cache first
    const cachedFeedback = await getCachedData(cacheKey, user);
    if (cachedFeedback) {
      console.log('📦 Serving AI feedback from cache');
      return cachedFeedback;
    }
    
    // Cache miss - fetch from network
    console.log('🌐 Fetching AI feedback from network...');
    const response = await api.post('/ai/feedback', {
      testData,
      difficulty,
      timeInSeconds,
      guestToken,
    });
    
    // Cache the AI feedback for future identical tests
    await setCachedData(cacheKey, response.data, CACHE_TTL.AI_FEEDBACK, user);
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to get AI feedback";
    console.error("Get AI feedback error:", errorMessage);
    throw new Error(errorMessage);
  }
};

const generateAIParagraph = async (errorFrequencyMap, wordCount = 50, difficulty = 'medium') => {
  try {
    // Note: We don't cache AI-generated paragraphs as they should be unique each time
    // Users expect fresh, varied content for practice
    const response = await api.post('/ai/generate-paragraph', {
      errorFrequencyMap,
      wordCount,
      difficulty,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to generate paragraph";
    console.error("Generate AI paragraph error:", errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Invalidate cached data on user actions
 */
const invalidateUserCache = async (user = null) => {
  console.log('🗑️ Invalidating user-related cache...');
  await invalidateCache('current_user', user);
  await invalidateCache(/^profile_/, user);
};

const invalidateParagraphCache = async (user = null) => {
  console.log('🗑️ Invalidating paragraph cache...');
  await invalidateCache(/^para_/, user);
};

/**
 * Payment API Functions
 */

// Create new payment order
const createOrder = async (planType) => {
  try {
    const response = await api.post('/payment/create-order', { planType });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to create order";
    console.error("Create order error:", errorMessage);
    throw new Error(errorMessage);
  }
};

// Submit payment transaction
const submitTransaction = async (orderId, upiTransactionId, screenshot = null) => {
  try {
    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('upiTransactionId', upiTransactionId);
    
    if (screenshot) {
      formData.append('screenshot', screenshot);
    }
    
    const response = await api.post('/payment/submit-transaction', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Invalidate user cache to refresh premium status
    await invalidateUserCache();
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to submit transaction";
    console.error("Submit transaction error:", errorMessage);
    throw new Error(errorMessage);
  }
};

// Get order status
const getOrderStatus = async (orderId) => {
  try {
    const response = await api.get(`/payment/order-status/${orderId}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to get order status";
    console.error("Get order status error:", errorMessage);
    throw new Error(errorMessage);
  }
};

// Get user's payment history
const getMyOrders = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/payment/my-orders', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to get orders";
    console.error("Get my orders error:", errorMessage);
    throw new Error(errorMessage);
  }
};

// Admin: Get pending orders
const getPendingOrders = async (status = 'submitted', page = 1, limit = 20) => {
  try {
    const response = await api.get('/payment/pending-orders', {
      params: { status, page, limit }
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to get pending orders";
    console.error("Get pending orders error:", errorMessage);
    throw new Error(errorMessage);
  }
};

// Admin: Verify order
const verifyOrder = async (orderId, action, notes = '') => {
  try {
    const response = await api.patch(`/payment/verify/${orderId}`, {
      action,
      notes
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to verify order";
    console.error("Verify order error:", errorMessage);
    throw new Error(errorMessage);
  }
};

// Admin: Reconcile bank statement
const reconcilePayments = async (csvFile) => {
  try {
    const formData = new FormData();
    formData.append('csvFile', csvFile);
    
    const response = await api.post('/payment/reconcile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to reconcile payments";
    console.error("Reconcile payments error:", errorMessage);
    throw new Error(errorMessage);
  }
};

// Admin: Get notifications
const getNotifications = async (isRead = null, limit = 20) => {
  try {
    const params = { limit };
    if (isRead !== null) {
      params.isRead = isRead;
    }
    
    const response = await api.get('/payment/notifications', { params });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to get notifications";
    console.error("Get notifications error:", errorMessage);
    throw new Error(errorMessage);
  }
};

// Admin: Mark notification as read
const markNotificationRead = async (notificationId) => {
  try {
    const response = await api.patch(`/payment/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to mark notification as read";
    console.error("Mark notification read error:", errorMessage);
    throw new Error(errorMessage);
  }
};

export { 
  getPara, 
  loginUser,
  logoutUser,
  getCurrentUser, 
  signupUser, 
  verifyOtp, 
  resendOtp,
  getUserProfile,
  saveTestResult,
  startTest,
  getAIFeedback,
  generateAIParagraph,
  invalidateUserCache,
  invalidateParagraphCache,
  createOrder,
  submitTransaction,
  getOrderStatus,
  getMyOrders,
  getPendingOrders,
  verifyOrder,
  reconcilePayments,
  getNotifications,
  markNotificationRead,
};
