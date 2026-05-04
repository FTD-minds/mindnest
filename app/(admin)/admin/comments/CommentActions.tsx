'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Comment {
  id:          string
  post_id:     string
  content:     string
  is_approved: boolean
  created_at:  string
  profiles:    { full_name: string } | { full_name: string }[] | null
  community_posts: { content: string } | { content: string }[] | null
}

type Filter = 'all' | 'approved' | 'pending'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function profileName(profiles: Comment['profiles']): string {
  const p = Array.isArray(profiles) ? profiles[0] : profiles
  if (!p?.full_name) return 'A mama'
  const parts = p.full_name.trim().split(' ')
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function postPreview(posts: Comment['community_posts']): string {
  const p = Array.isArray(posts) ? posts[0] : posts
  if (!p?.content) return '—'
  return p.content.length > 40 ? p.content.slice(0, 40) + '…' : p.content
}

export function CommentActions({ comments }: { comments: Comment[] }) {
  const router  = useRouter()
  const [filter,   setFilter]   = useState<Filter>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = comments.filter(c => {
    if (filter === 'approved') return  c.is_approved
    if (filter === 'pending')  return !c.is_approved
    return true
  })

  const counts = {
    all:      comments.length,
    approved: comments.filter(c =>  c.is_approved).length,
    pending:  comments.filter(c => !c.is_approved).length,
  }

  async function handleDelete(comment: Comment) {
    const preview = comment.content.slice(0, 60)
    const confirmed = window.confirm(`Delete this comment?\n\n"${preview}…"\n\nThis cannot be undone.`)
    if (!confirmed) return

    setDeleting(comment.id)
    try {
      await fetch(`/api/admin/comments?id=${comment.id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setDeleting(null)
    }
  }

  const TABS: { id: Filter; label: string }[] = [
    { id: 'all',      label: `All (${counts.all})`           },
    { id: 'approved', label: `Approved (${counts.approved})` },
    { id: 'pending',  label: `Pending (${counts.pending})`   },
  ]

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Admin</p>
        <h1 className="text-2xl font-bold text-gray-900">
          Comments{' '}
          <span className="text-gray-400 font-normal text-xl">({comments.length})</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {counts.pending} pending · {counts.approved} approved
        </p>
      </div>

      {/* ── Filter tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              filter === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400 w-[30%]">Comment</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400 w-[25%]">Post</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Author</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Posted</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                {/* Comment */}
                <td className="px-5 py-3">
                  <p className="text-gray-800 leading-relaxed">
                    {c.content.length > 80 ? c.content.slice(0, 80) + '…' : c.content}
                  </p>
                </td>

                {/* Parent post */}
                <td className="px-5 py-3">
                  <p className="text-[12px] text-gray-500 italic">{postPreview(c.community_posts)}</p>
                </td>

                {/* Author */}
                <td className="px-5 py-3 text-gray-600 text-[12px]">{profileName(c.profiles)}</td>

                {/* Status */}
                <td className="px-5 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    c.is_approved
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {c.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </td>

                {/* Created at */}
                <td className="px-5 py-3 text-gray-400 text-[11px]">{timeAgo(c.created_at)}</td>

                {/* Actions */}
                <td className="px-5 py-3">
                  <button
                    onClick={() => handleDelete(c)}
                    disabled={deleting === c.id}
                    className="text-[11px] text-red-500 hover:text-red-700 font-medium disabled:opacity-50 transition-colors"
                  >
                    {deleting === c.id ? '…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                  No comments in this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
