import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const mark = await prisma.mark.findUnique({
      where: { id: params.id },
      include: { course: true }
    })

    if (!mark || mark.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Mark not found' }, { status: 404 })
    }

    await prisma.mark.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Mark deleted successfully' })
  } catch (error) {
    console.error('Error deleting mark:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

