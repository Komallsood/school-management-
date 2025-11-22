'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Send, CheckCircle } from 'lucide-react'

interface Course {
  id: string
  name: string
  code: string
}

interface Query {
  id: string
  subject: string
  message: string
  answer: string | null
  course: Course
  createdAt: string
  answeredDate: string | null
}

export default function StudentQueriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    courseId: '',
    subject: '',
    message: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchCourses()
      fetchQueries()
    }
  }, [session])

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

  const fetchQueries = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/queries')
      if (!res.ok) throw new Error('Failed to fetch queries')
      const data = await res.json()
      setQueries(data)
    } catch (err) {
      setError('Failed to load queries')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit query')
      }

      setSuccess('Query submitted successfully!')
      setFormData({ courseId: '', subject: '', message: '' })
      setShowForm(false)
      setTimeout(() => setSuccess(''), 3000)
      fetchQueries()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const pendingQueries = queries.filter(q => !q.answer)
  const answeredQueries = queries.filter(q => q.answer)

  if (status === 'loading' || loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Queries</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Ask a Question'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">Submit a Query</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Course
              </label>
              <select
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
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
                Subject
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Brief subject of your query"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                rows={5}
                placeholder="Describe your query in detail..."
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Query
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

      {pendingQueries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-orange-600">Pending Queries ({pendingQueries.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingQueries.map((query) => (
              <div key={query.id} className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                  <h4 className="text-lg font-semibold">{query.subject}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Course:</span> {query.course.name} ({query.course.code})
                </p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded mb-2">{query.message}</p>
                <p className="text-xs text-gray-500">
                  Asked: {new Date(query.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {answeredQueries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-green-600">Answered Queries ({answeredQueries.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {answeredQueries.map((query) => (
              <div key={query.id} className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="text-lg font-semibold">{query.subject}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Course:</span> {query.course.name} ({query.course.code})
                </p>
                <div className="bg-gray-50 p-3 rounded mb-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Your Question:</p>
                  <p className="text-sm text-gray-700">{query.message}</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm font-medium text-green-700 mb-1">Teacher's Answer:</p>
                  <p className="text-sm text-gray-700">{query.answer}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Answered: {query.answeredDate ? new Date(query.answeredDate).toLocaleString() : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {queries.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          No queries submitted yet. Click "Ask a Question" to submit your first query.
        </div>
      )}
    </div>
  )
}

