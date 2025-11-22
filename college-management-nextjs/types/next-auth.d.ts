import 'next-auth'

declare module 'next-auth' {
  interface User {
    userType: string
    studentId: string | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      userType: string
      studentId: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userType: string
    studentId: string | null
  }
}

