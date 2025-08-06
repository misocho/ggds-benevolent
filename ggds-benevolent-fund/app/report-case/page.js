'use client'

import { useState } from 'react'
import { DocumentTextIcon, ExclamationTriangleIcon, CheckCircleIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline'

export default function ReportCase() {
  const [formData, setFormData] = useState({
    // Case Details
    caseType: '',
    caseDescription: '',
    reportingReason: '',
    incidentDate: '',
    urgencyLevel: 'medium',
    
    // Member Information
    memberName: '',
    memberId: '',
    relationship: '',
    
    // Verification Information
    villageElder: {
      name: '',
      phone: '',
      email: ''
    },
    assistantChief: {
      name: '',
      phone: '',
      email: ''
    },
    chief: {
      name: '',
      phone: '',
      email: ''
    },
    referee: {
      name: '',
      phone: '',
      email: '',
      relationship: ''
    },
    
    // Supporting Documents
    documents: []
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (section, field, value) => {
    if (section === 'case' || section === 'member') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }))
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }))
  }

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Here you would typically send the data to your backend
      console.log('Case report submitted:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Case report submitted successfully! You will receive a confirmation email shortly.')
      
      // Reset form or redirect
      setFormData({
        caseType: '',
        caseDescription: '',
        reportingReason: '',
        incidentDate: '',
        urgencyLevel: 'medium',
        memberName: '',
        memberId: '',
        relationship: '',
        villageElder: { name: '', phone: '', email: '' },
        assistantChief: { name: '', phone: '', email: '' },
        chief: { name: '', phone: '', email: '' },
        referee: { name: '', phone: '', email: '', relationship: '' },
        documents: []
      })
      setCurrentStep(1)
    } catch (error) {
      alert('Error submitting case report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const VerificationPersonInputs = ({ person, section, title, required = true }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium text-secondary-900 mb-3">
        {title} {required && <span className="text-red-500">*</span>}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Full Name {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            required={required}
            value={person.name}
            onChange={(e) => handleInputChange(section, 'name', e.target.value)}
            className="w-full"
            placeholder="Enter full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Phone Number {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="tel"
            required={required}
            value={person.phone}
            onChange={(e) => handleInputChange(section, 'phone', e.target.value)}
            className="w-full"
            placeholder="+254 (700) 123-456"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={person.email}
            onChange={(e) => handleInputChange(section, 'email', e.target.value)}
            className="w-full"
            placeholder="email@example.com"
          />
        </div>
        {section === 'referee' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Relationship to Member {required && <span className="text-red-500">*</span>}
            </label>
            <select
              required={required}
              value={person.relationship}
              onChange={(e) => handleInputChange(section, 'relationship', e.target.value)}
              className="w-full"
            >
              <option value="">Select relationship</option>
              <option value="family">Family Member</option>
              <option value="friend">Friend</option>
              <option value="neighbor">Neighbor</option>
              <option value="colleague">Colleague</option>
              <option value="community-leader">Community Leader</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}
      </div>
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
            <span>Case Details</span>
            <span>Member Info</span>
            <span>Verification</span>
            <span>Documents</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-primary-500" />
              Report a Case
            </h1>
            <p className="mt-1 text-secondary-600">
              Submit a case report for benevolent fund support
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Case Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <DocumentTextIcon className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-secondary-900">Case Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Type of Case <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.caseType}
                      onChange={(e) => handleInputChange('case', 'caseType', e.target.value)}
                      className="w-full"
                    >
                      <option value="">Select case type</option>
                      <option value="bereavement">Bereavement</option>
                      <option value="medical-emergency">Medical Emergency</option>
                      <option value="disability">Disability</option>
                      <option value="fire-damage">Fire Damage</option>
                      <option value="natural-disaster">Natural Disaster</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Incident Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.incidentDate}
                      onChange={(e) => handleInputChange('case', 'incidentDate', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Urgency Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.urgencyLevel}
                      onChange={(e) => handleInputChange('case', 'urgencyLevel', e.target.value)}
                      className="w-full"
                    >
                      <option value="low">Low - Can wait for regular processing</option>
                      <option value="medium">Medium - Needs attention within a week</option>
                      <option value="high">High - Urgent, needs immediate attention</option>
                      <option value="critical">Critical - Emergency situation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Case Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.caseDescription}
                    onChange={(e) => handleInputChange('case', 'caseDescription', e.target.value)}
                    className="w-full"
                    rows={4}
                    placeholder="Provide a detailed description of the case, including circumstances, timeline, and current situation..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Reason for Reporting <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.reportingReason}
                    onChange={(e) => handleInputChange('case', 'reportingReason', e.target.value)}
                    className="w-full"
                    rows={3}
                    placeholder="Explain why you are reporting this case and what support is needed..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Member Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <UserIcon className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-secondary-900">Member Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Affected Member Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.memberName}
                      onChange={(e) => handleInputChange('member', 'memberName', e.target.value)}
                      className="w-full"
                      placeholder="Full name of the affected member"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Member ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.memberId}
                      onChange={(e) => handleInputChange('member', 'memberId', e.target.value)}
                      className="w-full"
                      placeholder="GGDS member identification number"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Your Relationship to Member <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.relationship}
                      onChange={(e) => handleInputChange('member', 'relationship', e.target.value)}
                      className="w-full"
                    >
                      <option value="">Select your relationship</option>
                      <option value="self">Self (I am the member)</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="family">Other Family Member</option>
                      <option value="friend">Friend</option>
                      <option value="representative">Authorized Representative</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Verification Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircleIcon className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-secondary-900">Verification Contacts</h3>
                </div>
                <p className="text-secondary-600 mb-4">
                  Provide contact information for local authorities and a personal referee who can verify this case.
                </p>

                <div className="space-y-6">
                  <VerificationPersonInputs 
                    person={formData.villageElder}
                    section="villageElder"
                    title="Village Elder"
                  />
                  
                  <VerificationPersonInputs 
                    person={formData.assistantChief}
                    section="assistantChief"
                    title="Assistant Chief"
                  />
                  
                  <VerificationPersonInputs 
                    person={formData.chief}
                    section="chief"
                    title="Chief"
                  />
                  
                  <VerificationPersonInputs 
                    person={formData.referee}
                    section="referee"
                    title="Personal Referee"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Supporting Documents */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <DocumentTextIcon className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-secondary-900">Supporting Documents</h3>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-secondary-900">
                          Upload supporting documents
                        </span>
                        <span className="mt-1 block text-sm text-secondary-600">
                          ID copies, medical reports, death certificates, etc.
                        </span>
                      </label>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleFileUpload}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                        onClick={() => document.getElementById('file-upload').click()}
                      >
                        Choose Files
                      </button>
                    </div>
                  </div>
                </div>

                {formData.documents.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-secondary-900 mb-3">Uploaded Documents:</h4>
                    <ul className="space-y-2">
                      {formData.documents.map((doc, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm text-secondary-700">{doc.name}</span>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Document Requirements
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Copy of member's ID or passport</li>
                          <li>Relevant medical reports (for medical cases)</li>
                          <li>Death certificate (for bereavement cases)</li>
                          <li>Police report (if applicable)</li>
                          <li>Any other supporting evidence</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
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
                  disabled={isSubmitting}
                  className={`px-8 py-2 rounded-md font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-primary-400 text-white cursor-not-allowed'
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Case Report'
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