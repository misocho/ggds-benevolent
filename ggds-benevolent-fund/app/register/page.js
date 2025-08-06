'use client'

import { useState } from 'react'
import { UserIcon, UserGroupIcon, HeartIcon, PhoneIcon, EnvelopeIcon, IdentificationIcon } from '@heroicons/react/24/outline'

export default function Register() {
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    idNumber: '',
    occupation: '',
    residence: '',
    
    // Nuclear Family (up to 12 members)
    nuclearFamily: Array(12).fill({ name: '', relationship: '', dateOfBirth: '' }),
    
    // Siblings (up to 15)
    siblings: Array(15).fill({ name: '', relationship: '', dateOfBirth: '' }),
    
    // Next of Kin (2 required)
    nextOfKin: [
      { name: '', relationship: '', phone: '', email: '' },
      { name: '', relationship: '', phone: '', email: '' }
    ]
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const handleInputChange = (section, index, field, value) => {
    if (section === 'personal') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
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

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Here you would typically send the data to your backend
    alert('Registration submitted successfully!')
  }

  const FamilyMemberInputs = ({ members, section, title, maxMembers }) => (
    <div className="space-y-4">
      <h4 className="font-medium text-secondary-900 mb-4">{title} (Maximum {maxMembers})</h4>
      {members.slice(0, maxMembers).map((member, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg">
          <h5 className="text-sm font-medium text-secondary-700 mb-3">{title.slice(0, -1)} #{index + 1}</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={member.name}
                onChange={(e) => handleInputChange(section, index, 'name', e.target.value)}
                className="w-full"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Relationship
              </label>
              <select
                value={member.relationship}
                onChange={(e) => handleInputChange(section, index, 'relationship', e.target.value)}
                className="w-full"
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
                    <option value="half-brother">Half Brother</option>
                    <option value="half-sister">Half Sister</option>
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
                onChange={(e) => handleInputChange(section, index, 'dateOfBirth', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 ${
                    step < currentStep ? 'bg-primary-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-sm text-secondary-600">
            <span>Personal Details</span>
            <span>Nuclear Family</span>
            <span>Siblings</span>
            <span>Next of Kin</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-primary-500" />
              Member Registration
            </h1>
            <p className="mt-1 text-secondary-600">
              Please provide accurate information for all sections
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <IdentificationIcon className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-secondary-900">Personal Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('personal', 0, 'fullName', e.target.value)}
                      className="w-full"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('personal', 0, 'dateOfBirth', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('personal', 0, 'phone', e.target.value)}
                      className="w-full"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('personal', 0, 'email', e.target.value)}
                      className="w-full"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      ID Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.idNumber}
                      onChange={(e) => handleInputChange('personal', 0, 'idNumber', e.target.value)}
                      className="w-full"
                      placeholder="National ID or Passport Number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('personal', 0, 'occupation', e.target.value)}
                      className="w-full"
                      placeholder="Your profession or job title"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Current Residence
                  </label>
                  <textarea
                    value={formData.residence}
                    onChange={(e) => handleInputChange('personal', 0, 'residence', e.target.value)}
                    className="w-full"
                    rows={3}
                    placeholder="Full address including city, state, and country"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Nuclear Family */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <UserGroupIcon className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-secondary-900">Nuclear Family Members</h3>
                </div>
                <p className="text-secondary-600 mb-4">
                  Add your immediate family members (spouse, children, parents). Maximum 12 members.
                </p>
                <FamilyMemberInputs 
                  members={formData.nuclearFamily}
                  section="nuclearFamily"
                  title="Nuclear Family Members"
                  maxMembers={12}
                />
              </div>
            )}

            {/* Step 3: Siblings */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <UserGroupIcon className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-secondary-900">Siblings</h3>
                </div>
                <p className="text-secondary-600 mb-4">
                  Add your brothers and sisters. Maximum 15 siblings.
                </p>
                <FamilyMemberInputs 
                  members={formData.siblings}
                  section="siblings"
                  title="Siblings"
                  maxMembers={15}
                />
              </div>
            )}

            {/* Step 4: Next of Kin */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <HeartIcon className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-secondary-900">Next of Kin</h3>
                </div>
                <p className="text-secondary-600 mb-4">
                  Provide details for two next of kin contacts.
                </p>

                {formData.nextOfKin.map((kin, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium text-secondary-900 mb-4">Next of Kin #{index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={kin.name}
                          onChange={(e) => handleInputChange('nextOfKin', index, 'name', e.target.value)}
                          className="w-full"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Relationship *
                        </label>
                        <select
                          required
                          value={kin.relationship}
                          onChange={(e) => handleInputChange('nextOfKin', index, 'relationship', e.target.value)}
                          className="w-full"
                        >
                          <option value="">Select relationship</option>
                          <option value="parent">Parent</option>
                          <option value="spouse">Spouse</option>
                          <option value="sibling">Sibling</option>
                          <option value="child">Child</option>
                          <option value="friend">Friend</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={kin.phone}
                          onChange={(e) => handleInputChange('nextOfKin', index, 'phone', e.target.value)}
                          className="w-full"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={kin.email}
                          onChange={(e) => handleInputChange('nextOfKin', index, 'email', e.target.value)}
                          className="w-full"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
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
                  className="px-6 py-2 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-2 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 transition-colors"
                >
                  Submit Registration
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}