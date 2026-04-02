import type { ChatMessage } from '@/types'

interface NestMessageProps {
  message: ChatMessage
}

export function NestMessage({ message }: NestMessageProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] bg-brand-600 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2.5">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
        <span className="font-display italic text-brand-700 text-[11px]">N</span>
      </div>
      <div className="max-w-[78%] bg-warm-100 border border-warm-400 rounded-2xl rounded-bl-sm px-5 py-3.5 text-sm text-brand-900 leading-relaxed">
        {message.content}
      </div>
    </div>
  )
}
