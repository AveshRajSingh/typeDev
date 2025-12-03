'use client'
import React, { useState } from 'react'
import ThemeSelector from '../../components/ThemeSelector'

const page = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    try {
      console.log('Signup attempt:', formData)
      // Add your signup API call here
    } catch (error) {
      console.error('Signup error:', error)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4' style={{ backgroundColor: 'var(--background)' }}>
      <div className='absolute top-4 right-4'>
        <ThemeSelector />
      </div>
      
      <div className='w-full max-w-md p-8 rounded-lg' style={{ 
        backgroundColor: 'var(--card)', 
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'var(--primary)'
      }}>
        <h1 className='text-center mb-6 text-3xl font-bold' style={{ color: 'var(--foreground)' }}>
          Sign Up
        </h1>
        
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='username' className='block text-sm font-medium mb-2' style={{ color: 'var(--foreground)' }}>
              Username
            </label>
            <input
              type='text'
              id='username'
              name='username'
              value={formData.username}
              onChange={handleChange}
              className='w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2'
              style={{ 
                backgroundColor: 'var(--input)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--inputBorder)',
                color: 'var(--foreground)'
              }}
              placeholder='Choose a username'
              required
            />
          </div>

          <div>
            <label htmlFor='email' className='block text-sm font-medium mb-2' style={{ color: 'var(--foreground)' }}>
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className='w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2'
              style={{ 
                backgroundColor: 'var(--input)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--inputBorder)',
                color: 'var(--foreground)'
              }}
              placeholder='Enter your email'
              required
            />
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium mb-2' style={{ color: 'var(--foreground)' }}>
              Password
            </label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              className='w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2'
              style={{ 
                backgroundColor: 'var(--input)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--inputBorder)',
                color: 'var(--foreground)'
              }}
              placeholder='Create a password'
              required
            />
          </div>

          <div>
            <label htmlFor='confirmPassword' className='block text-sm font-medium mb-2' style={{ color: 'var(--foreground)' }}>
              Confirm Password
            </label>
            <input
              type='password'
              id='confirmPassword'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleChange}
              className='w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2'
              style={{ 
                backgroundColor: 'var(--input)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--inputBorder)',
                color: 'var(--foreground)'
              }}
              placeholder='Confirm your password'
              required
            />
          </div>

          <button
            type='submit'
            className='w-full py-2 px-4 rounded-md font-semibold transition-colors duration-200'
            style={{ 
              backgroundColor: 'var(--primary)',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primaryHover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary)'}
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  )
}

export default page
