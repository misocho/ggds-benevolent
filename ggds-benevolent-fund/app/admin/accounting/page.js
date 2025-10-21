'use client'

import { useState, useEffect } from 'react'
import { contributionsAPI, membersAPI } from '../../../lib/api'
import { toast } from 'react-hot-toast'

const AdminAccountingPage = () => {
  const [contributions, setContributions] = useState([])
  const [allMembers, setAllMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [selectedContribution, setSelectedContribution] = useState(null)
  const [filters, setFilters] = useState({
    member_id: '',
    status: '',
    payment_method: ''
  })

  const [newContribution, setNewContribution] = useState({
    member_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'mpesa',
    transaction_reference: '',
    notes: ''
  })

  const [verifyData, setVerifyData] = useState({
    status: 'verified',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [contribsData, statsData, membersData] = await Promise.all([
        contributionsAPI.getAll(filters),
        contributionsAPI.getStats(),
        membersAPI.getAll({ limit: 100 })
      ])
      setContributions(contribsData.contributions)
      setStats(statsData)
      setAllMembers(membersData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(error.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddContribution = async (e) => {
    e.preventDefault()

    if (!newContribution.member_id || !newContribution.amount) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await contributionsAPI.create({
        ...newContribution,
        amount: parseFloat(newContribution.amount)
      })
      toast.success('Contribution recorded successfully')
      setShowAddModal(false)
      setNewContribution({
        member_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'mpesa',
        transaction_reference: '',
        notes: ''
      })
      fetchData()
    } catch (error) {
      console.error('Error adding contribution:', error)
      toast.error(error.message || 'Failed to record contribution')
    }
  }

  const handleVerifyContribution = async () => {
    if (!selectedContribution) return

    try {
      await contributionsAPI.verify(
        selectedContribution.id,
        verifyData.status,
        verifyData.notes || null
      )
      toast.success(`Contribution ${verifyData.status}`)
      setShowVerifyModal(false)
      setSelectedContribution(null)
      setVerifyData({ status: 'verified', notes: '' })
      fetchData()
    } catch (error) {
      console.error('Error verifying contribution:', error)
      toast.error(error.message || 'Failed to verify contribution')
    }
  }

  const openVerifyModal = (contribution) => {
    setSelectedContribution(contribution)
    setVerifyData({ status: 'verified', notes: '' })
    setShowVerifyModal(true)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg shadow p-6 border-2 border-green-200">
            <p className="text-sm font-medium text-green-700">Total Collected</p>
            <p className="text-3xl font-bold text-green-800 mt-2">
              KES {stats.total_collected.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-1">{stats.contribution_count} contributions</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6 border-2 border-yellow-200">
            <p className="text-sm font-medium text-yellow-700">Pending Verification</p>
            <p className="text-3xl font-bold text-yellow-800 mt-2">
              KES {stats.total_pending.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-6 border-2 border-blue-200">
            <p className="text-sm font-medium text-blue-700">Verified</p>
            <p className="text-3xl font-bold text-blue-800 mt-2">
              KES {stats.total_verified.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-6 border-2 border-purple-200">
            <p className="text-sm font-medium text-purple-700">Contributing Members</p>
            <p className="text-3xl font-bold text-purple-800 mt-2">{stats.member_count}</p>
            <p className="text-xs text-purple-600 mt-1">
              Avg: KES {stats.average_contribution.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Actions and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Contributions</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            + Record Contribution
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.member_id}
            onChange={(e) => setFilters({ ...filters, member_id: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">All Members</option>
            {allMembers.map((member) => (
              <option key={member.member_id} value={member.member_id}>
                {member.full_name} ({member.member_id})
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filters.payment_method}
            onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">All Payment Methods</option>
            <option value="mpesa">M-PESA</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Contributions Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading contributions...</p>
          </div>
        </div>
      ) : contributions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No contributions found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contributions.map((contribution) => (
                <tr key={contribution.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{contribution.member_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      KES {contribution.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(contribution.payment_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {contribution.payment_method.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contribution.transaction_reference || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(contribution.status)}`}>
                      {contribution.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {contribution.status === 'pending' && (
                      <button
                        onClick={() => openVerifyModal(contribution)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Verify
                      </button>
                    )}
                    {contribution.status !== 'pending' && (
                      <span className="text-gray-400">
                        {contribution.verified_date && `Verified ${new Date(contribution.verified_date).toLocaleDateString()}`}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Contribution Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Record New Contribution</h3>

            <form onSubmit={handleAddContribution} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member *
                </label>
                <select
                  value={newContribution.member_id}
                  onChange={(e) => setNewContribution({ ...newContribution, member_id: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select Member</option>
                  {allMembers.map((member) => (
                    <option key={member.member_id} value={member.member_id}>
                      {member.full_name} ({member.member_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (KES) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newContribution.amount}
                  onChange={(e) => setNewContribution({ ...newContribution, amount: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={newContribution.payment_date}
                  onChange={(e) => setNewContribution({ ...newContribution, payment_date: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={newContribution.payment_method}
                  onChange={(e) => setNewContribution({ ...newContribution, payment_method: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="mpesa">M-PESA</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  value={newContribution.transaction_reference}
                  onChange={(e) => setNewContribution({ ...newContribution, transaction_reference: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., M-PESA code, cheque number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newContribution.notes}
                  onChange={(e) => setNewContribution({ ...newContribution, notes: e.target.value })}
                  rows="3"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Optional notes"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Record Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Contribution Modal */}
      {showVerifyModal && selectedContribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Verify Contribution</h3>

            <div className="mb-4 bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 mb-1">Member: {selectedContribution.member_id}</p>
              <p className="text-sm text-gray-600 mb-1">
                Amount: <span className="font-bold">KES {selectedContribution.amount.toLocaleString()}</span>
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Payment Date: {new Date(selectedContribution.payment_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Method: {selectedContribution.payment_method.replace('_', ' ')}
              </p>
              {selectedContribution.transaction_reference && (
                <p className="text-sm text-gray-600">
                  Reference: {selectedContribution.transaction_reference}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action *
              </label>
              <select
                value={verifyData.status}
                onChange={(e) => setVerifyData({ ...verifyData, status: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="verified">Verify</option>
                <option value="rejected">Reject</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes {verifyData.status === 'rejected' && '*'}
              </label>
              <textarea
                value={verifyData.notes}
                onChange={(e) => setVerifyData({ ...verifyData, notes: e.target.value })}
                rows="3"
                className="w-full border rounded px-3 py-2"
                placeholder={verifyData.status === 'rejected' ? 'Provide reason for rejection...' : 'Optional notes...'}
                required={verifyData.status === 'rejected'}
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowVerifyModal(false)
                  setSelectedContribution(null)
                  setVerifyData({ status: 'verified', notes: '' })
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyContribution}
                className={`flex-1 px-4 py-2 rounded text-white transition-colors ${
                  verifyData.status === 'verified'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {verifyData.status === 'verified' ? 'Verify' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAccountingPage
