'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FileText, Download, BookOpen } from 'lucide-react'

interface Course {
  id: string
  name: string
  code: string
}

interface Content {
  id: string
  title: string
  description: string | null
  fileName: string | null
  fileUrl: string | null
  course: Course
  createdAt: string
}

export default function StudentContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState<Content[]>([])
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
      fetchContent()
    }
  }, [session])

  useEffect(() => {
    if (selectedCourse) {
      fetchContent(selectedCourse)
    } else {
      fetchContent()
    }
  }, [selectedCourse])

  const fetchContent = async (courseId?: string) => {
    try {
      setLoading(true)
      const url = courseId ? `/api/content?courseId=${courseId}` : '/api/content'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch content')
      const data = await res.json()
      setContent(data)
    } catch (err) {
      setError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  // Get unique courses for filter
  const courses = Array.from(new Map(content.map(c => [c.course.id, c.course])).values())

  if (status === 'loading' || loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Course Content</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filter */}
      {courses.length > 0 && (
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
      )}

      {content.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          No course content available yet. Your teachers will upload content here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {item.course.name} ({item.course.code})
                  </p>
                </div>
              </div>

              {item.description && (
                <p className="text-sm text-gray-700 mb-4">{item.description}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Uploaded: {new Date(item.createdAt).toLocaleDateString()}
                </p>
                {item.fileUrl && (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
              </div>

              {item.fileName && !item.fileUrl && (
                <p className="text-xs text-gray-500 mt-2">File: {item.fileName}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

