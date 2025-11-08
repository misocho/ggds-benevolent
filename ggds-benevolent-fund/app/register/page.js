/*
PIVOT v2.0: Self-registration removed - Admin creates accounts
This page is preserved for potential future use
Commented out on: 2025-10-23

Original registration form with all functionality is commented below.
If needed in the future, uncomment the code section.
*/

'use client'

import { useRouter } from 'next/navigation'
import { ExclamationTriangleIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        {/* PIVOT v2.0: Registration Temporarily Unavailable */}
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-yellow-500" />
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            Registration Unavailable
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Member accounts are now created by administrators.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <EnvelopeIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700">
                  If you're a new member, please contact the administrator to have your account created.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              <strong>To join as a new member:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
              <li>Contact admin@ggds.org</li>
              <li>Call +1 (817) 673-8035</li>
              <li>You'll receive your Member ID and initial password via email</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/signin')}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Already have an account? Sign In
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Future Use Note */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            GGDS Benevolent Fund Platform v2.0
          </p>
        </div>
      </div>
    </div>
  )
}

/* ========================================================================
   ORIGINAL REGISTRATION FORM CODE (PRESERVED FOR FUTURE USE)
   ========================================================================

'use client'

import { useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import { UserIcon, UserGroupIcon, HeartIcon, IdentificationIcon, PlusIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { authAPI } from '../../lib/api'

// Extract FamilyMemberInputs as separate component to fix focus issue
const FamilyMemberInputs = memo(({ members, section, title, maxMembers, onInputChange, onAddMember, onRemoveMember }) => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
      <h4 className="font-medium text-secondary-900">
        {title} (Maximum {maxMembers})
      </h4>
      <button
        type="button"
        onClick={onAddMember}
        disabled={members.length >= maxMembers}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          members.length >= maxMembers
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
        }`}
      >
        <PlusIcon className="w-4 h-4" />
        Add Another
      </button>
    </div>
    {members.map((member, index) => (
      <div key={member.id} className="bg-gray-50 p-4 sm:p-6 rounded-lg relative">
        {members.length > 1 && (
          <button
            type="button"
            onClick={() => onRemoveMember(index)}
            className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Remove"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
        <h5 className="text-sm font-medium text-secondary-700 mb-3">
          {title.slice(0, -1)} #{index + 1}
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={member.name}
              onChange={(e) => onInputChange(index, 'name', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Relationship
            </label>
            <select
              value={member.relationship}
              onChange={(e) => onInputChange(index, 'relationship', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select relationship</option>
              {section === 'nuclearFamily' ? (
                <>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                </>
              ) : (
                <>
                  <option value="brother">Brother</option>
                  <option value="sister">Sister</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={member.dateOfBirth}
              onChange={(e) => onInputChange(index, 'dateOfBirth', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    ))}
  </div>
))

FamilyMemberInputs.displayName = 'FamilyMemberInputs'

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    idNumber: '',
    occupation: '',
    residence: '',

    // Nuclear Family - start with 3 slots
    nuclearFamily: [
      { id: crypto.randomUUID(), name: '', relationship: '', dateOfBirth: '' },
      { id: crypto.randomUUID(), name: '', relationship: '', dateOfBirth: '' },
      { id: crypto.randomUUID(), name: '', relationship: '', dateOfBirth: '' }
    ],

    // Siblings - start with 3 slots
    siblings: [
      { id: crypto.randomUUID(), name: '', relationship: '', dateOfBirth: '' },
      { id: crypto.randomUUID(), name: '', relationship: '', dateOfBirth: '' },
      { id: crypto.randomUUID(), name: '', relationship: '', dateOfBirth: '' }
    ],

    // Next of Kin (2 required)
    nextOfKin: [
      { name: '', relationship: '', phone: '', email: '' },
      { name: '', relationship: '', phone: '', email: '' }
    ]
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const totalSteps = 4

  const handleInputChange = (section, index, field, value) => {
    if (section === 'personal') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
      // Clear error for this field
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: null }))
      }
    } else if (section === 'nextOfKin') {
      setFormData(prev => ({
        ...prev,
        nextOfKin: prev.nextOfKin.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        )
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: prev[section].map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        )
      }))
    }
  }

  const addFamilyMember = (section) => {
    const maxLimits = { nuclearFamily: 12, siblings: 15 }
    if (formData[section].length >= maxLimits[section]) {
      toast.error(`Maximum ${maxLimits[section]} ${section === 'nuclearFamily' ? 'nuclear family members' : 'siblings'} allowed`)
      return
    }

    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], { id: crypto.randomUUID(), name: '', relationship: '', dateOfBirth: '' }]
    }))
  }

  const removeFamilyMember = (section, index) => {
    if (formData[section].length <= 1) {
      toast.error('At least one entry must remain')
      return
    }

    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      // Personal details validation
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      if (!formData.password) newErrors.password = 'Password is required'
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
      if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required'
    } else if (step === 4) {
      // Next of kin validation
      formData.nextOfKin.forEach((kin, index) => {
        if (!kin.name.trim()) newErrors[`kin${index}_name`] = `Next of Kin ${index + 1} name is required`
        if (!kin.relationship.trim()) newErrors[`kin${index}_relationship`] = `Next of Kin ${index + 1} relationship is required`
        if (!kin.phone.trim()) newErrors[`kin${index}_phone`] = `Next of Kin ${index + 1} phone is required`
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      // Step 1: Register user account
      const registerResponse = await authAPI.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName
      })

      toast.success('Account created successfully!')

      // Step 2: Create member profile with family information
      const filteredNuclearFamily = formData.nuclearFamily
        .filter(member => member.name && member.relationship)
        .map(member => ({
          family_type: 'nuclear',
          name: member.name,
          relationship: member.relationship,
          date_of_birth: member.dateOfBirth || null
        }))

      const filteredSiblings = formData.siblings
        .filter(sibling => sibling.name && sibling.relationship)
        .map(sibling => ({
          family_type: 'sibling',
          name: sibling.name,
          relationship: sibling.relationship,
          date_of_birth: sibling.dateOfBirth || null
        }))

      const memberData = {
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth,
        phone: formData.phone,
        email: formData.email,
        id_number: formData.idNumber,
        occupation: formData.occupation || null,
        residence: formData.residence || null,
        nuclear_family: filteredNuclearFamily,
        siblings: filteredSiblings,
        next_of_kin: formData.nextOfKin.map((kin, index) => ({
          name: kin.name,
          relationship: kin.relationship,
          phone: kin.phone,
          email: kin.email || null,
          priority: index + 1
        }))
      }

      await authAPI.createMemberProfile(memberData)

      toast.success('Registration completed successfully! Redirecting to sign in...')

      setTimeout(() => {
        router.push('/signin')
      }, 2000)
    } catch (error) {
      console.error('Registration error:', error)

      if (error.status === 422) {
        toast.error(error.message || 'Please check your form inputs.')
      } else if (error.status === 409) {
        toast.error('An account with this email already exists.')
      } else {
        toast.error(error.message || 'Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        Progress Bar
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step <= currentStep
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 sm:w-16 h-1 transition-colors ${
                    step < currentStep ? 'bg-primary-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs sm:text-sm text-secondary-600">
            <span>Personal</span>
            <span>Family</span>
            <span>Siblings</span>
            <span>Next of Kin</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl sm:text-2xl font-bold text-secondary-900 flex items-center gap-2">
              <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
              Member Registration
            </h1>
            <p className="mt-1 text-sm text-secondary-600">
              Please provide accurate information for all sections
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            { ... ALL FORM STEPS CODE ... }

            Navigation Buttons
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between pt-6 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`w-full sm:w-auto px-6 py-2 rounded-md font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-secondary-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full sm:w-auto px-6 py-3 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full sm:w-auto px-8 py-3 bg-primary-500 text-white rounded-md font-medium shadow-lg transition-all duration-200 ${
                    isLoading
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-primary-600 hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Registration'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

   END OF PRESERVED CODE
   ======================================================================== */
