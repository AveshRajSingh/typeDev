'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, loginUser as apiLoginUser } from '../services/api'

const UserContext = createContext()

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

  // Fetch current user on mount
  useEffect(() => {
    fetchCurrentUser()
  }, [])

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
      const response = await apiLoginUser(identifier, password)
      setUser(response.user)
      return { success: true, data: response }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setError(null)
    // Clear cookies by calling logout endpoint (you can add this later)
    // For now, just clear the user state
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
