import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const answerSchema = z.object({
  answer: z.string().min(1)
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = answerSchema.parse(body)

    const query = await prisma.query.findUnique({
      where: { id: params.id },
      include: { course: true }
    })

    if (!query || query.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Query not found' }, { status: 404 })
    }

    const updatedQuery = await prisma.query.update({
      where: { id: params.id },
      data: {
        answer: validated.answer,
        answeredDate: new Date()
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

    return NextResponse.json(updatedQuery)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Error updating query:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

