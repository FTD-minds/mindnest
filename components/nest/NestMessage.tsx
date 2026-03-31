import type { ChatMessage } from '@/types'

interface NestMessageProps {
  message: ChatMessage
}

export function NestMessage({ message }: NestMessageProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-brand-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2">
      {/* Nest avatar */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 text-xs font-bold">
        N
      </div>
      <div className="max-w-[75%] bg-white border border-sage-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-700 leading-relaxed shadow-sm">
        {message.content}
      </div>
    </div>
  )
}
