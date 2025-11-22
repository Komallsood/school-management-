'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Calendar, CheckCircle, XCircle } from 'lucide-react'

interface Course {
  id: string
  name: string
  code: string
}

interface Student {
  id: string
  name: string
  email: string
  studentId: string | null
}

interface Attendance {
  id: string
  student: Student
  course: Course
  date: string
  status: 'PRESENT' | 'ABSENT'
}

export default function TeacherAttendancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    studentAttendance: [] as { studentId: string; status: 'PRESENT' | 'ABSENT' }[]
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchCourses()
      fetchAttendance()
    }
  }, [session])

  useEffect(() => {
    if (formData.courseId) {
      fetchStudents()
    }
  }, [formData.courseId])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      if (!res.ok) throw new Error('Failed to fetch courses')
      const data = await res.json()
      setCourses(data)
    } catch (err) {
      setError('Failed to load courses')
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/users/students?courseId=${formData.courseId}`)
      if (!res.ok) throw new Error('Failed to fetch students')
      const data = await res.json()
      setStudents(data)
      // Initialize student attendance
      setFormData(prev => ({
        ...prev,
        studentAttendance: data.map((s: Student) => ({
          studentId: s.id,
          status: 'PRESENT' as const
        }))
      }))
    } catch (err) {
      setError('Failed to load students')
    }
  }

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/attendance')
      if (!res.ok) throw new Error('Failed to fetch attendance')
      const data = await res.json()
      setAttendance(data)
    } catch (err) {
      setError('Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT') => {
    setFormData(prev => ({
      ...prev,
      studentAttendance: prev.studentAttendance.map(sa =>
        sa.studentId === studentId ? { ...sa, status } : sa
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: formData.courseId,
          date: formData.date,
          students: formData.studentAttendance
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to mark attendance')
      }

      setSuccess('Attendance marked successfully!')
      setShowForm(false)
      setTimeout(() => setSuccess(''), 3000)
      fetchAttendance()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Attendance</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Mark Attendance'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">Mark Attendance</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Course
                </label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value, studentAttendance: [] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {formData.courseId && students.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Attendance
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {students.map((student) => {
                    const attendance = formData.studentAttendance.find(sa => sa.studentId === student.id)
                    return (
                      <div key={student.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <span className="text-sm">{student.name} ({student.studentId || student.email})</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                            className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                              attendance?.status === 'PRESENT'
                                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                            className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                              attendance?.status === 'ABSENT'
                                ? 'bg-red-100 text-red-700 border-2 border-red-500'
                                : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                            Absent
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!formData.courseId || formData.studentAttendance.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Save Attendance
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Attendance Records</h3>
        </div>
        {attendance.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No attendance records yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{record.student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{record.course.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        record.status === 'PRESENT'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

