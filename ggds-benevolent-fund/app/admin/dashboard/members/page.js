'use client'

import { useState } from 'react'
import { PlusIcon, UserGroupIcon, MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function AdminMembersPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    surname: '',
    phone: '',
    email: ''
  })
  const [createdMember, setCreatedMember] = useState(null)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/admin/members/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create member')
      }

      const memberData = await response.json()
      setCreatedMember(memberData)
      toast.success('Member account created successfully!')

      // Reset form
      setFormData({
        first_name: '',
        middle_name: '',
        surname: '',
        phone: '',
        email: ''
      })
      setShowCreateForm(false)

    } catch (error) {
      console.error('Member creation error:', error)
      toast.error(error.message || 'Error creating member account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-2">
              <UserGroupIcon className="w-8 h-8 text-primary-500" />
              Member Management
            </h1>
            <p className="mt-2 text-secondary-600">
              Create and manage member accounts
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-3 text-white font-medium hover:bg-primary-600 transition-colors shadow-lg"
          >
            <PlusIcon className="w-5 h-5" />
            Create New Member
          </button>
        </div>

        {/* Create Member Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-secondary-900">Create New Member Account</h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setCreatedMember(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="John"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={formData.middle_name}
                        onChange={(e) => handleInputChange('middle_name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Michael"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Surname <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.surname}
                        onChange={(e) => handleInputChange('surname', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+254 700 123 456"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">
                      <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                      What happens next:
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1 ml-7">
                      <li>• Member ID will be auto-generated (GGDS-XXXX format)</li>
                      <li>• Initial password will be generated automatically</li>
                      <li>• Welcome email will be sent to the member with login credentials</li>
                      <li>• Member must complete their profile on first login</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setCreatedMember(null)
                    }}
                    className="flex-1 px-6 py-2 border border-gray-300 rounded-md font-medium text-secondary-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-6 py-2 rounded-md font-medium text-white transition-colors ${
                      isSubmitting
                        ? 'bg-primary-400 cursor-not-allowed'
                        : 'bg-primary-500 hover:bg-primary-600'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create Member Account'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {createdMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                <h2 className="text-2xl font-bold text-green-900 flex items-center gap-2">
                  <CheckCircleIcon className="w-8 h-8" />
                  Member Account Created Successfully!
                </h2>
              </div>

              <div className="p-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-sm text-secondary-600">Full Name</p>
                    <p className="text-lg font-semibold text-secondary-900">{createdMember.full_name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-secondary-600">Member ID</p>
                    <p className="text-lg font-semibold text-primary-600 font-mono">{createdMember.member_id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-secondary-600">Email</p>
                    <p className="text-lg font-semibold text-secondary-900">{createdMember.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-secondary-600">Phone</p>
                    <p className="text-lg font-semibold text-secondary-900">{createdMember.phone}</p>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm font-medium text-yellow-900 mb-2">Initial Password (Store Securely)</p>
                    <p className="text-xl font-mono font-bold text-yellow-900">{createdMember.initial_password}</p>
                  </div>
                </div>

                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    ✉️ A welcome email has been sent to <strong>{createdMember.email}</strong> with the login credentials.
                  </p>
                </div>

                <button
                  onClick={() => setCreatedMember(null)}
                  className="mt-6 w-full px-6 py-3 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Members List Placeholder */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">All Members</h2>
            <div className="flex items-center gap-2">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="text-center py-12 text-secondary-600">
            <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Member list will be displayed here</p>
            <p className="text-sm">Create your first member to get started</p>
          </div>
        </div>
      </div>
    </div>
  )
}
