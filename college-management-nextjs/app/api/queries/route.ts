import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const querySchema = z.object({
  courseId: z.string(),
  subject: z.string().min(1),
  message: z.string().min(1)
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

    if (session.user.userType === 'STUDENT') {
      where.studentId = session.user.id
    } else {
      // For teachers, get queries from their courses
      const courses = await prisma.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true }
      })
      where.courseId = { in: courses.map(c => c.id) }
    }

    if (courseId) {
      where.courseId = courseId
    }

    const queries = await prisma.query.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, email: true }
        },
        course: {
          select: { id: true, name: true, code: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(queries)
  } catch (error) {
    console.error('Error fetching queries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = querySchema.parse(body)

    const query = await prisma.query.create({
      data: {
        studentId: session.user.id,
        courseId: validated.courseId,
        subject: validated.subject,
        message: validated.message
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

    return NextResponse.json(query, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Error creating query:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

