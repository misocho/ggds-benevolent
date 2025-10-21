'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  UserIcon,
  DocumentTextIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { dashboardAPI, authAPI } from '../../lib/api'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [cases, setCases] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Check if user is authenticated
      if (!authAPI.isAuthenticated()) {
        toast.error('Please sign in to access the dashboard')
        router.push('/signin')
        return
      }

      // Get current user from localStorage
      const currentUser = authAPI.getCurrentUser()

      // Redirect admins to admin dashboard
      if (currentUser && currentUser.role === 'admin') {
        router.push('/admin/dashboard')
        return
      }

      // Load dashboard stats
      const dashboardStats = await dashboardAPI.getStats()

      if (!dashboardStats.has_member_profile) {
        toast.error('Please complete your member registration first')
        router.push('/register')
        return
      }

      setStats(dashboardStats)

      // Set user data from stats
      setUser({
        name: dashboardStats.member_name,
        memberId: dashboardStats.member_id,
        email: currentUser.email,
        status: dashboardStats.member_status
      })

      // Load cases
      const casesData = await dashboardAPI.getCases()
      setCases(casesData.cases || [])

    } catch (error) {
      console.error('Dashboard load error:', error)

      if (error.status === 401) {
        toast.error('Session expired. Please sign in again.')
        router.push('/signin')
      } else if (error.status === 404) {
        toast.error('Please complete your member registration')
        router.push('/register')
      } else {
        toast.error('Error loading dashboard data')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'under review': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'high':
      case 'critical':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
      case 'medium': return <ClockIcon className="w-4 h-4 text-yellow-500" />
      case 'low': return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      default: return <ClockIcon className="w-4 h-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !stats) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Member Dashboard</h1>
              <p className="text-secondary-600">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-secondary-400 hover:text-secondary-600 relative">
                <BellIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  2
                </span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-secondary-900 font-medium">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center pb-6 border-b border-gray-200">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-secondary-900">{user.name}</h3>
                <p className="text-sm text-secondary-600">Member ID: {user.memberId}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                  {user.status}
                </span>
              </div>

              <nav className="mt-6 space-y-1">
                {[
                  { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                  { id: 'profile', name: 'My Profile', icon: UserIcon },
                  { id: 'cases', name: 'My Cases', icon: DocumentTextIcon }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-secondary-600 hover:bg-gray-50 hover:text-secondary-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="w-8 h-8 text-primary-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Total Cases</p>
                        <p className="text-2xl font-bold text-secondary-900">{stats.statistics.total_cases}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="w-8 h-8 text-green-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Approved Cases</p>
                        <p className="text-2xl font-bold text-secondary-900">
                          {stats.statistics.approved_cases}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ClockIcon className="w-8 h-8 text-yellow-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Under Review</p>
                        <p className="text-2xl font-bold text-secondary-900">
                          {stats.statistics.under_review_cases}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                      href="/report-case"
                      className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-400 transition-colors group"
                    >
                      <div className="flex-shrink-0">
                        <PlusIcon className="w-6 h-6 text-primary-500 group-hover:text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-secondary-900 group-hover:text-primary-600">
                          Submit New Case
                        </h4>
                        <p className="text-sm text-secondary-600">Report a new case for support</p>
                      </div>
                    </Link>

                    <Link
                      href="/register"
                      className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-400 transition-colors group"
                    >
                      <div className="flex-shrink-0">
                        <UserIcon className="w-6 h-6 text-primary-500 group-hover:text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-secondary-900 group-hover:text-primary-600">
                          Update Profile
                        </h4>
                        <p className="text-sm text-secondary-600">Modify your registration details</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Recent Cases */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-secondary-900">Recent Cases</h3>
                    <button
                      onClick={() => setActiveTab('cases')}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-3">
                    {cases.length === 0 ? (
                      <p className="text-center text-secondary-500 py-4">No cases submitted yet</p>
                    ) : (
                      cases.slice(0, 3).map((case_) => (
                        <div key={case_.case_id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getUrgencyIcon(case_.urgency_level)}
                              <div>
                                <h4 className="font-medium text-secondary-900">{case_.case_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                <p className="text-sm text-secondary-600 line-clamp-1">{case_.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                                {case_.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <button className="text-secondary-400 hover:text-secondary-600">
                                <EyeIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-6">Member Profile</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Full Name
                    </label>
                    <div className="text-secondary-900 font-medium">{user.name}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Member ID
                    </label>
                    <div className="text-secondary-900 font-medium">{user.memberId}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Email Address
                    </label>
                    <div className="text-secondary-900">{user.email}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Status
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-sm text-secondary-600 mb-4">
                    To update your profile information, please contact the administrator.
                  </p>
                </div>
              </div>
            )}

            {/* Cases Tab */}
            {activeTab === 'cases' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-secondary-900">My Cases</h3>
                  <Link
                    href="/report-case"
                    className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Submit New Case
                  </Link>
                </div>

                {cases.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-secondary-900">No cases submitted</h3>
                    <p className="mt-1 text-sm text-secondary-500">
                      You haven't submitted any cases yet.
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/report-case"
                        className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Submit Your First Case
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cases.map((case_) => (
                      <div key={case_.case_id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getUrgencyIcon(case_.urgency_level)}
                              <h4 className="font-semibold text-secondary-900">
                                {case_.case_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                                {case_.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </div>
                            <p className="text-secondary-600 mb-3">{case_.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-secondary-500">
                              <span>Case ID: {case_.case_id}</span>
                              <span>Submitted: {new Date(case_.submitted_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button className="ml-4 p-2 text-secondary-400 hover:text-secondary-600">
                            <EyeIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}