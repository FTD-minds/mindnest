export default function NestPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <header className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 font-bold">N</div>
        <div>
          <p className="font-semibold text-gray-800">Nest</p>
          <p className="text-xs text-gray-400">Your AI wellness coach</p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        {/* Chat messages render here */}
      </div>
      <div className="p-4 border-t border-gray-100">
        {/* Message input */}
      </div>
    </main>
  )
}
