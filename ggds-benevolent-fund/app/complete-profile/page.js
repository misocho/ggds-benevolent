'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  UserIcon,
  UsersIcon,
  PhoneIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 1, name: 'Personal Details', icon: UserIcon },
  { id: 2, name: 'Parents', icon: UsersIcon },
  { id: 3, name: 'Nuclear Family', icon: UsersIcon },
  { id: 4, name: 'Siblings', icon: UsersIcon },
  { id: 5, name: 'Covered Persons', icon: UsersIcon },
  { id: 6, name: 'Next of Kin', icon: PhoneIcon },
  { id: 7, name: 'Review', icon: CheckCircleIcon }
]

const RELATIONSHIP_OPTIONS = {
  parent: [
    { value: 'parent', label: 'Parent' }
  ],
  nuclear: [
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' }
  ],
  sibling: [
    { value: 'brother', label: 'Brother' },
    { value: 'sister', label: 'Sister' }
  ]
}

export default function CompleteProfile() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Personal Details
  const [personalDetails, setPersonalDetails] = useState({
    date_of_birth: '',
    id_number: '',
    occupation: '',
    residence: ''
  })

  // Parents
  const [parents, setParents] = useState([
    { name: '', relationship: 'parent', date_of_birth: '' }
  ])

  // Nuclear Family Members (Spouse and Children)
  const [nuclearFamily, setNuclearFamily] = useState([
    { name: '', relationship: '', date_of_birth: '' }
  ])

  // Siblings
  const [siblings, setSiblings] = useState([
    { name: '', relationship: '', date_of_birth: '' }
  ])

  // Covered Persons (PIVOT v2.0: Insured individuals)
  const [coveredPersons, setCoveredPersons] = useState([
    { name: '', relationship: '', date_of_birth: '', id_number: '' }
  ])

  // Next of Kin (PIVOT v2.0: Single next of kin with percentage)
  const [nextOfKin, setNextOfKin] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    percentage: 100.0
  })

  // Handle navigation guard
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const handlePersonalDetailsChange = (field, value) => {
    setPersonalDetails(prev => ({ ...prev, [field]: value }))
  }

  const handleParentChange = (index, field, value) => {
    const updated = [...parents]
    updated[index][field] = value
    setParents(updated)
  }

  const addParent = () => {
    if (parents.length < 2) {
      setParents([...parents, { name: '', relationship: 'parent', date_of_birth: '' }])
    }
  }

  const removeParent = (index) => {
    if (parents.length > 1) {
      setParents(parents.filter((_, i) => i !== index))
    }
  }

  const handleNuclearFamilyChange = (index, field, value) => {
    const updated = [...nuclearFamily]
    updated[index][field] = value
    setNuclearFamily(updated)
  }

  const addNuclearFamilyMember = () => {
    setNuclearFamily([...nuclearFamily, { name: '', relationship: '', date_of_birth: '' }])
  }

  const removeNuclearFamilyMember = (index) => {
    if (nuclearFamily.length > 1) {
      setNuclearFamily(nuclearFamily.filter((_, i) => i !== index))
    }
  }

  const handleSiblingChange = (index, field, value) => {
    const updated = [...siblings]
    updated[index][field] = value
    setSiblings(updated)
  }

  const addSibling = () => {
    setSiblings([...siblings, { name: '', relationship: '', date_of_birth: '' }])
  }

  const removeSibling = (index) => {
    if (siblings.length > 1) {
      setSiblings(siblings.filter((_, i) => i !== index))
    }
  }

  const handleCoveredPersonChange = (index, field, value) => {
    const updated = [...coveredPersons]
    updated[index][field] = value
    setCoveredPersons(updated)
  }

  const addCoveredPerson = () => {
    setCoveredPersons([...coveredPersons, { name: '', relationship: '', date_of_birth: '', id_number: '' }])
  }

  const removeCoveredPerson = (index) => {
    if (coveredPersons.length > 1) {
      setCoveredPersons(coveredPersons.filter((_, i) => i !== index))
    }
  }

  const handleNextOfKinChange = (field, value) => {
    setNextOfKin(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!personalDetails.date_of_birth || !personalDetails.id_number) {
          toast.error('Please fill in all required personal details')
          return false
        }
        return true

      case 2:
        // Parents are optional, but if filled, must be complete
        const hasParentData = parents.some(p => p.name || p.date_of_birth)
        if (hasParentData) {
          const allComplete = parents.every(p =>
            p.name && p.date_of_birth
          )
          if (!allComplete) {
            toast.error('Please complete all parent details or remove empty entries')
            return false
          }
        }
        return true

      case 3:
        // Nuclear family is optional, but if filled, must be complete
        const hasNuclearData = nuclearFamily.some(fm => fm.name || fm.relationship)
        if (hasNuclearData) {
          const allComplete = nuclearFamily.every(fm =>
            fm.name && fm.relationship && fm.date_of_birth
          )
          if (!allComplete) {
            toast.error('Please complete all nuclear family member details or remove empty entries')
            return false
          }
        }
        return true

      case 4:
        // Siblings are optional, but if filled, must be complete
        const hasSiblingData = siblings.some(s => s.name || s.relationship)
        if (hasSiblingData) {
          const allComplete = siblings.every(s =>
            s.name && s.relationship && s.date_of_birth
          )
          if (!allComplete) {
            toast.error('Please complete all sibling details or remove empty entries')
            return false
          }
        }
        return true

      case 5:
        // Covered persons are optional, but if filled, must be complete
        const hasCoveredPersonData = coveredPersons.some(cp => cp.name || cp.relationship)
        if (hasCoveredPersonData) {
          const allComplete = coveredPersons.every(cp =>
            cp.name && cp.relationship
          )
          if (!allComplete) {
            toast.error('Please complete all covered person details or remove empty entries')
            return false
          }
        }
        return true

      case 6:
        // Next of kin is required
        if (!nextOfKin.name || !nextOfKin.relationship || !nextOfKin.phone) {
          toast.error('Next of kin details are required')
          return false
        }

        // Validate percentage
        if (nextOfKin.percentage < 0 || nextOfKin.percentage > 100) {
          toast.error('Percentage must be between 0 and 100')
          return false
        }
        return true

      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 7))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(6)) return

    setIsSubmitting(true)
    try {
      // Filter out empty family members, siblings, and covered persons
      const validParents = parents.filter(p => p.name && p.date_of_birth)
      const validNuclearFamily = nuclearFamily.filter(fm => fm.name && fm.relationship && fm.date_of_birth)
      const validSiblings = siblings.filter(s => s.name && s.relationship && s.date_of_birth)
      const validCoveredPersons = coveredPersons.filter(cp => cp.name && cp.relationship)

      const profileData = {
        personal_details: personalDetails,
        parents: validParents,
        nuclear_family: validNuclearFamily,
        siblings: validSiblings,
        covered_persons: validCoveredPersons,
        next_of_kin: nextOfKin  // Single object, not array
      }

      console.log('Profile data to submit:', profileData)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/members/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to complete profile')
      }

      const result = await response.json()

      toast.success('Profile completed successfully!')

      // Redirect to change password page
      router.push('/change-password')
    } catch (error) {
      console.error('Profile completion error:', error)
      toast.error('Failed to complete profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Complete Your Profile</h1>
          <p className="text-secondary-600">
            Please provide your complete information to activate your membership
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    currentStep >= step.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center hidden sm:block ${
                    currentStep >= step.id ? 'text-primary-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 transition-colors ${
                    currentStep > step.id ? 'bg-primary-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-6">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={personalDetails.date_of_birth}
                    onChange={(e) => handlePersonalDetailsChange('date_of_birth', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    ID/Passport Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={personalDetails.id_number}
                    onChange={(e) => handlePersonalDetailsChange('id_number', e.target.value)}
                    placeholder="Enter your ID or passport number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={personalDetails.occupation}
                    onChange={(e) => handlePersonalDetailsChange('occupation', e.target.value)}
                    placeholder="Enter your occupation"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Residence/Address
                  </label>
                  <input
                    type="text"
                    value={personalDetails.residence}
                    onChange={(e) => handlePersonalDetailsChange('residence', e.target.value)}
                    placeholder="Enter your residential address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Parents */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900">Parents</h2>
                  <p className="text-sm text-secondary-600 mt-1">
                    Add your parents (optional, maximum 2)
                  </p>
                </div>
                <button
                  onClick={addParent}
                  disabled={parents.length >= 2}
                  className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Parent
                </button>
              </div>

              {parents.map((parent, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 relative">
                  {parents.length > 1 && (
                    <button
                      onClick={() => removeParent(index)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}

                  <h3 className="text-sm font-medium text-secondary-700 mb-4">
                    Parent {index + 1}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={parent.name}
                        onChange={(e) => handleParentChange(index, 'name', e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={parent.date_of_birth}
                        onChange={(e) => handleParentChange(index, 'date_of_birth', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Nuclear Family */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900">Nuclear Family</h2>
                  <p className="text-sm text-secondary-600 mt-1">
                    Add your spouse and children (optional)
                  </p>
                </div>
                <button
                  onClick={addNuclearFamilyMember}
                  className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Member
                </button>
              </div>

              {nuclearFamily.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 relative">
                  {nuclearFamily.length > 1 && (
                    <button
                      onClick={() => removeNuclearFamilyMember(index)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}

                  <h3 className="text-sm font-medium text-secondary-700 mb-4">
                    Family Member {index + 1}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleNuclearFamilyChange(index, 'name', e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Relationship
                      </label>
                      <select
                        value={member.relationship}
                        onChange={(e) => handleNuclearFamilyChange(index, 'relationship', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select relationship</option>
                        {RELATIONSHIP_OPTIONS.nuclear.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={member.date_of_birth}
                        onChange={(e) => handleNuclearFamilyChange(index, 'date_of_birth', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Siblings */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900">Siblings</h2>
                  <p className="text-sm text-secondary-600 mt-1">
                    Add your brothers and sisters (optional)
                  </p>
                </div>
                <button
                  onClick={addSibling}
                  className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Sibling
                </button>
              </div>

              {siblings.map((sibling, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 relative">
                  {siblings.length > 1 && (
                    <button
                      onClick={() => removeSibling(index)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}

                  <h3 className="text-sm font-medium text-secondary-700 mb-4">
                    Sibling {index + 1}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={sibling.name}
                        onChange={(e) => handleSiblingChange(index, 'name', e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Relationship
                      </label>
                      <select
                        value={sibling.relationship}
                        onChange={(e) => handleSiblingChange(index, 'relationship', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select relationship</option>
                        {RELATIONSHIP_OPTIONS.sibling.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={sibling.date_of_birth}
                        onChange={(e) => handleSiblingChange(index, 'date_of_birth', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 5: Covered Persons */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900">Covered Persons</h2>
                  <p className="text-sm text-secondary-600 mt-1">
                    Add insured individuals covered under your benevolent fund (optional)
                  </p>
                </div>
                <button
                  onClick={addCoveredPerson}
                  className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Person
                </button>
              </div>

              {coveredPersons.map((person, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 relative">
                  {coveredPersons.length > 1 && (
                    <button
                      onClick={() => removeCoveredPerson(index)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}

                  <h3 className="text-sm font-medium text-secondary-700 mb-4">
                    Covered Person {index + 1}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) => handleCoveredPersonChange(index, 'name', e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Relationship
                      </label>
                      <input
                        type="text"
                        value={person.relationship}
                        onChange={(e) => handleCoveredPersonChange(index, 'relationship', e.target.value)}
                        placeholder="e.g., Child, Spouse, Parent"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={person.date_of_birth}
                        onChange={(e) => handleCoveredPersonChange(index, 'date_of_birth', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        ID Number
                      </label>
                      <input
                        type="text"
                        value={person.id_number}
                        onChange={(e) => handleCoveredPersonChange(index, 'id_number', e.target.value)}
                        placeholder="Optional ID number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 6: Next of Kin */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-secondary-900">Next of Kin / Beneficiary</h2>
                <p className="text-sm text-secondary-600 mt-1">
                  Provide your next of kin who will be the beneficiary
                </p>
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Note:</strong> If no next of kin is specified, the spouse will be the default beneficiary.
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nextOfKin.name}
                      onChange={(e) => handleNextOfKinChange('name', e.target.value)}
                      placeholder="Enter full name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Relationship <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nextOfKin.relationship}
                      onChange={(e) => handleNextOfKinChange('relationship', e.target.value)}
                      placeholder="e.g., Spouse, Sibling, Parent"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={nextOfKin.phone}
                      onChange={(e) => handleNextOfKinChange('phone', e.target.value)}
                      placeholder="+254..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={nextOfKin.email}
                      onChange={(e) => handleNextOfKinChange('email', e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Benefit Percentage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={nextOfKin.percentage}
                      onChange={(e) => handleNextOfKinChange('percentage', parseFloat(e.target.value))}
                      placeholder="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-secondary-500 mt-1">Percentage of benefits this person will receive (default: 100%)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Review */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-6">Review Your Information</h2>

              {/* Personal Details Summary */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-4">Personal Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-secondary-600">Date of Birth:</span>
                    <p className="font-medium">{personalDetails.date_of_birth || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-secondary-600">ID/Passport:</span>
                    <p className="font-medium">{personalDetails.id_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-secondary-600">Occupation:</span>
                    <p className="font-medium">{personalDetails.occupation || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-secondary-600">Residence:</span>
                    <p className="font-medium">{personalDetails.residence || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Parents Summary */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-4">Parents</h3>
                {parents.filter(p => p.name).length === 0 ? (
                  <p className="text-secondary-600 text-sm">No parents added</p>
                ) : (
                  <div className="space-y-2">
                    {parents.filter(p => p.name).map((parent, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="font-medium">{parent.name}</span>
                        <span className="text-secondary-600">
                          {parent.date_of_birth}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nuclear Family Summary */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-4">Nuclear Family</h3>
                {nuclearFamily.filter(m => m.name).length === 0 ? (
                  <p className="text-secondary-600 text-sm">No nuclear family members added</p>
                ) : (
                  <div className="space-y-2">
                    {nuclearFamily.filter(m => m.name).map((member, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="font-medium">{member.name}</span>
                        <span className="text-secondary-600">
                          {member.relationship} - {member.date_of_birth}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Siblings Summary */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-4">Siblings</h3>
                {siblings.filter(s => s.name).length === 0 ? (
                  <p className="text-secondary-600 text-sm">No siblings added</p>
                ) : (
                  <div className="space-y-2">
                    {siblings.filter(s => s.name).map((sibling, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="font-medium">{sibling.name}</span>
                        <span className="text-secondary-600">
                          {sibling.relationship} - {sibling.date_of_birth}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Covered Persons Summary */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-4">Covered Persons</h3>
                {coveredPersons.filter(cp => cp.name).length === 0 ? (
                  <p className="text-secondary-600 text-sm">No covered persons added</p>
                ) : (
                  <div className="space-y-2">
                    {coveredPersons.filter(cp => cp.name).map((person, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="font-medium">{person.name}</span>
                        <span className="text-secondary-600">
                          {person.relationship}
                          {person.date_of_birth && ` - ${person.date_of_birth}`}
                          {person.id_number && ` (ID: ${person.id_number})`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next of Kin Summary */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-4">Next of Kin / Beneficiary</h3>
                {nextOfKin.name && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{nextOfKin.name}</span>
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        {nextOfKin.percentage}% Benefit
                      </span>
                    </div>
                    <div className="text-sm text-secondary-600 space-y-1">
                      <p>Relationship: {nextOfKin.relationship}</p>
                      <p>Phone: {nextOfKin.phone}</p>
                      {nextOfKin.email && <p>Email: {nextOfKin.email}</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Please review all information carefully.
                  Once submitted, this information cannot be modified without contacting an administrator.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`inline-flex items-center px-6 py-2 rounded-md transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-secondary-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </button>

            {currentStep < 6 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
              >
                Next
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Complete Profile
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
