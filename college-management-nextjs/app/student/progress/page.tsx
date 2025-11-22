'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  name: string
  code: string
}

interface Progress {
  student: {
    id: string
    name: string
    email: string
  }
  course: Course
  marks: number[]
  average: number
  total: number
}

export default function StudentProgressPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [progress, setProgress] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchProgress()
    }
  }, [session])

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/progress')
      if (!res.ok) throw new Error('Failed to fetch progress')
      const data = await res.json()
      setProgress(data)
    } catch (err) {
      setError('Failed to load progress')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="text-center py-12">Loading...</div>
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
    if (average >= 70) return 'text-green-600'
    if (average >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Progress</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {progress.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          No progress data available yet. Marks need to be added by your teachers.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {progress.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{item.course.name}</h3>
                <p className="text-sm text-gray-500">{item.course.code}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Score:</span>
                  <span className={`text-lg font-bold ${getGradeColor(item.average)}`}>
                    {Math.round(item.average * 10) / 10}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Grade:</span>
                  <span className={`text-lg font-bold ${getGradeColor(item.average)}`}>
                    {getGrade(item.average)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Assessments:</span>
                  <span className="text-sm font-medium text-gray-800">{item.total}</span>
                </div>

                {item.marks.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">Individual Scores:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.marks.map((score, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            score >= 70 ? 'bg-green-100 text-green-700' :
                            score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}
                        >
                          {score}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(item.average)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.average >= 70 ? 'bg-green-500' :
                        item.average >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(item.average, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

