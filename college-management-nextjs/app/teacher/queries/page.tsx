'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Send } from 'lucide-react'

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

interface Query {
  id: string
  subject: string
  message: string
  answer: string | null
  student: Student
  course: Course
  createdAt: string
  answeredDate: string | null
}

export default function TeacherQueriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchQueries()
    }
  }, [session])

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

  const handleAnswer = async (queryId: string) => {
    if (!answer.trim()) {
      setError('Please enter an answer')
      return
    }

    try {
      setError('')
      const res = await fetch(`/api/queries/${queryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit answer')
      }

      setAnswer('')
      setSelectedQuery(null)
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Queries</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Pending</div>
          <div className="text-2xl font-bold text-blue-700">{pendingQueries.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Answered</div>
          <div className="text-2xl font-bold text-green-700">{answeredQueries.length}</div>
        </div>
      </div>

      {pendingQueries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-red-600">Pending Queries ({pendingQueries.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingQueries.map((query) => (
              <div key={query.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-semibold">{query.subject}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">From:</span> {query.student.name} ({query.student.email})
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Course:</span> {query.course.name} ({query.course.code})
                    </p>
                    <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded">
                      {query.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      Asked: {new Date(query.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {selectedQuery === query.id ? (
                  <div className="mt-4 space-y-2">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAnswer(query.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Submit Answer
                      </button>
                      <button
                        onClick={() => {
                          setSelectedQuery(null)
                          setAnswer('')
                        }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedQuery(query.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reply
                  </button>
                )}
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
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <h4 className="text-lg font-semibold">{query.subject}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">From:</span> {query.student.name} | 
                  <span className="font-medium"> Course:</span> {query.course.name}
                </p>
                <div className="bg-gray-50 p-3 rounded mb-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Question:</p>
                  <p className="text-sm text-gray-700">{query.message}</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm font-medium text-green-700 mb-1">Your Answer:</p>
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
          No queries received yet.
        </div>
      )}
    </div>
  )
}

