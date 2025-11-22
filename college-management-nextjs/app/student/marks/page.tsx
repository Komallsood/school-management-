'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  name: string
  code: string
}

interface Mark {
  id: string
  course: Course
  type: string
  score: number
  date: string
}

export default function StudentMarksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [marks, setMarks] = useState<Mark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchMarks()
    }
  }, [session])

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

  if (status === 'loading' || loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  // Calculate statistics
  const totalMarks = marks.length
  const averageScore = marks.length > 0
    ? Math.round((marks.reduce((sum, m) => sum + m.score, 0) / marks.length) * 10) / 10
    : 0

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Marks</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Assessments</h3>
          <p className="text-3xl font-bold text-gray-800">{totalMarks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Average Score</h3>
          <p className="text-3xl font-bold text-blue-600">{averageScore}%</p>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">All Marks</h3>
        </div>
        {marks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No marks available yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {marks.map((mark) => (
                  <tr key={mark.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-medium">{mark.course.name}</div>
                        <div className="text-gray-500 text-xs">{mark.course.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{mark.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-semibold ${mark.score >= 70 ? 'text-green-600' : mark.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {mark.score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(mark.date).toLocaleDateString()}
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

