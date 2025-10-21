'use client'

import { useState, useEffect } from 'react'
import { adminAPI, membersAPI, contributionsAPI } from '../../../lib/api'
import { toast } from 'react-hot-toast'

const AdminMembersPage = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [memberDetails, setMemberDetails] = useState(null)
  const [contributionSummary, setContributionSummary] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  })

  useEffect(() => {
    fetchMembers()
  }, [filters])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getMembers(filters)
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error(error.message || 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const viewMemberDetails = async (member) => {
    try {
      setSelectedMember(member)
      setShowModal(true)
      setMemberDetails(null)
      setContributionSummary(null)

      // Fetch detailed member info and contribution summary
      const [details, contribSummary] = await Promise.all([
        membersAPI.getById(member.member_id),
        contributionsAPI.getMemberSummary(member.member_id)
      ])

      setMemberDetails(details)
      setContributionSummary(contribSummary)
    } catch (error) {
      console.error('Error fetching member details:', error)
      toast.error(error.message || 'Failed to load member details')
    }
  }

  const handleActivateMember = async (memberId) => {
    try {
      await adminAPI.activateMember(memberId)
      toast.success('Member activated successfully')
      fetchMembers()
      if (showModal) setShowModal(false)
    } catch (error) {
      console.error('Error activating member:', error)
      toast.error(error.message || 'Failed to activate member')
    }
  }

  const handleSuspendMember = async (memberId) => {
    if (!confirm('Are you sure you want to suspend this member?')) return

    try {
      await adminAPI.suspendMember(memberId)
      toast.success('Member suspended')
      fetchMembers()
      if (showModal) setShowModal(false)
    } catch (error) {
      console.error('Error suspending member:', error)
      toast.error(error.message || 'Failed to suspend member')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by name or member ID..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Members Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Members</p>
          <p className="text-2xl font-bold text-gray-800">{members.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <p className="text-sm text-green-700">Active</p>
          <p className="text-2xl font-bold text-green-800">
            {members.filter(m => m.status === 'active').length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
          <p className="text-sm text-yellow-700">Pending</p>
          <p className="text-2xl font-bold text-yellow-800">
            {members.filter(m => m.status === 'pending').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
          <p className="text-sm text-red-700">Suspended</p>
          <p className="text-2xl font-bold text-red-800">
            {members.filter(m => m.status === 'suspended').length}
          </p>
        </div>
      </div>

      {/* Members Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading members...</p>
          </div>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No members found</p>
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
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.member_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                      <div className="text-sm text-gray-500">{member.member_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.email}</div>
                    <div className="text-sm text-gray-500">{member.phone_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(member.status)}`}>
                      {member.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => viewMemberDetails(member)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View Details
                    </button>
                    {member.status === 'pending' && (
                      <button
                        onClick={() => handleActivateMember(member.member_id)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Activate
                      </button>
                    )}
                    {member.status === 'active' && (
                      <button
                        onClick={() => handleSuspendMember(member.member_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Suspend
                      </button>
                    )}
                    {member.status === 'suspended' && (
                      <button
                        onClick={() => handleActivateMember(member.member_id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Member Details Modal */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-semibold">{selectedMember.full_name}</h3>
                <p className="text-gray-600">{selectedMember.member_id}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {memberDetails ? (
              <div className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm">{memberDetails.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm">{memberDetails.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="text-sm">{memberDetails.date_of_birth}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="text-sm capitalize">{memberDetails.gender}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm">{memberDetails.physical_address}</p>
                    </div>
                  </div>
                </div>

                {/* Employment */}
                {memberDetails.employer_name && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Employment</h4>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                      <div>
                        <p className="text-xs text-gray-500">Employer</p>
                        <p className="text-sm">{memberDetails.employer_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="text-sm">{memberDetails.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Position</p>
                        <p className="text-sm">{memberDetails.position}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Employee Number</p>
                        <p className="text-sm">{memberDetails.employee_number}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next of Kin */}
                {memberDetails.next_of_kin_name && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Next of Kin</h4>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm">{memberDetails.next_of_kin_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Relationship</p>
                        <p className="text-sm">{memberDetails.next_of_kin_relationship}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm">{memberDetails.next_of_kin_phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contribution Summary */}
                {contributionSummary && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Contribution Summary</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded border border-green-200">
                        <p className="text-xs text-green-700">Total Contributed</p>
                        <p className="text-xl font-bold text-green-800">
                          KES {contributionSummary.total_contributions.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {contributionSummary.contribution_count} contributions
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded border border-blue-200">
                        <p className="text-xs text-blue-700">Verified</p>
                        <p className="text-xl font-bold text-blue-800">
                          KES {contributionSummary.verified_amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-700">Pending</p>
                        <p className="text-xl font-bold text-yellow-800">
                          KES {contributionSummary.pending_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {contributionSummary.last_contribution_date && (
                      <p className="text-sm text-gray-600 mt-3">
                        Last contribution: {new Date(contributionSummary.last_contribution_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t">
                  {selectedMember.status === 'pending' && (
                    <button
                      onClick={() => handleActivateMember(selectedMember.member_id)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Activate Member
                    </button>
                  )}
                  {selectedMember.status === 'active' && (
                    <button
                      onClick={() => handleSuspendMember(selectedMember.member_id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Suspend Member
                    </button>
                  )}
                  {selectedMember.status === 'suspended' && (
                    <button
                      onClick={() => handleActivateMember(selectedMember.member_id)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Reactivate Member
                    </button>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading member details...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMembersPage
