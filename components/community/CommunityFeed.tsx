'use client'

import { useState, useRef } from 'react'
import { SpinnerIcon } from '@/components/ui/icons'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Reactions {
  heart:        number
  me_too:       number
  sending_love: number
}

interface Post {
  id:              string
  content:         string
  baby_age_months: number | null
  age_group:       string | null
  post_type:       string
  likes_count:     number
  reactions:       Reactions
  is_memory_card:  boolean
  milestone_id:    string | null
  nest_reply:      string | null
  created_at:      string
  user_id:         string
  profiles:        { full_name: string } | null
  liked_by_me:     boolean
  my_reactions:    string[]
}

interface AffiliateProduct {
  id:             string
  title:          string
  description:    string | null
  image_url:      string | null
  affiliate_url:  string
  age_min_months: number
  age_max_months: number
  category:       string | null
}

interface CommunityFeedProps {
  initialStagePosts:  Post[]
  initialMemoryPosts: Post[]
  products:           AffiliateProduct[]
  currentUserId:      string
  babyAgeMonths?:     number | null
  ageGroup?:          string | null
}

type Tab      = 'stage' | 'milestones' | 'for_you'
type PostType = 'moment' | 'question'

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function ageGroupLabel(group: string | null | undefined): string {
  const MAP: Record<string, string> = {
    'expecting': 'Expecting',
    '0-3mo':     '0–3 mo',
    '4-6mo':     '4–6 mo',
    '7-12mo':    '7–12 mo',
    '1y':        '1 year',
    '18mo':      '18 months',
    '2y':        '2 years',
    '3y+':       '3+ years',
  }
  return group ? (MAP[group] ?? group) : ''
}

function ageBadge(ageMonths: number | null): string | null {
  if (ageMonths === null) return null
  if (ageMonths < 12) return `${ageMonths}mo`
  const y = Math.floor(ageMonths / 12)
  const m = ageMonths % 12
  return `${y}y${m ? ` ${m}mo` : ''}`
}

// ── PostCard ──────────────────────────────────────────────────────────────────

