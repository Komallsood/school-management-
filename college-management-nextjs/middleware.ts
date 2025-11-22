import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Redirect to login if no token
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Protect teacher routes
    if (path.startsWith('/teacher') && token.userType !== 'TEACHER') {
      return NextResponse.redirect(new URL('/student', req.url))
    }

    // Protect student routes
    if (path.startsWith('/student') && token.userType !== 'STUDENT') {
      return NextResponse.redirect(new URL('/teacher', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ['/teacher/:path*', '/student/:path*']
}

