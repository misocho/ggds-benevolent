'use client'

import { useState, useEffect } from 'react'
import { adminAPI, contributionsAPI } from '../../../lib/api'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import {
  UsersIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  UserIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [contributionStats, setContributionStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [adminStatsData, contribStatsData] = await Promise.all([
        adminAPI.getStats(),
        contributionsAPI.getStats()
      ])
      setStats(adminStatsData)
      setContributionStats(contribStatsData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error(error.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const StatCard = ({ title, value, subtitle, Icon, color = 'primary', href }) => {
    const colorClasses = {
      primary: 'bg-primary-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
    }

    const CardContent = () => (
      <div className="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
              {Icon && <Icon className="w-6 h-6 text-white" />}
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
    )

    if (href) {
      return (
        <Link href={href}>
          <CardContent />
        </Link>
      )
    }

    return <CardContent />
  }

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Members"
            value={stats?.total_members || 0}
            subtitle={`${stats?.active_members || 0} active`}
            Icon={UsersIcon}
            color="primary"
            href="/admin/members"
          />
          <StatCard
            title="Total Cases"
            value={stats?.total_cases || 0}
            subtitle={`${stats?.pending_cases || 0} pending review`}
            Icon={DocumentTextIcon}
            color="purple"
            href="/admin/cases"
          />
          <StatCard
            title="Funds Disbursed"
            value={`KES ${(stats?.total_disbursed || 0).toLocaleString()}`}
            subtitle="Total approved cases"
            Icon={BanknotesIcon}
            color="green"
          />
          <StatCard
            title="Active Cases"
            value={stats?.active_cases || 0}
            subtitle="In progress"
            Icon={ClockIcon}
            color="yellow"
          />
        </div>
      </div>

      {/* Contribution Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Contribution Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Collected"
            value={`KES ${(contributionStats?.total_collected || 0).toLocaleString()}`}
            subtitle={`${contributionStats?.contribution_count || 0} contributions`}
            Icon={CurrencyDollarIcon}
            color="green"
            href="/admin/accounting"
          />
          <StatCard
            title="Pending Verification"
            value={`KES ${(contributionStats?.total_pending || 0).toLocaleString()}`}
            subtitle="Awaiting verification"
            Icon={ClockIcon}
            color="yellow"
            href="/admin/accounting"
          />
          <StatCard
            title="Verified"
            value={`KES ${(contributionStats?.total_verified || 0).toLocaleString()}`}
            subtitle="Confirmed contributions"
            Icon={CheckCircleIcon}
            color="green"
          />
          <StatCard
            title="Contributing Members"
            value={contributionStats?.member_count || 0}
            subtitle="Unique contributors"
            Icon={UserIcon}
            color="blue"
          />
        </div>
      </div>

      {/* Case Status Breakdown */}
      {stats?.cases_by_status && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Case Status Breakdown</h3>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.cases_by_status).map(([status, count]) => (
                <div key={status} className="text-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <p className="text-sm text-gray-600 capitalize font-medium">{status.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Breakdown */}
      {contributionStats?.by_payment_method && Object.keys(contributionStats.by_payment_method).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contributions by Payment Method</h3>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(contributionStats.by_payment_method).map(([method, data]) => (
                <div key={method} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <p className="text-sm text-gray-600 capitalize font-medium">{method.replace('_', ' ')}</p>
                  <p className="text-xl font-bold text-gray-900 mt-2">
                    KES {data.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{data.count} transactions</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Contribution Trends */}
      {contributionStats?.by_month && Object.keys(contributionStats.by_month).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Contribution Trends</h3>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Month</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(contributionStats.by_month)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 6)
                    .map(([month, data]) => (
                      <tr key={month} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-900">{month}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                          KES {data.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-600">{data.count}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/cases"
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-l-4 border-primary-500 group"
          >
            <div className="flex items-center gap-3">
              <DocumentTextIcon className="w-6 h-6 text-primary-600 group-hover:text-primary-700" />
              <div>
                <h4 className="font-semibold text-gray-900">Review Cases</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {stats?.pending_cases || 0} cases awaiting review
                </p>
              </div>
            </div>
          </Link>
          <Link
            href="/admin/accounting"
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-l-4 border-green-500 group"
          >
            <div className="flex items-center gap-3">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600 group-hover:text-green-700" />
              <div>
                <h4 className="font-semibold text-gray-900">Verify Contributions</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Manage member contributions and payments
                </p>
              </div>
            </div>
          </Link>
          <Link
            href="/admin/members"
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-l-4 border-purple-500 group"
          >
            <div className="flex items-center gap-3">
              <UsersIcon className="w-6 h-6 text-purple-600 group-hover:text-purple-700" />
              <div>
                <h4 className="font-semibold text-gray-900">Manage Members</h4>
                <p className="text-sm text-gray-600 mt-1">
                  View and manage all {stats?.total_members || 0} members
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
