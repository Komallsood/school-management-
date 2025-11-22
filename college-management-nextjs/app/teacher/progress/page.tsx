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
}

interface Progress {
  student: Student
  course: Course
  marks: number[]
  average: number
  total: number
}

export default function TeacherProgressPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [progress, setProgress] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchCourses()
      fetchProgress()
    }
  }, [session])

  useEffect(() => {
    if (selectedCourse) {
      fetchProgress(selectedCourse)
    } else {
      fetchProgress()
    }
  }, [selectedCourse])

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

  const fetchProgress = async (courseId?: string) => {
    try {
      setLoading(true)
      const url = courseId ? `/api/progress?courseId=${courseId}` : '/api/progress'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch progress')
      const data = await res.json()
      setProgress(data)
    } catch (err) {
      setError('Failed to load progress')
    } finally {
      setLoading(false)
    }
  }

  const getGrade = (average: number): string => {
    if (average >= 90) return 'A+'
    if (average >= 80) return 'A'
    if (average >= 70) return 'B'
    if (average >= 60) return 'C'
    if (average >= 50) return 'D'
    return 'F'
  }

  const getGradeColor = (average: number): string => {
    if (average >= 70) return 'text-green-600 bg-green-50'
    if (average >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (status === 'loading' || loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Progress Reports</h2>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Course
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {progress.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          No progress data available. Marks need to be added first.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scores</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {progress.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {item.student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-medium">{item.course.name}</div>
                        <div className="text-gray-500 text-xs">{item.course.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-bold ${getGradeColor(item.average).split(' ')[0]}`}>
                        {Math.round(item.average * 10) / 10}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getGradeColor(item.average)}`}>
                        {getGrade(item.average)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.total}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {item.marks.map((score, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded text-xs ${
                              score >= 70 ? 'bg-green-100 text-green-700' :
                              score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}
                          >
                            {score}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

