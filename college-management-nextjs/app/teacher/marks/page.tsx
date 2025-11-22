'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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

interface Mark {
  id: string
  student: Student
  course: Course
  type: string
  score: number
  date: string
}

export default function TeacherMarksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [marks, setMarks] = useState<Mark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    courseId: '',
    studentId: '',
    type: '',
    score: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchCourses()
      fetchMarks()
    }
  }, [session])

  useEffect(() => {
    if (formData.courseId) {
      fetchStudents(formData.courseId)
    } else {
      // Clear students when no course is selected
      setStudents([])
    }
  }, [formData.courseId])

  const fetchCourses = async () => {
    const res = await fetch('/api/courses')
    const data = await res.json()
    setCourses(data)
  }

  const fetchStudents = async (courseId: string) => {
    try {
      setError('') // Clear previous errors
      const res = await fetch(`/api/users/students?courseId=${courseId}`)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch students')
      }
      
      const data = await res.json()
      console.log('Fetched students:', data) // Debug log
      
      if (Array.isArray(data)) {
        setStudents(data)
        if (data.length === 0) {
          setError('No students found. Please register students first.')
        }
      } else {
        console.error('Invalid response format:', data)
        setError('Invalid response from server')
        setStudents([])
      }
    } catch (err: any) {
      console.error('Error fetching students:', err)
      setError(err.message || 'Failed to load students. Please try again.')
      setStudents([])
    }
  }

  const fetchMarks = async () => {
    try {
      const res = await fetch('/api/marks')
      if (!res.ok) throw new Error('Failed to fetch marks')
      const data = await res.json()
      setMarks(data)
    } catch (err) {
      setError('Failed to load marks')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          score: parseFloat(formData.score)
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add marks')
      }

      setFormData({ courseId: '', studentId: '', type: '', score: '' })
      fetchMarks()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mark?')) return

    try {
      const res = await fetch(`/api/marks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete mark')
      fetchMarks()
    } catch (err) {
      setError('Failed to delete mark')
    }
  }

  if (status === 'loading' || loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Student Marks</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Add Marks</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Course
              </label>
              <select
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value, studentId: '' })}
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
                Select Student
                {formData.courseId && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({students.length} {students.length === 1 ? 'student' : 'students'})
                  </span>
                )}
              </label>
              <select
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                disabled={!formData.courseId || students.length === 0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
              >
                <option value="">
                  {!formData.courseId 
                    ? 'Select a course first...' 
                    : students.length === 0 
                    ? 'No students available' 
                    : 'Select Student...'}
                </option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.studentId || student.email})
                  </option>
                ))}
              </select>
              {formData.courseId && students.length === 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  No students found. Make sure students are registered in the system.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessment Type
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select Type...</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="QUIZ">Quiz</option>
                <option value="MIDTERM">Midterm</option>
                <option value="FINAL">Final Exam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Score (out of 100)
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Marks
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Student Marks</h3>
        </div>
        {marks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No marks added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {marks.map((mark) => (
                  <tr key={mark.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{mark.student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{mark.course.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{mark.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{mark.score}/100</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(mark.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(mark.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
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

