import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-brand-50 px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-brand-700 mb-4">MindNest</h1>
        <p className="text-xl text-sage-600 mb-2 italic">
          Every age. Every stage. Nest has you covered.
        </p>
        <p className="text-gray-600 mb-10 text-lg">
          Your AI wellness coach for every moment of early motherhood.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3 bg-brand-600 text-white rounded-full font-semibold hover:bg-brand-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border border-brand-600 text-brand-600 rounded-full font-semibold hover:bg-brand-50 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}
