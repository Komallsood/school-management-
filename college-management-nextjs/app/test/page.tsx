export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">✅ It Works!</h1>
        <p className="text-gray-700">If you can see this, Next.js is working correctly.</p>
        <a href="/login" className="text-blue-600 hover:underline mt-4 block">
          Go to Login Page →
        </a>
      </div>
    </div>
  )
}