function PostCard({ post, currentUserId }: { post: Post; currentUserId: string }) {
  const [liked,       setLiked]       = useState(post.liked_by_me)
  const [likeCount,   setLikeCount]   = useState(post.likes_count)
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set(post.my_reactions))
  const [reactions,   setReactions]   = useState<Reactions>(() => {
    const r = post.reactions
    return {
      heart:        r?.heart        ?? 0,
      me_too:       r?.me_too       ?? 0,
      sending_love: r?.sending_love ?? 0,
    }
  })
  const [likeLoading, setLikeLoading]         = useState(false)
  const [reactLoading, setReactLoading]       = useState<string | null>(null)

  async function handleLike() {
    if (likeLoading) return
    setLikeLoading(true)
    setLiked(prev => {
      const nowLiked = !prev
      setLikeCount(c => nowLiked ? c + 1 : c - 1)
      return nowLiked
    })
    try {
      await fetch('/api/community/like', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ postId: post.id }),
      })
    } catch {
      setLiked(prev => {
        const reverted = !prev
        setLikeCount(c => reverted ? c + 1 : c - 1)
        return reverted
      })
    } finally {
      setLikeLoading(false)
    }
  }

  async function handleReact(type: keyof Reactions) {
    if (reactLoading) return
    setReactLoading(type)
    const hadIt = myReactions.has(type)

    // Optimistic
    setMyReactions(prev => {
      const next = new Set(prev)
      hadIt ? next.delete(type) : next.add(type)
      return next
    })
    setReactions(prev => ({
      ...prev,
      [type]: Math.max(0, (prev[type] ?? 0) + (hadIt ? -1 : 1)),
    }))

    try {
      const res  = await fetch('/api/community/react', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ postId: post.id, reactionType: type }),
      })
      const data = await res.json()
      if (res.ok && data.counts) setReactions(data.counts as Reactions)
    } catch {
      // Revert
      setMyReactions(prev => {
        const next = new Set(prev)
        hadIt ? next.add(type) : next.delete(type)
        return next
      })
      setReactions(prev => ({
        ...prev,
        [type]: Math.max(0, (prev[type] ?? 0) + (hadIt ? 1 : -1)),
      }))
    } finally {
      setReactLoading(null)
    }
  }

  const REACTION_CONFIG: { key: keyof Reactions; emoji: string; label: string }[] = [
    { key: 'heart',        emoji: '♥',  label: 'Heart'        },
    { key: 'me_too',       emoji: '🙋', label: 'Me too'       },
    { key: 'sending_love', emoji: '🤍', label: 'Sending love' },
  ]

  const isMemory = post.is_memory_card
  const badge    = ageBadge(post.baby_age_months)

  return (
    <article className={`rounded-2xl border overflow-hidden ${
      isMemory
        ? 'bg-warm-50 border-warm-300 ring-1 ring-warm-200'
        : 'bg-white border-sage-200'
    }`}>
      <div className="px-6 pt-5 pb-4">

        {/* Memory badge */}
        {isMemory && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-brand-600 bg-warm-200 px-2 py-0.5 rounded-full">
              Memory
            </span>
          </div>
        )}

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
                {badge && (
                  <>
                    <span className="text-sage-200 text-[10px]">·</span>
                    <span className="text-[10px] text-sage-400">Baby {badge}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Age group badge */}
          {post.age_group && (
            <span className="text-[9px] uppercase tracking-[0.14em] font-medium text-brand-500 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">
              {ageGroupLabel(post.age_group)}
            </span>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-brand-900 leading-relaxed mb-4 whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Nest reply */}
        {post.nest_reply && (
          <div className={`rounded-xl px-4 py-3 mb-4 border-l-2 ${
            isMemory
              ? 'bg-warm-100 border-warm-400'
              : 'bg-brand-50 border-brand-300'
          }`}>
            <p className="text-[10px] uppercase tracking-[0.18em] text-brand-500 mb-1.5">Nest</p>
            <p className="text-sm text-brand-800 leading-relaxed italic">{post.nest_reply}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Heart (like) */}
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1 text-[11px] transition-colors ${
              liked ? 'text-brand-600' : 'text-sage-400 hover:text-brand-500'
            }`}
          >
            <svg
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              className={liked ? 'fill-brand-500 stroke-brand-600' : ''}
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            <span>{likeCount > 0 ? likeCount : ''} {likeCount === 1 ? 'like' : likeCount > 1 ? 'likes' : 'Like'}</span>
          </button>

          {/* Reactions */}
          {REACTION_CONFIG.map(({ key, emoji, label }) => {
            const active = myReactions.has(key)
            const count  = reactions[key] ?? 0
            return (
              <button
                key={key}
                onClick={() => handleReact(key)}
                disabled={reactLoading !== null}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                  active
                    ? 'border-brand-300 bg-brand-50 text-brand-700'
                    : 'border-sage-200 text-sage-400 hover:border-sage-300 hover:text-sage-600'
                } disabled:opacity-50`}
              >
                <span>{emoji}</span>
                <span>{count > 0 ? count : label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </article>
  )
}

// ── ProductCard ───────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: AffiliateProduct }) {
  const ageRange = product.age_min_months === 0 && product.age_max_months >= 48
    ? 'All ages'
    : `${product.age_min_months}–${product.age_max_months} months`

  return (
    <a
      href={product.affiliate_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl border border-sage-200 overflow-hidden hover:border-brand-300 hover:shadow-sm transition-all group"
    >
      {product.image_url && (
        <div className="h-36 bg-sage-50 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      )}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-medium text-brand-900 leading-snug">{product.title}</p>
          {product.category && (
            <span className="text-[9px] uppercase tracking-[0.14em] bg-sage-100 text-sage-600 px-2 py-0.5 rounded-full shrink-0">
              {product.category}
            </span>
          )}
        </div>
        {product.description && (
          <p className="text-[12px] text-sage-500 leading-relaxed mb-3">{product.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-sage-400">{ageRange}</span>
          <span className="text-[11px] font-medium text-brand-600 group-hover:text-brand-700 transition-colors">
            View product →
          </span>
        </div>
      </div>
    </a>
  )
}

// ── CommunityFeed ─────────────────────────────────────────────────────────────

export function CommunityFeed({
  initialStagePosts,
  initialMemoryPosts,
  products,
  currentUserId,
  babyAgeMonths,
  ageGroup,
}: CommunityFeedProps) {
  const [activeTab, setActiveTab]         = useState<Tab>('stage')
  const [stagePosts,  setStagePosts]      = useState<Post[]>(initialStagePosts)
  const [draft,       setDraft]           = useState('')
  const [postType,    setPostType]        = useState<PostType>('moment')
  const [submitting,  setSubmitting]      = useState(false)
  const [error,       setError]           = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const TABS: { id: Tab; label: string }[] = [
    { id: 'stage',      label: 'Your Stage'  },
    { id: 'milestones', label: 'Milestones'  },
    { id: 'for_you',    label: 'For You'     },
  ]

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
          post_type:     postType,
          babyAgeMonths: typeof babyAgeMonths === 'number' ? babyAgeMonths : undefined,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(
          data.error === 'moderation_failed'
            ? "Your post didn't make it through — keep it kind and supportive!"
            : (data.error ?? 'Something went wrong. Please try again.'),
        )
        return
      }

      setStagePosts(prev => [{
        ...data.post,
        liked_by_me:  false,
        my_reactions: [],
        profiles:     null,
      }, ...prev])
      setDraft('')
    } catch {
      setError('Could not post. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  const stageLabel = ageGroupLabel(ageGroup)

  return (
    <div className="space-y-5">
      {/* ── Tab navigation ───────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-sage-50 rounded-2xl p-1 border border-sage-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-xl text-[11px] uppercase tracking-[0.14em] font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-brand-900 shadow-sm border border-sage-200'
                : 'text-sage-400 hover:text-sage-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ YOUR STAGE TAB ════════════════════════════════════════════════════ */}
      {activeTab === 'stage' && (
        <>
          {/* Weekly highlight banner */}
          <div className="bg-brand-50 border border-brand-100 rounded-2xl px-5 py-4 flex items-start gap-3">
            <span className="text-xl leading-none mt-0.5">🌱</span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-brand-600 mb-0.5">
                Welcome to {stageLabel ? `the ${stageLabel} stage` : 'your stage'}
              </p>
              <p className="text-[12px] text-brand-800 leading-relaxed">
                You're in great company. Share a moment, ask a question — every post gets a personal reply from Nest.
              </p>
            </div>
          </div>

          {/* Compose box */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-sage-200 px-6 py-5">
            {/* Post type selector */}
            <div className="flex gap-2 mb-4">
              {(['moment', 'question'] as PostType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPostType(type)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-[0.14em] font-medium transition-all border ${
                    postType === type
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-sage-200 text-sage-400 hover:border-sage-300 hover:text-sage-600'
                  }`}
                >
                  {type === 'moment' ? '✦ Moment' : '? Question'}
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={
                postType === 'question'
                  ? 'Ask the community anything…'
                  : 'Share a win, a moment, or something on your mind…'
              }
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
                  <><SpinnerIcon size={13} /><span>Posting…</span></>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </form>

          {/* Stage feed */}
          {stagePosts.length === 0 ? (
            <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-10 text-center">
              <p className="font-display text-base italic text-sage-400 mb-1">No posts yet in your stage</p>
              <p className="text-xs text-sage-400">Be the first to share something with parents at the same stage.</p>
            </div>
          ) : (
            stagePosts.map(post => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} />
            ))
          )}
        </>
      )}

      {/* ══ MILESTONES TAB ════════════════════════════════════════════════════ */}
      {activeTab === 'milestones' && (
        <>
          <div className="bg-warm-50 border border-warm-200 rounded-2xl px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-brand-600 mb-0.5">Memory cards</p>
            <p className="text-[12px] text-brand-800 leading-relaxed">
              Milestone moments shared by parents in your community — celebrate every first.
            </p>
          </div>

          {initialMemoryPosts.length === 0 ? (
            <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-10 text-center">
              <p className="font-display text-base italic text-sage-400 mb-1">No milestone posts yet</p>
              <p className="text-xs text-sage-400">
                When you note a milestone, you can share it here as a memory card.
              </p>
            </div>
          ) : (
            initialMemoryPosts.map(post => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} />
            ))
          )}
        </>
      )}

      {/* ══ FOR YOU TAB ═══════════════════════════════════════════════════════ */}
      {activeTab === 'for_you' && (
        <>
          <div className="bg-brand-50 border border-brand-100 rounded-2xl px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-brand-600 mb-0.5">Recommended for your stage</p>
            <p className="text-[12px] text-brand-800 leading-relaxed">
              Products our team has selected for parents{stageLabel ? ` in the ${stageLabel} stage` : ''}.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-10 text-center">
              <p className="font-display text-base italic text-sage-400 mb-1">Nothing here yet</p>
              <p className="text-xs text-sage-400">We're curating the best products for your stage — check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
