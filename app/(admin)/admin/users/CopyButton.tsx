'use client'

import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API unavailable — silent fail
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Click to copy"
      className="text-left transition-colors hover:text-gray-900"
    >
      {copied ? (
        <span className="text-green-600 text-[11px] font-medium">Copied!</span>
      ) : (
        <span className="text-gray-500">{text}</span>
      )}
    </button>
  )
}
