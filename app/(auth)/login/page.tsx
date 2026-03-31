export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-brand-700 mb-1">Welcome back</h1>
        <p className="text-gray-500 mb-6">Sign in to your MindNest account.</p>
        {/* Auth form — connect to Supabase Auth */}
        <p className="text-sm text-center text-gray-400 mt-6">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-brand-600 hover:underline">Sign up</a>
        </p>
      </div>
    </main>
  )
}
