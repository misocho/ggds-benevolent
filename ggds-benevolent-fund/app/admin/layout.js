'use client'

import { useAuth } from '../../contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  HomeIcon,
  DocumentTextIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  PlusIcon,
  CheckCircleIcon,
  UserPlusIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { adminAPI, contributionsAPI } from '../../lib/api'

const AdminLayout = ({ children }) => {
  const { user, loading, logout, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [quickStats, setQuickStats] = useState({ pendingCases: 0, unverifiedContributions: 0 })
  const [searchOpen, setSearchOpen] = useState(false)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !isAdmin()) {
      router.push('/dashboard')
    }
  }, [user, loading, router, isAdmin])

  // Fetch quick stats for top bar
  useEffect(() => {
    if (isAdmin()) {
      fetchQuickStats()
    }
  }, [isAdmin])

  const fetchQuickStats = async () => {
    try {
      const [adminStats, contribStats] = await Promise.all([
        adminAPI.getStats(),
        contributionsAPI.getStats()
      ])
      setQuickStats({
        pendingCases: adminStats.pending_cases || 0,
        unverifiedContributions: Math.round(contribStats.total_pending || 0)
      })
    } catch (error) {
      console.error('Error fetching quick stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin()) {
    return null
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/admin/cases', label: 'Cases', icon: DocumentTextIcon },
    { href: '/admin/members', label: 'Members', icon: UsersIcon },
    { href: '/admin/accounting', label: 'Accounting', icon: CurrencyDollarIcon },
    { href: '/admin/reports', label: 'Reports', icon: ChartBarIcon },
  ]

  const quickActions = [
    { label: 'Record Contribution', icon: PlusIcon, href: '/admin/accounting' },
    { label: 'Review Cases', icon: CheckCircleIcon, href: '/admin/cases' },
    { label: 'Add Member', icon: UserPlusIcon, href: '/admin/members' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">GGDS Admin</h1>
                  <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">ADMIN</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Benevolent Fund</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                    {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-800">
          {sidebarOpen ? (
            <div className="mb-3">
              <p className="text-sm font-medium truncate">{user?.full_name || user?.email}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors font-medium"
            title="Logout"
          >
            {sidebarOpen ? 'Logout' : '→'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Enhanced Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Page title */}
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {navItems.find(item => pathname.startsWith(item.href))?.label || 'Admin Panel'}
                </h2>
              </div>

              {/* Right: Quick stats, search, actions, notifications, user menu */}
              <div className="flex items-center gap-4">
                {/* Quick Stats */}
                <Link
                  href="/admin/cases"
                  className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <DocumentTextIcon className="w-4 h-4 text-yellow-600" />
                  <div className="text-xs">
                    <div className="font-semibold text-yellow-900">{quickStats.pendingCases}</div>
                    <div className="text-yellow-600">Pending</div>
                  </div>
                </Link>

                <Link
                  href="/admin/accounting"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <CurrencyDollarIcon className="w-4 h-4 text-blue-600" />
                  <div className="text-xs">
                    <div className="font-semibold text-blue-900">KES {quickStats.unverifiedContributions.toLocaleString()}</div>
                    <div className="text-blue-600">Unverified</div>
                  </div>
                </Link>

                {/* Search */}
                <div className="relative">
                  <button
                    onClick={() => setSearchOpen(!searchOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Search"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  {searchOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                      <input
                        type="text"
                        placeholder="Search members, cases..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 mt-2">Press Enter to search</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="relative">
                  <button
                    onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                    className="flex items-center gap-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Quick Actions
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  {quickActionsOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      {quickActions.map((action) => {
                        const Icon = action.icon
                        return (
                          <Link
                            key={action.label}
                            href={action.href}
                            onClick={() => setQuickActionsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <Icon className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-700">{action.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <button
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Notifications"
                >
                  <BellIcon className="w-5 h-5 text-gray-600" />
                  {(quickStats.pendingCases > 0 || quickStats.unverifiedContributions > 0) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                    </div>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-800">{user?.full_name || user?.email}</p>
                        <p className="text-xs text-gray-500">Administrator</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Member View
                      </Link>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-sm text-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
