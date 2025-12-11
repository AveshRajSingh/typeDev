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
      'primary-dark': '#1d4ed8',
      secondary: '#71717a',
      'secondary-bg': '#f4f4f5',
      border: '#e4e4e7',
      input: '#f4f4f5',
      inputBorder: '#d4d4d8',
      card: '#ffffff',
      'card-bg': '#ffffff',
      cardBorder: '#e4e4e7',
      'qr-bg': '#ffffff',
      success: '#10b981',
      'success-bg': '#d1fae5',
      'success-text': '#065f46',
      'warning-bg': '#fef3c7',
      'warning-border': '#fde68a',
      'warning-text': '#92400e',
      'error-bg': '#fee2e2',
      'error-border': '#fecaca',
      'error-text': '#991b1b',
      'info-bg': '#dbeafe',
      'info-border': '#bfdbfe',
      'info-text': '#1e40af',
    }
  },
  dark: {
    name: 'dark',
    colors: {
      background: '#0a0a0a',
      foreground: '#e5e5e5',
      primary: '#3b82f6',
      primaryHover: '#60a5fa',
      'primary-dark': '#2563eb',
      secondary: '#a1a1aa',
      'secondary-bg': '#18181b',
      border: '#27272a',
      input: '#18181b',
      inputBorder: '#3f3f46',
      card: '#141414',
      'card-bg': '#141414',
      cardBorder: '#27272a',
      'qr-bg': '#ffffff',
      success: '#10b981',
      'success-bg': '#064e3b',
      'success-text': '#6ee7b7',
      'warning-bg': '#78350f',
      'warning-border': '#92400e',
      'warning-text': '#fcd34d',
      'error-bg': '#7f1d1d',
      'error-border': '#991b1b',
      'error-text': '#fca5a5',
      'info-bg': '#1e3a8a',
      'info-border': '#1e40af',
      'info-text': '#93c5fd',
    }
  },
  ocean: {
    name: 'ocean',
    colors: {
      background: '#0f1419',
      foreground: '#d4d4d8',
      primary: '#06b6d4',
      primaryHover: '#22d3ee',
      'primary-dark': '#0891b2',
      secondary: '#94a3b8',
      'secondary-bg': '#1e293b',
      border: '#1e293b',
      input: '#1e293b',
      inputBorder: '#334155',
      card: '#1a202c',
      'card-bg': '#1a202c',
      cardBorder: '#2d3748',
      'qr-bg': '#ffffff',
      success: '#14b8a6',
      'success-bg': '#134e4a',
      'success-text': '#5eead4',
      'warning-bg': '#78350f',
      'warning-border': '#92400e',
      'warning-text': '#fcd34d',
      'error-bg': '#7f1d1d',
      'error-border': '#991b1b',
      'error-text': '#fca5a5',
      'info-bg': '#164e63',
      'info-border': '#155e75',
      'info-text': '#67e8f9',
    }
  },
  purple: {
    name: 'purple',
    colors: {
      background: '#0d0a14',
      foreground: '#e5e5e5',
      primary: '#8b5cf6',
      primaryHover: '#a78bfa',
      'primary-dark': '#7c3aed',
      secondary: '#9ca3af',
      'secondary-bg': '#1c1b22',
      border: '#27272a',
      input: '#1c1b22',
      inputBorder: '#3f3f46',
      card: '#151320',
      'card-bg': '#151320',
      cardBorder: '#2d2b3a',
      'qr-bg': '#ffffff',
      success: '#10b981',
      'success-bg': '#064e3b',
      'success-text': '#6ee7b7',
      'warning-bg': '#78350f',
      'warning-border': '#92400e',
      'warning-text': '#fcd34d',
      'error-bg': '#7f1d1d',
      'error-border': '#991b1b',
      'error-text': '#fca5a5',
      'info-bg': '#4c1d95',
      'info-border': '#5b21b6',
      'info-text': '#c4b5fd',
    }
  },
  slate: {
    name: 'slate',
    colors: {
      background: '#0f172a',
      foreground: '#e2e8f0',
      primary: '#475569',
      primaryHover: '#64748b',
      'primary-dark': '#334155',
      secondary: '#94a3b8',
      'secondary-bg': '#1e293b',
      border: '#1e293b',
      input: '#1e293b',
      inputBorder: '#334155',
      card: '#1a2332',
      'card-bg': '#1a2332',
      cardBorder: '#2d3748',
      'qr-bg': '#ffffff',
      success: '#10b981',
      'success-bg': '#064e3b',
      'success-text': '#6ee7b7',
      'warning-bg': '#78350f',
      'warning-border': '#92400e',
      'warning-text': '#fcd34d',
      'error-bg': '#7f1d1d',
      'error-border': '#991b1b',
      'error-text': '#fca5a5',
      'info-bg': '#1e3a8a',
      'info-border': '#1e40af',
      'info-text': '#93c5fd',
    }
  },
  nord: {
    name: 'nord',
    colors: {
      background: '#2e3440',
      foreground: '#eceff4',
      primary: '#88c0d0',
      primaryHover: '#8fbcbb',
      'primary-dark': '#5e81ac',
      secondary: '#d8dee9',
      'secondary-bg': '#3b4252',
      border: '#3b4252',
      input: '#3b4252',
      inputBorder: '#4c566a',
      card: '#3b4252',
      'card-bg': '#3b4252',
      cardBorder: '#434c5e',
      'qr-bg': '#ffffff',
      success: '#a3be8c',
      'success-bg': '#2e3440',
      'success-text': '#a3be8c',
      'warning-bg': '#5e3a21',
      'warning-border': '#7a4d2e',
      'warning-text': '#ebcb8b',
      'error-bg': '#3b2729',
      'error-border': '#4a2f32',
      'error-text': '#bf616a',
      'info-bg': '#3b4252',
      'info-border': '#434c5e',
      'info-text': '#81a1c1',
    }
  }
}


export function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false)
  
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'system'
    }
    return 'system'
  })
  
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'system'
      let resolved = savedTheme
      if (savedTheme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return resolved
    }
    return 'light'
  })
  
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
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
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
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
