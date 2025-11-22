import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    const studentId = searchParams.get('studentId')

    let where: any = {}

    if (session.user.userType === 'STUDENT') {
      where.studentId = session.user.id
    } else if (studentId) {
      where.studentId = studentId
    }

    if (courseId) {
      where.courseId = courseId
    }

    // Get marks for progress calculation
    const marks = await prisma.mark.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, email: true }
        },
        course: {
          select: { id: true, name: true, code: true }
        }
      }
    })

    // Calculate progress by course and student
    const progressMap = new Map<string, {
      student: any
      course: any
      marks: number[]
      average: number
      total: number
    }>()

    marks.forEach(mark => {
      const key = `${mark.studentId}-${mark.courseId}`
      if (!progressMap.has(key)) {
        progressMap.set(key, {
          student: mark.student,
          course: mark.course,
          marks: [],
          average: 0,
          total: 0
        })
      }
      const progress = progressMap.get(key)!
      progress.marks.push(mark.score)
      progress.total = progress.marks.length
      progress.average = progress.marks.reduce((a, b) => a + b, 0) / progress.total
    })

    const progress = Array.from(progressMap.values())

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

