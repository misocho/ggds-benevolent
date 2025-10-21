'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authAPI } from '../lib/api'

const AuthContext = createContext({})

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/signin', '/register', '/about', '/contact', '/eligibility', '/faqs', '/apply', '/contribute']

// Admin routes that require admin role
const ADMIN_ROUTES = ['/admin']

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is authenticated on mount
    const currentUser = authAPI.getCurrentUser()
    const isAuthenticated = authAPI.isAuthenticated()

    if (isAuthenticated && currentUser) {
      setUser(currentUser)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    // Protect routes that require authentication
    if (!loading) {
      const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route)
      const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))

      if (!user && !isPublicRoute) {
        // User is not authenticated and trying to access protected route
        router.push('/signin')
      } else if (user && isAdminRoute && user.role !== 'admin') {
        // User is authenticated but trying to access admin route without admin role
        router.push('/dashboard')
      }
    }
  }, [user, loading, pathname, router])

  const login = (userData) => {
    setUser(userData)
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
    router.push('/signin')
  }

  const isAdmin = () => {
    return user && user.role === 'admin'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
