'use client'

import { useState } from 'react'
import { DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Apply() {
  const [formData, setFormData] = useState({
    memberName: '',
    memberNumber: '',
    email: '',
    phone: '',
    claimType: '',
    beneficiaryName: '',
    relationship: '',
    dateOfEvent: '',
    description: '',
    documents: []
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }))
  }

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Your application has been submitted successfully. We will contact you within 5-7 business days.')
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h1 className="text-3xl font-bold text-secondary-900 sm:text-4xl">Apply for Support</h1>
          <p className="mt-4 text-xl text-secondary-600">
            Submit your application for benevolent fund assistance
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Member Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="memberName" className="block text-sm font-medium text-secondary-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="memberName"
                    id="memberName"
                    required
                    value={formData.memberName}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="memberNumber" className="block text-sm font-medium text-secondary-700 mb-1">
                    Member Number *
                  </label>
                  <input
                    type="text"
                    name="memberNumber"
                    id="memberNumber"
                    required
                    value={formData.memberNumber}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Claim Details</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="claimType" className="block text-sm font-medium text-secondary-700 mb-1">
                    Type of Support Requested *
                  </label>
                  <select
                    name="claimType"
                    id="claimType"
                    required
                    value={formData.claimType}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select claim type</option>
                    <option value="bereavement">Bereavement/Funeral</option>
                    <option value="hospitalization">Hospitalization</option>
                    <option value="disability">Disability</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="beneficiaryName" className="block text-sm font-medium text-secondary-700 mb-1">
                      Beneficiary/Affected Person's Name *
                    </label>
                    <input
                      type="text"
                      name="beneficiaryName"
                      id="beneficiaryName"
                      required
                      value={formData.beneficiaryName}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="relationship" className="block text-sm font-medium text-secondary-700 mb-1">
                      Relationship to Member *
                    </label>
                    <select
                      name="relationship"
                      id="relationship"
                      required
                      value={formData.relationship}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="">Select relationship</option>
                      <option value="self">Self</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="parent">Parent</option>
                      <option value="parent-in-law">Parent-in-law</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="dateOfEvent" className="block text-sm font-medium text-secondary-700 mb-1">
                    Date of Event *
                  </label>
                  <input
                    type="date"
                    name="dateOfEvent"
                    id="dateOfEvent"
                    required
                    value={formData.dateOfEvent}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">
                    Brief Description of Circumstances *
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={4}
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Please provide details about the event and circumstances..."
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Required Documents</h2>
              <div className="bg-primary-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-primary-800">
                  Please upload the following documents based on your claim type:
                </p>
                <ul className="mt-2 text-sm text-primary-700 space-y-1">
                  <li>• Bereavement: Death certificate, ID copy, proof of relationship</li>
                  <li>• Hospitalization: Medical reports, hospital admission forms, receipts</li>
                  <li>• Disability: Medical certificate, specialist reports</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Upload Documents *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="block w-full text-sm text-secondary-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <p className="mt-1 text-sm text-secondary-500">
                  PDF, JPG, PNG, DOC files up to 10MB each
                </p>

                {formData.documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md p-2">
                        <div className="flex items-center">
                          <DocumentIcon className="h-5 w-5 text-secondary-400 mr-2" />
                          <span className="text-sm text-secondary-700">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="bg-accent-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-secondary-900 mb-2">Processing Timeline</h3>
                <p className="text-sm text-secondary-600">
                  Applications are processed within 5-7 business days. You will be contacted via phone or email regarding the status of your application.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-secondary-700 shadow-sm hover:bg-gray-50"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}