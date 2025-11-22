'use client'

import { SessionProvider } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'

const navItems = [
  { label: 'Courses', href: '/teacher', icon: null },
  { label: 'Marks', href: '/teacher/marks', icon: null },
  { label: 'Progress Reports', href: '/teacher/progress', icon: null },
  { label: 'Upload Content', href: '/teacher/content', icon: null },
  { label: 'Attendance', href: '/teacher/attendance', icon: null },
  { label: 'Student Queries', href: '/teacher/queries', icon: null }
]

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <DashboardLayout userType="TEACHER" navItems={navItems}>
        {children}
      </DashboardLayout>
    </SessionProvider>
  )
}

