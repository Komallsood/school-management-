import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const contentSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  fileName: z.string().optional(),
  fileUrl: z.string().optional()
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')

    let where: any = {}

    if (courseId) {
      where.courseId = courseId
    }

    // For students, only show content from enrolled courses
    if (session.user.userType === 'STUDENT') {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: session.user.id },
        select: { courseId: true }
      })
      where.courseId = { in: enrollments.map(e => e.courseId) }
    } else {
      // For teachers, only show their courses
      const courses = await prisma.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true }
      })
      where.courseId = { in: courses.map(c => c.id) }
    }

    const content = await prisma.content.findMany({
      where,
      include: {
        course: {
          select: { id: true, name: true, code: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching content:', error)
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
    const validated = contentSchema.parse(body)

    // Verify course belongs to teacher
    const course = await prisma.course.findUnique({
      where: { id: validated.courseId }
    })

    if (!course || course.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const content = await prisma.content.create({
      data: {
        courseId: validated.courseId,
        title: validated.title,
        description: validated.description,
        fileName: validated.fileName,
        fileUrl: validated.fileUrl
      },
      include: {
        course: {
          select: { id: true, name: true, code: true }
        }
      }
    })

    return NextResponse.json(content, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Error creating content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

