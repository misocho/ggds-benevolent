'use client'

import { useState, useEffect } from 'react'
import { adminAPI, casesAPI } from '../../../lib/api'
import { toast } from 'react-hot-toast'

const AdminCasesPage = () => {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [actionType, setActionType] = useState(null) // 'approve' or 'reject'
  const [notes, setNotes] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    case_type: '',
    urgency: '',
    sort_by: 'created_at',
    order: 'desc'
  })

  useEffect(() => {
    fetchCases()
  }, [filters])

  const fetchCases = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getCases(filters)
      setCases(data)
    } catch (error) {
      console.error('Error fetching cases:', error)
      toast.error(error.message || 'Failed to load cases')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedCase || !actionType) return

    if (actionType === 'reject' && !notes.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    try {
      if (actionType === 'approve') {
        await adminAPI.approveCase(selectedCase.case_id, notes.trim() || null)
        toast.success('Case approved successfully')
      } else {
        await adminAPI.rejectCase(selectedCase.case_id, notes.trim())
        toast.success('Case rejected')
      }

      setShowModal(false)
      setSelectedCase(null)
      setNotes('')
      setActionType(null)
      fetchCases()
    } catch (error) {
      console.error('Error processing case:', error)
      toast.error(error.message || 'Failed to process case')
    }
  }

  const openActionModal = (caseItem, type) => {
    setSelectedCase(caseItem)
    setActionType(type)
    setNotes('')
    setShowModal(true)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      disbursed: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getUrgencyBadge = (urgency) => {
    const badges = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return badges[urgency] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="disbursed">Disbursed</option>
          </select>

          <select
            value={filters.case_type}
            onChange={(e) => setFilters({ ...filters, case_type: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="medical">Medical</option>
            <option value="funeral">Funeral</option>
            <option value="education">Education</option>
            <option value="emergency">Emergency</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filters.urgency}
            onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">All Urgency</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={filters.sort_by}
            onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="created_at">Date Submitted</option>
            <option value="urgency">Urgency</option>
            <option value="requested_amount">Amount</option>
          </select>

          <select
            value={filters.order}
            onChange={(e) => setFilters({ ...filters, order: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cases...</p>
          </div>
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No cases found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((caseItem) => (
            <div key={caseItem.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{caseItem.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Member: {caseItem.member?.full_name} ({caseItem.member?.member_id})
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(caseItem.status)}`}>
                    {caseItem.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(caseItem.urgency_level)}`}>
                    {caseItem.urgency_level?.toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Case Type</p>
                  <p className="font-medium capitalize">{caseItem.case_type?.replace('_', ' ') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="font-medium">{new Date(caseItem.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700">{caseItem.description}</p>
              </div>

              {caseItem.supporting_documents && caseItem.supporting_documents.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Supporting Documents:</p>
                  <div className="flex flex-wrap gap-2">
                    {caseItem.supporting_documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Document {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {caseItem.verification_contacts && caseItem.verification_contacts.length > 0 && (
                <div className="mb-4 bg-gray-50 p-3 rounded">
                  <p className="text-xs font-medium text-gray-700 mb-2">Verification Contacts:</p>
                  {caseItem.verification_contacts.map((contact, idx) => (
                    <div key={idx} className="text-xs text-gray-600 mb-1">
                      {contact.name} - {contact.relationship} ({contact.phone})
                    </div>
                  ))}
                </div>
              )}

              {caseItem.status === 'pending' || caseItem.status === 'under_review' ? (
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => openActionModal(caseItem, 'approve')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => openActionModal(caseItem, 'reject')}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    ✗ Reject
                  </button>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    {caseItem.reviewer_notes && (
                      <>
                        <span className="font-medium">Admin Notes:</span> {caseItem.reviewer_notes}
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === 'approve' ? 'Approve Case' : 'Reject Case'}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Case ID: {selectedCase?.case_id}</p>
              <p className="text-sm text-gray-600 mb-2">Type: {selectedCase?.case_type?.replace('_', ' ')}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionType === 'approve' ? 'Notes (optional)' : 'Reason for Rejection *'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="4"
                className="w-full border rounded px-3 py-2"
                placeholder={actionType === 'approve' ? 'Add any notes...' : 'Provide reason for rejection...'}
                required={actionType === 'reject'}
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedCase(null)
                  setNotes('')
                  setActionType(null)
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 px-4 py-2 rounded text-white transition-colors ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCasesPage
