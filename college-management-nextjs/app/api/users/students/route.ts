import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'TEACHER') {
      console.log('Unauthorized access to students API:', { 
        hasSession: !!session, 
        userType: session?.user?.userType 
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')

    // Always return all students so teachers can add marks for any student
    // Teachers can add marks even if student is not enrolled yet
    const students = await prisma.user.findMany({
      where: { userType: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true
      },
      orderBy: { name: 'asc' }
    })

    console.log(`Found ${students.length} students for teacher ${session.user.email}`)
    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

