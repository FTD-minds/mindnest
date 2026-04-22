'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  copyCode?: string // if provided, renders copy-only button; if absent, renders generate button
}

export function InviteCodeActions({ copyCode }: Props) {
  const router   = useRouter()
  const [loading, setLoading] = useState(false)
  const [copied,  setCopied]  = useState(false)

  // Copy-only mode
  if (copyCode) {
    return (
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(copyCode)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }}
        className="text-[11px] text-gray-400 hover:text-[#1c2e1c] transition-colors"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    )
  }

  // Generate mode
  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/invite-codes', { method: 'POST' })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="
        px-4 py-2 text-sm bg-[#1c2e1c] text-white rounded-xl
        hover:bg-[#2d4a2d] transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      {loading ? 'Generating…' : '+ Generate code'}
    </button>
  )
}
