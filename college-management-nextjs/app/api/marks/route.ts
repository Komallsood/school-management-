import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const markSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  type: z.enum(['ASSIGNMENT', 'QUIZ', 'MIDTERM', 'FINAL']),
  score: z.number().min(0).max(100)
})

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

    const marks = await prisma.mark.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, email: true }
        },
        course: {
          select: { id: true, name: true, code: true }
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(marks)
  } catch (error) {
    console.error('Error fetching marks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = markSchema.parse(body)

    // Verify course belongs to teacher
    const course = await prisma.course.findUnique({
      where: { id: validated.courseId }
    })

    if (!course || course.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const mark = await prisma.mark.create({
      data: {
        studentId: validated.studentId,
        courseId: validated.courseId,
        type: validated.type,
        score: validated.score
      },
      include: {
        student: {
          select: { id: true, name: true, email: true }
        },
        course: {
          select: { id: true, name: true, code: true }
        }
      }
    })

    return NextResponse.json(mark, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Error creating mark:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

