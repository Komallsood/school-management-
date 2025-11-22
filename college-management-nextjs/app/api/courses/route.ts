import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const courseSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional()
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.userType === 'TEACHER') {
      const courses = await prisma.course.findMany({
        where: { teacherId: session.user.id },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(courses)
    } else {
      // For students, get enrolled courses
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: session.user.id },
        include: { course: true }
      })
      return NextResponse.json(enrollments.map(e => e.course))
    }
  } catch (error) {
    console.error('Error fetching courses:', error)
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
    const validated = courseSchema.parse(body)

    // Check if course code already exists
    const existing = await prisma.course.findUnique({
      where: { code: validated.code }
    })

    if (existing) {
      return NextResponse.json({ error: 'Course code already exists' }, { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        name: validated.name,
        code: validated.code,
        description: validated.description,
        teacherId: session.user.id
      }
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

