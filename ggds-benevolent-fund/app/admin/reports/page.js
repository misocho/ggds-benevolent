'use client'

import { useState, useEffect } from 'react'
import { reportsAPI, adminAPI } from '../../../lib/api'
import { toast } from 'react-hot-toast'

const AdminReportsPage = () => {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [memberReports, setMemberReports] = useState(null)
  const [caseReports, setCaseReports] = useState(null)
  const [financialReports, setFinancialReports] = useState(null)
  const [adminStats, setAdminStats] = useState(null)

  useEffect(() => {
    fetchAllReports()
  }, [])

  const fetchAllReports = async () => {
    try {
      setLoading(true)
      const [membersData, casesData, financialData, statsData] = await Promise.all([
        reportsAPI.getMembers(),
        reportsAPI.getCases(),
        reportsAPI.getFinancial(),
        adminAPI.getStats()
      ])

      setMemberReports(membersData)
      setCaseReports(casesData)
      setFinancialReports(financialData)
      setAdminStats(statsData)
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error(error.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error('No data to export')
      return
    }

    // Convert data to CSV format
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).join(',')).join('\n')
    const csv = `${headers}\n${rows}`

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('Report exported successfully')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
        <button
          onClick={() => window.print()}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          🖨️ Print
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setActiveTab('cases')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'cases'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cases
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'financial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Financial
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && adminStats && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">System Overview</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Members Card */}
                <div className="bg-blue-50 rounded-lg shadow p-6 border-2 border-blue-200">
                  <p className="text-sm font-medium text-blue-700">Total Members</p>
                  <p className="text-3xl font-bold text-blue-800 mt-2">{adminStats.total_members}</p>
                  <div className="mt-2 text-xs text-blue-600">
                    <p>Active: {adminStats.active_members}</p>
                    <p>Pending: {adminStats.pending_members}</p>
                    <p>Suspended: {adminStats.suspended_members}</p>
                  </div>
                </div>

                {/* Cases Card */}
                <div className="bg-green-50 rounded-lg shadow p-6 border-2 border-green-200">
                  <p className="text-sm font-medium text-green-700">Total Cases</p>
                  <p className="text-3xl font-bold text-green-800 mt-2">{adminStats.total_cases}</p>
                  <div className="mt-2 text-xs text-green-600">
                    <p>Pending: {adminStats.pending_cases}</p>
                    <p>Active: {adminStats.active_cases}</p>
                  </div>
                </div>

                {/* Financial Card */}
                <div className="bg-purple-50 rounded-lg shadow p-6 border-2 border-purple-200">
                  <p className="text-sm font-medium text-purple-700">Total Collected</p>
                  <p className="text-3xl font-bold text-purple-800 mt-2">
                    KES {financialReports?.summary.total_verified.toLocaleString() || 0}
                  </p>
                  <div className="mt-2 text-xs text-purple-600">
                    <p>Contributions: {financialReports?.summary.contribution_count || 0}</p>
                    <p>Avg: KES {financialReports?.summary.average_contribution.toLocaleString() || 0}</p>
                  </div>
                </div>

                {/* Activity Card */}
                <div className="bg-yellow-50 rounded-lg shadow p-6 border-2 border-yellow-200">
                  <p className="text-sm font-medium text-yellow-700">Last 30 Days</p>
                  <div className="mt-2">
                    <p className="text-sm text-yellow-800">
                      <span className="font-bold">{adminStats.recent_activity.members_last_30_days}</span> new members
                    </p>
                    <p className="text-sm text-yellow-800">
                      <span className="font-bold">{adminStats.recent_activity.cases_last_30_days}</span> new cases
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-semibold mb-3">Cases by Status</h4>
                  <div className="space-y-2">
                    {Object.entries(adminStats.cases_by_status).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-semibold mb-3">Cases by Type</h4>
                  <div className="space-y-2">
                    {Object.entries(adminStats.cases_by_type).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && memberReports && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Member Reports</h3>
                <button
                  onClick={() => exportToCSV(memberReports.recent_registrations, 'member_report')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                >
                  📥 Export CSV
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-4">
                  <p className="text-xs text-gray-500">Total Members</p>
                  <p className="text-2xl font-bold">{memberReports.summary.total_members}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                  <p className="text-xs text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600">{memberReports.summary.active_members}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{memberReports.summary.pending_members}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                  <p className="text-xs text-gray-500">Suspended</p>
                  <p className="text-2xl font-bold text-red-600">{memberReports.summary.suspended_members}</p>
                </div>
              </div>

              {/* Recent Registrations Table */}
              <div className="bg-white rounded-lg border overflow-hidden">
                <h4 className="font-semibold p-4 border-b">Recent Registrations (Last 30 Days)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Join Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {memberReports.recent_registrations.map((member) => (
                        <tr key={member.member_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {member.member_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {member.full_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.status === 'active' ? 'bg-green-100 text-green-800' :
                              member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {member.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(member.join_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Cases Tab */}
          {activeTab === 'cases' && caseReports && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Case Reports</h3>
                <button
                  onClick={() => exportToCSV(caseReports.recent_cases, 'case_report')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                >
                  📥 Export CSV
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-4">
                  <p className="text-xs text-gray-500">Total Cases</p>
                  <p className="text-2xl font-bold">{caseReports.summary.total_cases}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{caseReports.summary.pending_cases}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                  <p className="text-xs text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{caseReports.summary.approved_cases}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                  <p className="text-xs text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{caseReports.summary.rejected_cases}</p>
                </div>
              </div>

              {/* Recent Cases Table */}
              <div className="bg-white rounded-lg border overflow-hidden">
                <h4 className="font-semibold p-4 border-b">Recent Cases (Last 30 Days)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Case ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Urgency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {caseReports.recent_cases.map((caseItem) => (
                        <tr key={caseItem.case_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {caseItem.case_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {caseItem.case_type.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              caseItem.urgency_level === 'high' ? 'bg-red-100 text-red-800' :
                              caseItem.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {caseItem.urgency_level.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              caseItem.status === 'approved' ? 'bg-green-100 text-green-800' :
                              caseItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {caseItem.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(caseItem.submitted_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && financialReports && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Financial Reports</h3>
                <button
                  onClick={() => exportToCSV(financialReports.top_contributors, 'financial_report')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                >
                  📥 Export CSV
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-4">
                  <p className="text-xs text-gray-500">Total Collected</p>
                  <p className="text-2xl font-bold">KES {financialReports.summary.total_collected.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                  <p className="text-xs text-gray-500">Verified</p>
                  <p className="text-2xl font-bold text-green-600">KES {financialReports.summary.total_verified.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">KES {financialReports.summary.total_pending.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                  <p className="text-xs text-gray-500">Avg Contribution</p>
                  <p className="text-2xl font-bold text-blue-600">KES {financialReports.summary.average_contribution.toLocaleString()}</p>
                </div>
              </div>

              {/* Top Contributors Table */}
              <div className="bg-white rounded-lg border overflow-hidden">
                <h4 className="font-semibold p-4 border-b">Top Contributors</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Contributed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contributions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {financialReports.top_contributors.map((contributor, index) => (
                        <tr key={contributor.member_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {contributor.member_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                            KES {contributor.total_contributed.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contributor.contribution_count} payments
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminReportsPage
