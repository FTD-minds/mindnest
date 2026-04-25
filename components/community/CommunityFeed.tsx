'use client'

import { useState, useRef } from 'react'
import { SpinnerIcon } from '@/components/ui/icons'

interface Post {
  id:               string
  content:          string
  baby_age_months:  number | null
  likes_count:      number
  liked_by_me:      boolean
  nest_reply:       string | null
  created_at:       string
  user_id:          string
  profiles:         { full_name: string } | null
}

interface CommunityFeedProps {
  initialPosts:    Post[]
  currentUserId:   string
  babyAgeMonths?:  number | null
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function anonymiseName(fullName: string | undefined): string {
  if (!fullName) return 'A mama'
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function PostCard({
  post,
  currentUserId,
  onLike,
}: {
  post: Post
  currentUserId: string
  onLike: (postId: string) => void
}) {
  const [liked, setLiked]   = useState(post.liked_by_me)
  const [count, setCount]   = useState(post.likes_count)
  const [loading, setLoading] = useState(false)

  async function handleLike() {
    if (loading) return
    setLoading(true)
    // Optimistic update — nest setCount inside setLiked to read current state
    setLiked(prev => {
      const nowLiked = !prev
      setCount(c => nowLiked ? c + 1 : c - 1)
      return nowLiked
    })
    try {
      await fetch('/api/community/like', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ postId: post.id }),
      })
    } catch {
      // Revert on failure
      setLiked(prev => {
        const reverted = !prev
        setCount(c => reverted ? c + 1 : c - 1)
        return reverted
      })
    } finally {
      setLoading(false)
    }
  }

  const ageLabel = post.baby_age_months != null
    ? post.baby_age_months < 12
      ? `${post.baby_age_months}mo`
      : `${Math.floor(post.baby_age_months / 12)}y${post.baby_age_months % 12 ? ` ${post.baby_age_months % 12}mo` : ''}`
    : null

  return (
    <article className="bg-white rounded-2xl border border-sage-200 overflow-hidden">
      <div className="px-6 pt-5 pb-4">
        {/* Author row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-semibold text-brand-700">
                {(post.profiles?.full_name ?? 'M')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[12px] font-medium text-brand-900 leading-none">
                {anonymiseName(post.profiles?.full_name)}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-sage-400">{timeAgo(post.created_at)}</span>
                {ageLabel && (
                  <>
                    <span className="text-sage-200 text-[10px]">·</span>
                    <span className="text-[10px] text-sage-400">Baby {ageLabel}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-brand-900 leading-relaxed mb-4 whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Nest reply */}
        {post.nest_reply && (
          <div className="bg-brand-50 rounded-xl px-4 py-3 mb-4 border-l-2 border-brand-300">
            <p className="text-[10px] uppercase tracking-[0.18em] text-brand-500 mb-1.5">
              Nest
            </p>
            <p className="text-sm text-brand-800 leading-relaxed italic">
              {post.nest_reply}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-1.5 text-[11px] transition-colors ${
              liked ? 'text-brand-600' : 'text-sage-400 hover:text-brand-500'
            }`}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round"
              className={liked ? 'fill-brand-500 stroke-brand-600' : ''}
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            <span>{count > 0 ? count : ''} {count === 1 ? 'like' : count > 1 ? 'likes' : 'Like'}</span>
          </button>
        </div>
      </div>
    </article>
  )
}

export function CommunityFeed({
  initialPosts,
  currentUserId,
  babyAgeMonths,
}: CommunityFeedProps) {
  const [posts, setPosts]         = useState<Post[]>(initialPosts)
  const [draft, setDraft]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const content = draft.trim()
    if (!content || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/community/post', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          content,
          babyAgeMonths: typeof babyAgeMonths === 'number' ? babyAgeMonths : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'moderation_failed') {
          setError("Your post didn't make it through — keep it kind and supportive!")
        } else {
          setError(data.error ?? 'Something went wrong. Please try again.')
        }
        return
      }

      // Prepend new post optimistically with empty profile (will hydrate on next load)
      setPosts(prev => [{
        ...data.post,
        liked_by_me: false,
        profiles: null,
      }, ...prev])
      setDraft('')
    } catch {
      setError('Could not post. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* ── Compose ─────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-sage-200 px-6 py-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">
          Share with the community
        </p>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Share a win, a question, or a moment with other mamas…"
          rows={3}
          maxLength={1000}
          className="
            w-full resize-none text-sm text-brand-900 placeholder-sage-300
            bg-sage-50 rounded-xl px-4 py-3 border border-sage-200
            focus:outline-none focus:border-brand-300 focus:bg-white
            transition-colors leading-relaxed mb-3
          "
        />
        {error && (
          <p className="text-xs text-red-500 mb-3">{error}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-sage-300">
            {draft.length > 0 ? `${1000 - draft.length} left` : ''}
          </span>
          <button
            type="submit"
            disabled={!draft.trim() || submitting}
            className="
              flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 text-white
              text-[11px] uppercase tracking-[0.18em] font-medium
              hover:bg-brand-700 transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {submitting ? (
              <>
                <SpinnerIcon size={13} />
                <span>Posting…</span>
              </>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </form>

      {/* ── Feed ────────────────────────────────────────────────────────── */}
      {posts.length === 0 ? (
        <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-10 text-center">
          <p className="font-display text-base italic text-sage-400 mb-1">
            No posts yet
          </p>
          <p className="text-xs text-sage-400">
            Be the first to share something with the community.
          </p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onLike={() => {}}
          />
        ))
      )}
    </div>
  )
}
