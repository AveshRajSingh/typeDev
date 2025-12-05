'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const themes = {
  light: {
    name: 'light',
    colors: {
      background: '#fafafa',
      foreground: '#1a1a1a',
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      secondary: '#71717a',
      border: '#e4e4e7',
      input: '#f4f4f5',
      inputBorder: '#d4d4d8',
      card: '#ffffff',
      cardBorder: '#e4e4e7',
    }
  },
  dark: {
    name: 'dark',
    colors: {
      background: '#0a0a0a',
      foreground: '#e5e5e5',
      primary: '#3b82f6',
      primaryHover: '#60a5fa',
      secondary: '#a1a1aa',
      border: '#27272a',
      input: '#18181b',
      inputBorder: '#3f3f46',
      card: '#141414',
      cardBorder: '#27272a',
    }
  },
  ocean: {
    name: 'ocean',
    colors: {
      background: '#0f1419',
      foreground: '#d4d4d8',
      primary: '#06b6d4',
      primaryHover: '#22d3ee',
      secondary: '#94a3b8',
      border: '#1e293b',
      input: '#1e293b',
      inputBorder: '#334155',
      card: '#1a202c',
      cardBorder: '#2d3748',
    }
  },
  purple: {
    name: 'purple',
    colors: {
      background: '#0d0a14',
      foreground: '#e5e5e5',
      primary: '#8b5cf6',
      primaryHover: '#a78bfa',
      secondary: '#9ca3af',
      border: '#27272a',
      input: '#1c1b22',
      inputBorder: '#3f3f46',
      card: '#151320',
      cardBorder: '#2d2b3a',
    }
  },
  slate: {
    name: 'slate',
    colors: {
      background: '#0f172a',
      foreground: '#e2e8f0',
      primary: '#475569',
      primaryHover: '#64748b',
      secondary: '#94a3b8',
      border: '#1e293b',
      input: '#1e293b',
      inputBorder: '#334155',
      card: '#1a2332',
      cardBorder: '#2d3748',
    }
  },
  nord: {
    name: 'nord',
    colors: {
      background: '#2e3440',
      foreground: '#eceff4',
      primary: '#88c0d0',
      primaryHover: '#8fbcbb',
      secondary: '#d8dee9',
      border: '#3b4252',
      input: '#3b4252',
      inputBorder: '#4c566a',
      card: '#3b4252',
      cardBorder: '#434c5e',
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
