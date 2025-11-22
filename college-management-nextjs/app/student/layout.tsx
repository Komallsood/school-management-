'use client'

import { SessionProvider } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'

const navItems = [
  { label: 'Overview', href: '/student', icon: null },
  { label: 'Marks', href: '/student/marks', icon: null },
  { label: 'Progress', href: '/student/progress', icon: null },
  { label: 'Attendance', href: '/student/attendance', icon: null },
  { label: 'Course Content', href: '/student/content', icon: null },
  { label: 'Queries', href: '/student/queries', icon: null }
]

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <DashboardLayout userType="STUDENT" navItems={navItems}>
        {children}
      </DashboardLayout>
    </SessionProvider>
  )
}

