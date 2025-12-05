'use client'
import React, { useState } from 'react'

const Signup = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isFocused, setIsFocused] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFocus = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }))
  }

  const handleBlur = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    try {
      console.log('Signup attempt:', formData)
    } catch (error) {
      console.error('Signup error:', error)
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-6">
        <h1 className='text-2xl font-bold mb-1' style={{ color: 'var(--foreground)' }}>
          Create Account
        </h1>
        <p className='text-sm' style={{ color: 'var(--secondary)' }}>
          Join us and start your journey
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className="relative">
          <label
            htmlFor='username'
            className={`absolute left-3 transition-all duration-300 ease-out pointer-events-none z-10 ${
              isFocused.username || formData.username
                ? '-top-3 text-xs px-2 scale-95'
                : 'top-3 text-sm'
            }`}
            style={{
              color: isFocused.username ? 'var(--primary)' : 'var(--secondary)',
              textShadow: isFocused.username || formData.username
                ? '0 0 8px var(--card), 0 0 4px var(--card), -1px 0 2px var(--card), 1px 0 2px var(--card), 0 -1px 2px var(--card), 0 1px 2px var(--card)'
                : 'none',
            }}
          >
            Username
          </label>
          <input
            type='text'
            id='username'
            name='username'
            value={formData.username}
            onChange={handleChange}
            onFocus={() => handleFocus('username')}
            onBlur={() => handleBlur('username')}
            className='w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none'
            style={{ 
              backgroundColor: 'var(--input)',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: isFocused.username ? 'var(--primary)' : 'transparent',
              color: 'var(--foreground)',
              transform: isFocused.username ? 'scale(1.01)' : 'scale(1)',
            }}
            required
          />
        </div>

        <div className="relative">
          <label
            htmlFor='email'
            className={`absolute left-3 transition-all duration-300 ease-out pointer-events-none z-10 ${
              isFocused.email || formData.email
                ? '-top-3 text-xs px-2 scale-95'
                : 'top-3 text-sm'
            }`}
            style={{
              color: isFocused.email ? 'var(--primary)' : 'var(--secondary)',
              textShadow: isFocused.email || formData.email
                ? '0 0 8px var(--card), 0 0 4px var(--card), -1px 0 2px var(--card), 1px 0 2px var(--card), 0 -1px 2px var(--card), 0 1px 2px var(--card)'
                : 'none',
            }}
          >
            Email
          </label>
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            onFocus={() => handleFocus('email')}
            onBlur={() => handleBlur('email')}
            className='w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none'
            style={{ 
              backgroundColor: 'var(--input)',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: isFocused.email ? 'var(--primary)' : 'transparent',
              color: 'var(--foreground)',
              transform: isFocused.email ? 'scale(1.01)' : 'scale(1)',
            }}
            required
          />
        </div>

        <div className="relative">
          <label
            htmlFor='password'
            className={`absolute left-3 transition-all duration-300 ease-out pointer-events-none z-10 ${
              isFocused.password || formData.password
                ? '-top-3 text-xs px-2 scale-95'
                : 'top-3 text-sm'
            }`}
            style={{
              color: isFocused.password ? 'var(--primary)' : 'var(--secondary)',
              textShadow: isFocused.password || formData.password
                ? '0 0 8px var(--card), 0 0 4px var(--card), -1px 0 2px var(--card), 1px 0 2px var(--card), 0 -1px 2px var(--card), 0 1px 2px var(--card)'
                : 'none',
            }}
          >
            Password
          </label>
          <input
            type='password'
            id='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            onFocus={() => handleFocus('password')}
            onBlur={() => handleBlur('password')}
            className='w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none'
            style={{ 
              backgroundColor: 'var(--input)',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: isFocused.password ? 'var(--primary)' : 'transparent',
              color: 'var(--foreground)',
              transform: isFocused.password ? 'scale(1.01)' : 'scale(1)',
            }}
            required
          />
        </div>

        <div className="relative">
          <label
            htmlFor='confirmPassword'
            className={`absolute left-3 transition-all duration-300 ease-out pointer-events-none z-10 ${
              isFocused.confirmPassword || formData.confirmPassword
                ? '-top-3 text-xs px-2 scale-95'
                : 'top-3 text-sm'
            }`}
            style={{
              color: isFocused.confirmPassword ? 'var(--primary)' : 'var(--secondary)',
              textShadow: isFocused.confirmPassword || formData.confirmPassword
                ? '0 0 8px var(--card), 0 0 4px var(--card), -1px 0 2px var(--card), 1px 0 2px var(--card), 0 -1px 2px var(--card), 0 1px 2px var(--card)'
                : 'none',
            }}
          >
            Confirm Password
          </label>
          <input
            type='password'
            id='confirmPassword'
            name='confirmPassword'
            value={formData.confirmPassword}
            onChange={handleChange}
            onFocus={() => handleFocus('confirmPassword')}
            onBlur={() => handleBlur('confirmPassword')}
            className='w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none'
            style={{ 
              backgroundColor: 'var(--input)',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: isFocused.confirmPassword ? 'var(--primary)' : 'transparent',
              color: 'var(--foreground)',
              transform: isFocused.confirmPassword ? 'scale(1.01)' : 'scale(1)',
            }}
            required
          />
        </div>

        <button
          type='submit'
          className='w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95'
          style={{ 
            backgroundColor: 'var(--primary)',
            color: '#ffffff'
          }}
        >
          Create Account
        </button>
      </form>

      <div className='relative my-5'>
        <div
          className='absolute inset-0 flex items-center'
          style={{ borderTop: '1px solid var(--border)' }}
        ></div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span
            className='px-2'
            style={{ backgroundColor: 'var(--card)', color: 'var(--secondary)' }}
          >
            Or
          </span>
        </div>
      </div>

      <div className='text-center'>
        <p style={{ color: 'var(--foreground)' }} className='text-sm'>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className='font-semibold transition-all duration-200 hover:underline inline-flex items-center gap-1 group'
            style={{ color: 'var(--primary)' }}
          >
            Sign In
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </p>
      </div>
    </div>
  )
}

export default Signup
