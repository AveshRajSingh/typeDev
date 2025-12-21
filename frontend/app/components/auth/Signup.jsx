'use client'
import React, { useState } from 'react'
import { signupUser, verifyOtp, resendOtp } from '../../services/api'
import { useUser } from '../../context/UserContext'
import { setUserId, clearLogoutFlag } from '../../utils/userIdentity'

const Signup = ({ onSwitchToLogin }) => {
  const { updateUser, fetchCurrentUser } = useUser()
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
    confirmPassword: false,
    otp: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [resendLoading, setResendLoading] = useState(false)

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
    setError('')

    console.log('🚀 Signup form submitted')
    console.log('📝 Form data:', {
      username: formData.username,
      email: formData.email,
      hasPassword: !!formData.password,
      hasConfirmPassword: !!formData.confirmPassword
    })

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required!')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long!')
      return
    }

    setLoading(true)
    try {
      console.log('🔄 Calling signupUser API...')
      const response = await signupUser(formData.username, formData.email, formData.password)
      console.log('✅ Signup successful:', response)
      setOtpSent(true)
      setError('')
    } catch (error) {
      console.error('❌ Signup error:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      })
      setError(error.message || 'Signup failed. Please check your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await verifyOtp(formData.username, otp)
      console.log('✅ OTP verified successfully:', response)
      
      // If verification returns user data, auto-login is successful
      if (response.user) {
        console.log('🔐 Auto-login successful, updating user context...')
        
        // Update context with user data
        updateUser(response.user)
        
        // Set user ID for cache management
        if (response.user._id) {
          setUserId(`auth_${response.user._id}`)
        }
        clearLogoutFlag()
        
        // Fetch fresh user data to ensure everything is synced
        await fetchCurrentUser()
        
        console.log('🎉 User logged in successfully, redirecting to home...')
        
        // Navigate to home page
        window.location.href = '/'
      } else {
        // Fallback to old behavior if response doesn't include user
        alert('Account verified successfully! Please login.')
        if (onSwitchToLogin) {
          onSwitchToLogin()
        }
      }
    } catch (error) {
      console.error('❌ OTP verification error:', error)
      setError(error.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError('')
    setResendLoading(true)

    try {
      const response = await resendOtp(formData.username)
      console.log('OTP resent:', response)
      alert('OTP has been resent to your email.')
    } catch (error) {
      console.error('Resend OTP error:', error)
      setError(error.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-4">
        <h1 className='text-xl font-bold mb-1' style={{ color: 'var(--foreground)' }}>
          {otpSent ? 'Verify Your Email' : 'Create Account'}
        </h1>
        <p className='text-sm' style={{ color: 'var(--secondary)' }}>
          {otpSent ? 'Enter the OTP sent to your email' : 'Join us and start your journey'}
        </p>
      </div>

      {error && (
        <div
          className="p-3 rounded-lg text-sm mb-3"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          {error}
        </div>
      )}

      {!otpSent ? (
        <form onSubmit={handleSubmit} className='space-y-3'>
        <div className="relative">
          <label
            htmlFor='signup-username'
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
            id='signup-username'
            name='username'
            value={formData.username}
            onChange={handleChange}
            onFocus={() => handleFocus('username')}
            onBlur={() => handleBlur('username')}
            className='w-full px-4 py-2.5 rounded-lg transition-all duration-200 focus:outline-none'
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
            htmlFor='signup-email'
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
            id='signup-email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            onFocus={() => handleFocus('email')}
            onBlur={() => handleBlur('email')}
            className='w-full px-4 py-2.5 rounded-lg transition-all duration-200 focus:outline-none'
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
            htmlFor='signup-password'
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
            id='signup-password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            onFocus={() => handleFocus('password')}
            onBlur={() => handleBlur('password')}
            className='w-full px-4 py-2.5 rounded-lg transition-all duration-200 focus:outline-none'
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
            htmlFor='signup-confirmPassword'
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
            id='signup-confirmPassword'
            name='confirmPassword'
            value={formData.confirmPassword}
            onChange={handleChange}
            onFocus={() => handleFocus('confirmPassword')}
            onBlur={() => handleBlur('confirmPassword')}
            className='w-full px-4 py-2.5 rounded-lg transition-all duration-200 focus:outline-none'
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
          disabled={loading}
          className='w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 hover:brightness-90 active:brightness-75 disabled:opacity-50 disabled:cursor-not-allowed'
          style={{ 
            backgroundColor: 'var(--primary)',
            color: '#ffffff'
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className='space-y-3'>
          <div className="relative">
            <label
              htmlFor='otp'
              className={`absolute left-3 transition-all duration-300 ease-out pointer-events-none z-10 ${
                isFocused.otp || otp
                  ? '-top-3 text-xs px-2 scale-95'
                  : 'top-3 text-sm'
              }`}
              style={{
                color: isFocused.otp ? 'var(--primary)' : 'var(--secondary)',
                textShadow: isFocused.otp || otp
                  ? '0 0 8px var(--card), 0 0 4px var(--card), -1px 0 2px var(--card), 1px 0 2px var(--card), 0 -1px 2px var(--card), 0 1px 2px var(--card)'
                  : 'none',
              }}
            >
              Enter OTP
            </label>
            <input
              type='text'
              id='otp'
              name='otp'
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onFocus={() => handleFocus('otp')}
              onBlur={() => handleBlur('otp')}
              className='w-full px-4 py-2.5 rounded-lg transition-all duration-200 focus:outline-none'
              style={{ 
                backgroundColor: 'var(--input)',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: isFocused.otp ? 'var(--primary)' : 'transparent',
                color: 'var(--foreground)',
                transform: isFocused.otp ? 'scale(1.01)' : 'scale(1)',
              }}
              required
              maxLength={6}
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 hover:brightness-90 active:brightness-75 disabled:opacity-50 disabled:cursor-not-allowed'
            style={{ 
              backgroundColor: 'var(--primary)',
              color: '#ffffff'
            }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            type='button'
            onClick={handleResendOtp}
            disabled={resendLoading}
            className='w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed'
            style={{ 
              backgroundColor: 'transparent',
              color: 'var(--primary)',
              border: '1px solid var(--primary)'
            }}
          >
            {resendLoading ? 'Resending...' : 'Resend OTP'}
          </button>
        </form>
      )}
    </div>
  )
}

export default Signup
