'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ChangePassword() {
  const router = useRouter()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  })

  const handlePasswordChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }))

    // Calculate password strength for new password
    if (field === 'new_password') {
      calculatePasswordStrength(value)
    }
  }

  const calculatePasswordStrength = (password) => {
    let score = 0
    const feedback = []

    if (password.length >= 8) {
      score += 20
    } else {
      feedback.push('At least 8 characters')
    }

    if (password.length >= 12) {
      score += 10
    }

    if (/[a-z]/.test(password)) {
      score += 20
    } else {
      feedback.push('Include lowercase letters')
    }

    if (/[A-Z]/.test(password)) {
      score += 20
    } else {
      feedback.push('Include uppercase letters')
    }

    if (/[0-9]/.test(password)) {
      score += 15
    } else {
      feedback.push('Include numbers')
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
      score += 15
    } else {
      feedback.push('Include special characters')
    }

    setPasswordStrength({ score, feedback })
  }

  const getStrengthColor = () => {
    if (passwordStrength.score < 40) return 'bg-red-500'
    if (passwordStrength.score < 60) return 'bg-yellow-500'
    if (passwordStrength.score < 80) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthLabel = () => {
    if (passwordStrength.score < 40) return 'Weak'
    if (passwordStrength.score < 60) return 'Fair'
    if (passwordStrength.score < 80) return 'Good'
    return 'Strong'
  }

  const validateForm = () => {
    if (!passwords.current_password) {
      toast.error('Please enter your current password')
      return false
    }

    if (!passwords.new_password) {
      toast.error('Please enter a new password')
      return false
    }

    if (passwords.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return false
    }

    if (passwords.new_password === passwords.current_password) {
      toast.error('New password must be different from current password')
      return false
    }

    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('Passwords do not match')
      return false
    }

    if (passwordStrength.score < 60) {
      toast.error('Please choose a stronger password')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          current_password: passwords.current_password,
          new_password: passwords.new_password
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to change password')
      }

      const result = await response.json()

      toast.success('Password changed successfully!')

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(error.message || 'Failed to change password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <LockClosedIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Change Your Password</h2>
            <p className="text-secondary-600">
              For security reasons, please change your temporary password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwords.current_password}
                  onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwords.new_password}
                  onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwords.new_password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-secondary-600">Password Strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score < 40 ? 'text-red-600' :
                      passwordStrength.score < 60 ? 'text-yellow-600' :
                      passwordStrength.score < 80 ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="mt-2 text-xs text-secondary-600 space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwords.confirm_password}
                  onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwords.confirm_password && passwords.new_password !== passwords.confirm_password && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
              {passwords.confirm_password && passwords.new_password === passwords.confirm_password && (
                <p className="mt-1 text-xs text-green-600 flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col space-y-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Changing Password...
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="w-5 h-5 mr-2" />
                    Change Password
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full px-6 py-3 bg-gray-100 text-secondary-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
              >
                Skip for Now
              </button>
            </div>

            <p className="text-xs text-center text-secondary-500 mt-4">
              You can change your password later from your profile settings
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
