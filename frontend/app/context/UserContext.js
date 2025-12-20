'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, loginUser as apiLoginUser } from '../services/api'
import { setUserId, clearUserId, setLogoutFlag, isLoggedOut, clearLogoutFlag } from '../utils/userIdentity'
import { clearUserCache } from '../services/cacheService'
import { initializeCacheWarming } from '../utils/cacheWarming'

const UserContext = createContext()

export { UserContext }

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch current user on mount (unless user explicitly logged out)
  useEffect(() => {
    if (!isLoggedOut()) {
      fetchCurrentUser()
    } else {
      setLoading(false)
      console.log('⛔ Skipping auto-login: User explicitly logged out')
    }
  }, [])

  // Initialize cache warming after user is loaded
  useEffect(() => {
    if (!loading) {
      // Start cache warming in background
      initializeCacheWarming(user)
    }
  }, [loading, user])

  const fetchCurrentUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getCurrentUser()
      setUser(response.user)
    } catch (err) {
      console.error('Failed to fetch current user:', err.message)
      setUser(null)
      // Don't set error for initial load failure (user might not be logged in)
    } finally {
      setLoading(false)
    }
  }

  const login = async (identifier, password) => {
    try {
      setLoading(true)
      setError(null)
      
      // Clear logout flag when user logs in
      clearLogoutFlag()
      
      const response = await apiLoginUser(identifier, password)
      setUser(response.user)
      
      // Set user ID cookie for cache management
      if (response.user?._id) {
        setUserId(`auth_${response.user._id}`)
      }
      
      return { success: true, data: response }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    console.log('🚪 Starting logout process...')
    
    // Capture user info before clearing (needed for cache clearing)
    const currentUser = user
    
    // Set logout flag FIRST to prevent auto re-authentication
    setLogoutFlag()
    
    try {
      // Call backend logout endpoint to clear cookies
      const { logoutUser } = await import('../services/api')
      await logoutUser()
      console.log('✅ Backend logout successful')
    } catch (error) {
      console.error('❌ Backend logout failed:', error)
      // Continue with local cleanup even if backend fails
    }
    
    // Clear user's cache BEFORE clearing user state (cache needs user info)
    if (currentUser) {
      try {
        const cleared = await clearUserCache(currentUser)
        console.log(`🗑️ Cleared ${cleared} cache entries for user on logout`)
      } catch (error) {
        console.error('Failed to clear cache on logout:', error)
      }
    }
    
    // Clear ALL cookies using the enhanced deleteCookie function
    clearUserId()  // This now clears with all cookie attribute combinations
    
    // Also explicitly clear auth cookies with all possible settings
    if (typeof document !== 'undefined') {
      const cookies = ['accessToken', 'refreshToken', 'type_dev_user_id']
      cookies.forEach(cookieName => {
        // Multiple strategies to ensure cookies are cleared
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax;`
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=None;Secure;`
        
        const domain = window.location.hostname
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${domain};`
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${domain};SameSite=None;Secure;`
      })
      console.log('🍪 Cleared all authentication cookies with multiple strategies')
    }
    
    // Clear user state
    setUser(null)
    setError(null)
    
    console.log('✅ Logout complete - redirecting to home page')
    
    // Reload the page to ensure all state is cleared
    // This prevents race conditions with automatic user fetching
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    fetchCurrentUser,
    isAuthenticated: !!user,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
