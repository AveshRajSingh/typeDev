'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const themes = {
  light: {
    name: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#171717',
      primary: '#f59e0b',
      primaryHover: '#d97706',
      secondary: '#64748b',
      border: '#e5e7eb',
      input: '#f9fafb',
      inputBorder: '#d1d5db',
      card: '#ffffff',
      cardBorder: '#e5e7eb',
    }
  },
  dark: {
    name: 'dark',
    colors: {
      background: '#0a0a0a',
      foreground: '#ededed',
      primary: '#f59e0b',
      primaryHover: '#fbbf24',
      secondary: '#94a3b8',
      border: '#1f2937',
      input: '#1f2937',
      inputBorder: '#374151',
      card: '#111827',
      cardBorder: '#1f2937',
    }
  },
  ocean: {
    name: 'ocean',
    colors: {
      background: '#0c1821',
      foreground: '#e0f2fe',
      primary: '#06b6d4',
      primaryHover: '#0891b2',
      secondary: '#67e8f9',
      border: '#164e63',
      input: '#1e3a4a',
      inputBorder: '#0e7490',
      card: '#0f2533',
      cardBorder: '#155e75',
    }
  },
  purple: {
    name: 'purple',
    colors: {
      background: '#1a0b2e',
      foreground: '#f3e8ff',
      primary: '#a855f7',
      primaryHover: '#9333ea',
      secondary: '#c084fc',
      border: '#4c1d95',
      input: '#2e1065',
      inputBorder: '#6b21a8',
      card: '#1e0d3d',
      cardBorder: '#5b21b6',
    }
  },
  red: {
    name: 'red',
    colors: {
      background: '#1a0606',
      foreground: '#fee2e2',
      primary: '#ef4444',
      primaryHover: '#dc2626',
      secondary: '#f87171',
      border: '#7f1d1d',
      input: '#3f0f0f',
      inputBorder: '#991b1b',
      card: '#1f0a0a',
      cardBorder: '#991b1b',
    }
  },
  blue: {
    name: 'blue',
    colors: {
      background: '#0a1628',
      foreground: '#dbeafe',
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#60a5fa',
      border: '#1e3a8a',
      input: '#1e293b',
      inputBorder: '#1d4ed8',
      card: '#0f1729',
      cardBorder: '#1e40af',
    }
  }
}


export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system')
  const [resolvedTheme, setResolvedTheme] = useState('light')

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'system'
    setTheme(savedTheme)
  }, [])

  useEffect(() => {
    // Resolve system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e) => {
        setResolvedTheme(e.matches ? 'dark' : 'light')
      }
      
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light')
      mediaQuery.addEventListener('change', handleChange)
      
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      setResolvedTheme(theme)
    }
  }, [theme])

  useEffect(() => {
    // Apply theme to document
    const currentTheme = themes[resolvedTheme]
    if (currentTheme) {
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value)
      })
      document.documentElement.setAttribute('data-theme', resolvedTheme)
    }
  }, [resolvedTheme])

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
