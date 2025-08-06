'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate authentication process
    try {
      // Here you would typically call your authentication API
      console.log('Sign in attempt:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo purposes, redirect to dashboard
      alert('Sign in successful! Redirecting to dashboard...')
      // In a real app, you'd use router.push('/dashboard')
    } catch (error) {
      alert('Sign in failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-500 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-secondary-900">
            Member Sign In
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Access your benevolent fund account
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                Email address or Member ID
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter your email or member ID"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 pr-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200 ${
                  isLoading
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
                }`}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon
                    className={`h-5 w-5 ${
                      isLoading ? 'text-primary-300' : 'text-primary-400 group-hover:text-primary-300'
                    }`}
                  />
                </span>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-secondary-500">New member?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/register"
                className="w-full flex justify-center py-3 px-4 border-2 border-primary-500 rounded-md shadow-sm text-sm font-medium text-primary-500 bg-white hover:bg-primary-50 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Create your account
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-secondary-500">
                Having trouble signing in?{' '}
                <Link href="/contact" className="text-primary-600 hover:text-primary-500 font-medium">
                  Contact support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Security Info */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <LockClosedIcon className="h-5 w-5 text-primary-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-primary-800">
                Secure Access
              </h3>
              <div className="mt-2 text-sm text-primary-700">
                <p>
                  Your account is protected with industry-standard security measures. 
                  Never share your login credentials with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}