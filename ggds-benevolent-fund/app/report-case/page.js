/*
PIVOT v2.0: Case filing moved to /dashboard/cases/file
This file is preserved for backwards compatibility and redirects
Preserved on: 2025-10-23
Original code moved to: /dashboard/cases/file/page.js
*/

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ReportCaseRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to new location
    router.replace('/dashboard/cases/file')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-secondary-600">Redirecting to case filing...</p>
      </div>
    </div>
  )
}
