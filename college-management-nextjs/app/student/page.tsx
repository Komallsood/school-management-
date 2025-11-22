'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BookOpen, TrendingUp, Calendar, MessageSquare, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

interface Stats {
  totalCourses: number
  averageMarks: number
  attendancePercent: number
  pendingQueries: number
}

interface RecentMark {
  course: { name: string }
  type: string
  score: number
  date: string
}

export default function StudentOverviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    averageMarks: 0,
    attendancePercent: 0,
    pendingQueries: 0
  })
  const [recentMarks, setRecentMarks] = useState<RecentMark[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchOverview()
    }
  }, [session])

  const fetchOverview = async () => {
    try {
      const [coursesRes, marksRes, attendanceRes, queriesRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/marks'),
        fetch('/api/attendance'),
        fetch('/api/queries')
      ])

      const courses = await coursesRes.json()
      const marks = await marksRes.json()
      const attendance = await attendanceRes.json()
      const queries = await queriesRes.json()

      const totalCourses = courses.length
      const averageMarks = marks.length > 0
        ? marks.reduce((sum: number, m: any) => sum + m.score, 0) / marks.length
        : 0
      const presentCount = attendance.filter((a: any) => a.status === 'PRESENT').length
      const attendancePercent = attendance.length > 0
        ? (presentCount / attendance.length) * 100
        : 0
      const pendingQueries = queries.filter((q: any) => !q.answer).length

      setStats({
        totalCourses,
        averageMarks: Math.round(averageMarks * 10) / 10,
        attendancePercent: Math.round(attendancePercent * 10) / 10,
        pendingQueries
      })

      const recent = marks
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
      setRecentMarks(recent)
    } catch (err) {
      console.error('Error fetching overview:', err)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    if (score >= 60) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">Welcome back! Here's your academic summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCourses}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Marks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.averageMarks}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.attendancePercent}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Queries</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingQueries}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Marks</h3>
          </div>
          {recentMarks.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No marks available yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Assessment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentMarks.map((mark, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {mark.course.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {mark.type}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(mark.score)}`}>
                          {mark.score}/100
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(mark.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
