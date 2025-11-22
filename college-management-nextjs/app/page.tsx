import { redirect } from 'next/navigation'

export default function Home() {
  // Use permanent redirect for better compatibility
  redirect('/login')
}

// Export metadata for better SEO
export const metadata = {
  title: 'College Management System',
  description: 'Login to access your college management dashboard',
}
