import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const attendanceSchema = z.object({
  courseId: z.string(),
  date: z.string(),
  students: z.array(z.object({
    studentId: z.string(),
    status: z.enum(['PRESENT', 'ABSENT'])
  }))
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

    const attendance = await prisma.attendance.findMany({
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

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
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
    const validated = attendanceSchema.parse(body)

    // Verify course belongs to teacher
    const course = await prisma.course.findUnique({
      where: { id: validated.courseId }
    })

    if (!course || course.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Create attendance records
    const attendanceRecords = await Promise.all(
      validated.students.map(student =>
        prisma.attendance.upsert({
          where: {
            studentId_courseId_date: {
              studentId: student.studentId,
              courseId: validated.courseId,
              date: new Date(validated.date)
            }
          },
          update: {
            status: student.status
          },
          create: {
            studentId: student.studentId,
            courseId: validated.courseId,
            date: new Date(validated.date),
            status: student.status
          }
        })
      )
    )

    return NextResponse.json(attendanceRecords, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Error creating attendance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

