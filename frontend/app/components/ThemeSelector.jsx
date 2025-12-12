'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeSelector() {
  const { theme, changeTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const themeOptions = [
    { value: 'system', label: 'System', icon: '💻' },
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'ocean', label: 'Ocean', icon: '🌊' },
    { value: 'purple', label: 'Purple', icon: '💜' },
    { value: 'slate', label: 'Slate', icon: '⚙️' },
    { value: 'nord', label: 'Nord', icon: '❄️' },
  ]

  const currentThemeOption = themeOptions.find(opt => opt.value === theme)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="relative">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200"
          style={{
            backgroundColor: 'var(--input)',
            borderColor: 'var(--inputBorder)',
            color: 'var(--foreground)',
            opacity: 0.5,
          }}
          disabled
        >
          <span className="text-lg">💻</span>
          <span className="font-medium">Theme</span>
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 hover:opacity-80"
        style={{
          backgroundColor: 'var(--input)',
          borderColor: 'var(--inputBorder)',
          color: 'var(--foreground)',
        }}
      >
        <span className="text-lg">{currentThemeOption?.icon}</span>
        <span className="font-medium">{currentThemeOption?.label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute right-0 mt-2 w-48 rounded-lg shadow-2xl z-40 overflow-hidden transition-all duration-300 ease-out ${
              isOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
            style={{
              backgroundColor: 'var(--card)',
            }}
          >
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  changeTheme(option.value)
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 hover:opacity-90"
                style={{
                  backgroundColor: theme === option.value ? 'var(--primary)' : 'transparent',
                  color: theme === option.value ? '#ffffff' : 'var(--foreground)',
                }}
              >
                <span className="text-lg">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
                {theme === option.value && (
                  <svg
                    className="w-4 h-4 ml-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
