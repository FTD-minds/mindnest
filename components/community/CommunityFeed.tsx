'use client'

import { useState, useRef, useEffect } from 'react'
import { SpinnerIcon } from '@/components/ui/icons'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Reactions {
  heart:        number
  me_too:       number
  sending_love: number
}

export interface Category {
  id:            string
  name:          string
  icon:          string
  slug:          string
  category_type: string
}

interface Post {
  id:                string
  content:           string
  baby_age_months:   number | null
  age_group:         string | null
  post_type:         string
  likes_count:       number
  reactions:         Reactions
  is_memory_card:    boolean
  milestone_id:      string | null
  category_id:       string | null
  topic_category_id: string | null
  comment_count:     number
  nest_reply:        string | null
  created_at:        string
  user_id:           string
  profiles:          { full_name: string } | null
  liked_by_me:       boolean
  my_reactions:      string[]
}

interface Comment {
  id:           string
  post_id:      string
  parent_id:    string | null
  content:      string
  reactions:    Reactions
  my_reactions: string[]
  created_at:   string
  profiles:     { full_name: string } | null
  replies?:     Comment[]
}

interface Announcement {
  id:         string
  title:      string
  content:    string
  is_pinned:  boolean
  is_active:  boolean
  created_at: string
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
  stageCategories:    Category[]
  topicCategories:    Category[]
  currentUserId:      string
  babyAgeMonths?:     number | null
  ageGroup?:          string | null
  stageCategoryId?:   string | null
}

type Tab      = 'stage' | 'milestones' | 'for_you'
type PostType = 'moment' | 'question'
type Sort     = 'newest' | 'top'

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

function totalReactions(r: Reactions): number {
  return (r.heart ?? 0) + (r.me_too ?? 0) + (r.sending_love ?? 0)
}

function nestComments(flat: Comment[]): Comment[] {
  const top     = flat.filter(c => !c.parent_id)
  const replies = flat.filter(c =>  c.parent_id)
  return top.map(c => ({ ...c, replies: replies.filter(r => r.parent_id === c.id) }))
}

function getStageBanner(ageGroup: string | null | undefined): { title: string; body: string } {
  switch (ageGroup) {
    case 'expecting':
      return {
        title: 'Welcome to the Expecting Stage',
        body:  "You're surrounded by moms on the same journey. Ask anything — no question is too small.",
      }
    case '0-3mo':
      return {
        title: 'Welcome to the Newborn Stage',
        body:  "The fourth trimester is real. You're not alone — thousands of moms are right here with you.",
      }
    case '4-6mo':
    case '7-12mo':
      return {
        title: 'Welcome to the Baby Stage',
        body:  'First foods, first words, first everything. Share the moments and the questions.',
      }
    case '1y':
    case '18mo':
    case '2y':
    case '3y+':
      return {
        title: 'Welcome to the Toddler Stage',
        body:  'Big feelings, big milestones. Connect with moms who get it.',
      }
    default:
      return {
        title: 'Welcome to Your Stage',
        body:  "You're in great company. Share a moment, ask a question — we're all in this together.",
      }
  }
}

const REACTION_CONFIG: { key: keyof Reactions; emoji: string; label: string }[] = [
  { key: 'heart',        emoji: '♥',  label: 'Heart'        },
  { key: 'me_too',       emoji: '🙋', label: 'Me too'       },
  { key: 'sending_love', emoji: '🤍', label: 'Sending love' },
]

// ── ReactionRow — shared between posts and comments ───────────────────────────

function ReactionRow({
  reactions,
  myReactions,
  onReact,
  loading,
}: {
  reactions:   Reactions
  myReactions: string[]
  onReact:     (type: keyof Reactions) => void
  loading:     string | null
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {REACTION_CONFIG.map(({ key, emoji, label }) => {
        const active = myReactions.includes(key)
        const count  = reactions[key] ?? 0
        return (
          <button
            key={key}
            onClick={() => onReact(key)}
            disabled={loading !== null}
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
  )
}

// ── CommentThread ─────────────────────────────────────────────────────────────

function CommentThread({
  postId,
  initialCount,
  onCommentAdded,
}: {
  postId:         string
  initialCount:   number
  onCommentAdded: () => void
}) {
  const [open,        setOpen]        = useState(false)
  const [loaded,      setLoaded]      = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [comments,    setComments]    = useState<Comment[]>([])
  const [localCount,  setLocalCount]  = useState(initialCount)
  const [sort,        setSort]        = useState<Sort>('newest')
  const [draft,       setDraft]       = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [replyingTo,  setReplyingTo]  = useState<string | null>(null)
  const [replyDraft,  setReplyDraft]  = useState('')
  const [replyingErr, setReplyingErr] = useState<string | null>(null)

  const [commentReactions, setCommentReactions] = useState<
    Record<string, { reactions: Reactions; myReactions: string[]; loading: string | null }>
  >({})

  async function loadComments() {
    setLoading(true)
    try {
      const res  = await fetch(`/api/community/comments?postId=${postId}`)
      const data = await res.json()
      if (!res.ok) return
      const flat: Comment[] = data.comments ?? []
      setComments(flat)
      const map: typeof commentReactions = {}
      for (const c of flat) {
        map[c.id] = {
          reactions:   { heart: c.reactions?.heart ?? 0, me_too: c.reactions?.me_too ?? 0, sending_love: c.reactions?.sending_love ?? 0 },
          myReactions: c.my_reactions ?? [],
          loading:     null,
        }
      }
      setCommentReactions(map)
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }

  function handleToggle() {
    const next = !open
    setOpen(next)
    if (next && !loaded) loadComments()
  }

  async function handleCommentReact(commentId: string, type: keyof Reactions) {
    const current = commentReactions[commentId]
    if (!current || current.loading) return

    const hadIt = current.myReactions.includes(type)

    setCommentReactions(prev => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        loading:     type,
        myReactions: hadIt
          ? prev[commentId].myReactions.filter(r => r !== type)
          : [...prev[commentId].myReactions, type],
        reactions: {
          ...prev[commentId].reactions,
          [type]: Math.max(0, (prev[commentId].reactions[type] ?? 0) + (hadIt ? -1 : 1)),
        },
      },
    }))

    try {
      const res  = await fetch('/api/community/comment-react', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ commentId, reactionType: type }),
      })
      const data = await res.json()
      if (res.ok && data.counts) {
        setCommentReactions(prev => ({
          ...prev,
          [commentId]: { ...prev[commentId], reactions: data.counts, loading: null },
        }))
        return
      }
    } catch {
      setCommentReactions(prev => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          loading:     null,
          myReactions: hadIt
            ? [...prev[commentId].myReactions, type]
            : prev[commentId].myReactions.filter(r => r !== type),
          reactions: {
            ...prev[commentId].reactions,
            [type]: Math.max(0, (prev[commentId].reactions[type] ?? 0) + (hadIt ? 1 : -1)),
          },
        },
      }))
    }
    setCommentReactions(prev => ({ ...prev, [commentId]: { ...prev[commentId], loading: null } }))
  }

  async function submitComment(content: string, parentId: string | null) {
    const trimmed = content.trim()
    if (!trimmed) return

    setSubmitting(true)
    if (parentId) setReplyingErr(null)
    else setSubmitError(null)

    try {
      const res  = await fetch('/api/community/comments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ postId, content: trimmed, parentId }),
      })
      const data = await res.json()

      if (!res.ok) {
        const msg = data.error === 'moderation_failed'
          ? "That comment didn't quite fit our guidelines — keep it kind and supportive!"
          : (data.message ?? data.error ?? 'Something went wrong.')
        if (parentId) setReplyingErr(msg)
        else setSubmitError(msg)
        return
      }

      const newComment: Comment = { ...data.comment, replies: [] }
      setComments(prev => [...prev, newComment])
      setCommentReactions(prev => ({
        ...prev,
        [newComment.id]: { reactions: { heart: 0, me_too: 0, sending_love: 0 }, myReactions: [], loading: null },
      }))
      setLocalCount(c => c + 1)
      onCommentAdded()

      if (parentId) { setReplyDraft(''); setReplyingTo(null) }
      else setDraft('')
    } finally {
      setSubmitting(false)
    }
  }

  const nested = nestComments(comments)
  const sorted = [...nested].sort((a, b) => {
    if (sort === 'top') return totalReactions(commentReactions[b.id]?.reactions ?? b.reactions) - totalReactions(commentReactions[a.id]?.reactions ?? a.reactions)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const countLabel = localCount === 0
    ? 'Reply'
    : localCount === 1 ? '1 reply' : `${localCount} replies`

  return (
    <>
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-[11px] text-sage-400 hover:text-brand-600 transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        <span>{countLabel}</span>
      </button>

      {open && (
        <div className="border-t border-sage-100 mt-1 pt-4">
          <div className="flex items-center justify-between mb-3 px-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-sage-400">
              {localCount > 0 ? `${localCount} ${localCount === 1 ? 'reply' : 'replies'}` : 'Replies'}
            </p>
            {localCount > 1 && (
              <div className="flex items-center gap-1 bg-sage-50 rounded-full p-0.5 border border-sage-200">
                {(['newest', 'top'] as Sort[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                      sort === s ? 'bg-white text-brand-800 shadow-sm' : 'text-sage-400'
                    }`}
                  >
                    {s === 'newest' ? 'Newest' : 'Top'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 space-y-4 mb-4">
            {loading && (
              <div className="flex justify-center py-4">
                <SpinnerIcon size={16} />
              </div>
            )}

            {!loading && loaded && sorted.length === 0 && (
              <p className="text-[12px] text-sage-400 italic text-center py-2">
                No replies yet — be the first to share some love.
              </p>
            )}

            {sorted.map(comment => {
              const cr = commentReactions[comment.id] ?? {
                reactions:   comment.reactions,
                myReactions: comment.my_reactions ?? [],
                loading:     null,
              }
              return (
                <div key={comment.id}>
                  <CommentBubble
                    comment={comment}
                    reactions={cr.reactions}
                    myReactions={cr.myReactions}
                    reactLoading={cr.loading}
                    onReact={type => handleCommentReact(comment.id, type)}
                    onReply={() => {
                      setReplyingTo(replyingTo === comment.id ? null : comment.id)
                      setReplyDraft('')
                      setReplyingErr(null)
                    }}
                    showReplyButton
                  />

                  {(comment.replies ?? []).map(reply => {
                    const rr = commentReactions[reply.id] ?? {
                      reactions:   reply.reactions,
                      myReactions: reply.my_reactions ?? [],
                      loading:     null,
                    }
                    return (
                      <div key={reply.id} className="ml-8 mt-2">
                        <CommentBubble
                          comment={reply}
                          reactions={rr.reactions}
                          myReactions={rr.myReactions}
                          reactLoading={rr.loading}
                          onReact={type => handleCommentReact(reply.id, type)}
                          onReply={() => {}}
                          showReplyButton={false}
                        />
                      </div>
                    )
                  })}

                  {replyingTo === comment.id && (
                    <div className="ml-8 mt-2">
                      <textarea
                        value={replyDraft}
                        onChange={e => setReplyDraft(e.target.value)}
                        placeholder="Write a reply…"
                        rows={2}
                        maxLength={500}
                        className="w-full resize-none text-[12px] text-brand-900 placeholder-sage-300 bg-sage-50 rounded-xl px-3 py-2 border border-sage-200 focus:outline-none focus:border-brand-300 focus:bg-white transition-colors leading-relaxed"
                      />
                      {replyingErr && <p className="text-[11px] text-red-500 mt-1">{replyingErr}</p>}
                      <div className="flex gap-2 mt-1.5">
                        <button
                          onClick={() => submitComment(replyDraft, comment.id)}
                          disabled={!replyDraft.trim() || submitting}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-[10px] uppercase tracking-[0.14em] font-medium hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {submitting ? '…' : 'Reply'}
                        </button>
                        <button
                          onClick={() => { setReplyingTo(null); setReplyDraft(''); setReplyingErr(null) }}
                          className="px-3 py-1.5 text-[10px] text-sage-400 hover:text-sage-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="px-6 pb-4 border-t border-sage-100 pt-3">
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Add a reply…"
              rows={2}
              maxLength={500}
              className="w-full resize-none text-[12px] text-brand-900 placeholder-sage-300 bg-sage-50 rounded-xl px-3 py-2 border border-sage-200 focus:outline-none focus:border-brand-300 focus:bg-white transition-colors leading-relaxed"
            />
            {submitError && <p className="text-[11px] text-red-500 mt-1">{submitError}</p>}
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[10px] text-sage-300 italic">Your reply will be reviewed before appearing.</p>
              <button
                onClick={() => submitComment(draft, null)}
                disabled={!draft.trim() || submitting}
                className="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-[10px] uppercase tracking-[0.14em] font-medium hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? '…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── CommentBubble ─────────────────────────────────────────────────────────────

function CommentBubble({
  comment,
  reactions,
  myReactions,
  reactLoading,
  onReact,
  onReply,
  showReplyButton,
}: {
  comment:         Comment
  reactions:       Reactions
  myReactions:     string[]
  reactLoading:    string | null
  onReact:         (type: keyof Reactions) => void
  onReply:         () => void
  showReplyButton: boolean
}) {
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-[10px] font-semibold text-sage-600">
          {(comment.profiles?.full_name ?? 'M')[0].toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-sage-50 rounded-xl px-3 py-2.5 border border-sage-100">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-medium text-brand-900">
              {anonymiseName(comment.profiles?.full_name)}
            </span>
            <span className="text-sage-200 text-[10px]">·</span>
            <span className="text-[10px] text-sage-400">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-[12px] text-brand-900 leading-relaxed">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1.5 pl-1">
          <ReactionRow
            reactions={reactions}
            myReactions={myReactions}
            onReact={onReact}
            loading={reactLoading}
          />
          {showReplyButton && (
            <button
              onClick={onReply}
              className="text-[10px] text-sage-400 hover:text-brand-600 transition-colors"
            >
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── PostCard ──────────────────────────────────────────────────────────────────

function PostCard({
  post,
  currentUserId,
  topicCategories,
}: {
  post:            Post
  currentUserId:   string
  topicCategories: Category[]
}) {
  const [myReactions,  setMyReactions]  = useState<string[]>(post.my_reactions ?? [])
  const [reactions,    setReactions]    = useState<Reactions>(() => ({
    heart:        post.reactions?.heart        ?? 0,
    me_too:       post.reactions?.me_too       ?? 0,
    sending_love: post.reactions?.sending_love ?? 0,
  }))
  const [reactLoading, setReactLoading] = useState<string | null>(null)
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0)

  async function handleReact(type: keyof Reactions) {
    if (reactLoading) return
    setReactLoading(type)
    const hadIt = myReactions.includes(type)
    setMyReactions(prev => hadIt ? prev.filter(r => r !== type) : [...prev, type])
    setReactions(prev => ({ ...prev, [type]: Math.max(0, (prev[type] ?? 0) + (hadIt ? -1 : 1)) }))

    try {
      const res  = await fetch('/api/community/react', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ postId: post.id, reactionType: type }),
      })
      const data = await res.json()
      if (res.ok && data.counts) setReactions(data.counts as Reactions)
    } catch {
      setMyReactions(prev => hadIt ? [...prev, type] : prev.filter(r => r !== type))
      setReactions(prev => ({ ...prev, [type]: Math.max(0, (prev[type] ?? 0) + (hadIt ? 1 : -1)) }))
    } finally {
      setReactLoading(null)
    }
  }

  const isMemory   = post.is_memory_card
  const badge      = ageBadge(post.baby_age_months)
  const topicTag   = topicCategories.find(c => c.id === post.topic_category_id)

  // Suppress unused variable warning — currentUserId reserved for future moderation UI
  void currentUserId

  return (
    <article className={`rounded-2xl border overflow-hidden ${
      isMemory
        ? 'bg-warm-50 border-warm-300 ring-1 ring-warm-200'
        : 'bg-white border-sage-200'
    }`}>
      <div className="px-6 pt-5 pb-4">

        {/* Badges row */}
        {(isMemory || topicTag) && (
          <div className="flex items-center gap-2 mb-3">
            {isMemory && (
              <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-brand-600 bg-warm-200 px-2 py-0.5 rounded-full">
                Memory
              </span>
            )}
            {topicTag && (
              <span className="text-[10px] font-medium text-sage-600 bg-sage-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>{topicTag.icon}</span>
                <span>{topicTag.name}</span>
              </span>
            )}
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
            isMemory ? 'bg-warm-100 border-warm-400' : 'bg-brand-50 border-brand-300'
          }`}>
            <p className="text-[10px] uppercase tracking-[0.18em] text-brand-500 mb-1.5">Nest</p>
            <p className="text-sm text-brand-800 leading-relaxed italic">{post.nest_reply}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <ReactionRow
            reactions={reactions}
            myReactions={myReactions}
            onReact={handleReact}
            loading={reactLoading}
          />
          <span className="text-sage-200 text-[10px]">·</span>
          <CommentThread
            postId={post.id}
            initialCount={commentCount}
            onCommentAdded={() => setCommentCount(c => c + 1)}
          />
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
      href={`/api/affiliate/click?id=${product.id}`}
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

// ── NestAvatar — slowly spinning Seed of Life orb ────────────────────────────

function NestAvatar() {
  return (
    <svg
      viewBox="0 0 220 220"
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10 rounded-full flex-shrink-0"
      style={{
        animation:  'spin 8s linear infinite',
        filter:     'drop-shadow(0 0 5px rgba(74,138,90,0.45))',
      }}
    >
      <defs>
        <radialGradient id="naG" cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor="#4a8a5a" />
          <stop offset="30%"  stopColor="#2a5a35" />
          <stop offset="65%"  stopColor="#1a3a22" />
          <stop offset="100%" stopColor="#081408" />
        </radialGradient>
        <radialGradient id="naH" cx="35%" cy="28%" r="40%">
          <stop offset="0%"   stopColor="#a0f0b0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <clipPath id="naC"><circle cx="110" cy="110" r="98" /></clipPath>
      </defs>
      <circle cx="110" cy="110" r="108" fill="none" stroke="#2a6a35" strokeWidth="0.5" opacity="0.3" />
      <circle cx="110" cy="110" r="98"  fill="url(#naG)" />
      <g clipPath="url(#naC)" stroke="#7ae890" strokeWidth="0.8" fill="none" opacity="0.65">
        <circle cx="110" cy="110" r="30" />
        <circle cx="110" cy="80"  r="30" />
        <circle cx="136" cy="95"  r="30" />
        <circle cx="136" cy="125" r="30" />
        <circle cx="110" cy="140" r="30" />
        <circle cx="84"  cy="125" r="30" />
        <circle cx="84"  cy="95"  r="30" />
      </g>
      <circle cx="110" cy="110" r="98" fill="url(#naH)" />
    </svg>
  )
}

// ── AnnouncementCard ──────────────────────────────────────────────────────────

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <article className="relative rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 overflow-hidden ring-1 ring-amber-100">
      {/* Accent bar */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

      <div className="px-6 pt-6 pb-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          <NestAvatar />
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-semibold text-brand-900">Nest</span>
              {/* Verified badge */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-brand-500 flex-shrink-0">
                <path
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
                <polyline points="9 12 11 14 15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Announcement badge */}
              <span className="text-[9px] uppercase tracking-[0.2em] font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                Announcement
              </span>
              {announcement.is_pinned && (
                <span className="text-[9px] text-amber-600">📌</span>
              )}
            </div>
            <p className="text-[10px] text-amber-700 mt-0.5 opacity-70">
              {timeAgo(announcement.created_at)}
            </p>
          </div>
        </div>

        {/* Title */}
        <p className="text-[13px] font-semibold text-brand-900 mb-2">{announcement.title}</p>

        {/* Content */}
        <p className="text-sm text-brand-800 leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
      </div>
    </article>
  )
}

// ── FilterChips — reusable chip row ──────────────────────────────────────────

function FilterChips({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[]
  selected:   string | null
  onSelect:   (id: string | null) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
          selected === null
            ? 'bg-brand-600 text-white border-brand-600'
            : 'bg-white text-sage-600 border-sage-200 hover:border-brand-300 hover:text-brand-700'
        }`}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(selected === cat.id ? null : cat.id)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
            selected === cat.id
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-sage-600 border-sage-200 hover:border-brand-300 hover:text-brand-700'
          }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  )
}

// ── CommunityFeed ─────────────────────────────────────────────────────────────

export function CommunityFeed({
  initialStagePosts,
  initialMemoryPosts,
  products,
  stageCategories,
  topicCategories,
  currentUserId,
  babyAgeMonths,
  ageGroup,
  stageCategoryId,
}: CommunityFeedProps) {
  const hasInitial = (initialStagePosts?.length ?? 0) > 0

  const [activeTab,        setActiveTab]        = useState<Tab>('stage')
  const [stagePosts,       setStagePosts]       = useState<Post[]>(initialStagePosts ?? [])
  const [announcements,    setAnnouncements]    = useState<Announcement[]>([])
  const [loading,          setLoading]          = useState(!hasInitial)
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(stageCategoryId ?? null)

  useEffect(() => {
    setLoading(true)
    fetch('https://sbaqdbqcyabpvbldkouh.supabase.co/functions/v1/community-feed')
      .then(r => r.json())
      .then(data => {
        console.log('[CommunityFeed] Got posts:', data.length)
        if (Array.isArray(data)) setStagePosts(data as Post[])
        setLoading(false)
      })
      .catch(err => {
        console.error('[CommunityFeed] Error:', err)
        setLoading(false)
      })

    fetch('/api/community/announcements')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setAnnouncements(data as Announcement[])
      })
      .catch(() => {})
  }, [])
  const [topicCategoryId,  setTopicCategoryId]  = useState<string | null>(null)
  const [draft,             setDraft]             = useState('')
  const [postType,          setPostType]          = useState<PostType>('moment')
  const [submitting,        setSubmitting]        = useState(false)
  const [error,             setError]             = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const TABS: { id: Tab; label: string }[] = [
    { id: 'stage',      label: 'Your Stage'  },
    { id: 'milestones', label: 'Milestones'  },
    { id: 'for_you',    label: 'For You'     },
  ]

  const filteredStagePosts = selectedFilterId === null
    ? stagePosts
    : stagePosts.filter(p =>
        p.category_id === selectedFilterId || p.topic_category_id === selectedFilterId
      )

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
          post_type:          postType,
          category_id:        stageCategoryId,
          topic_category_id:  topicCategoryId,
          babyAgeMonths:      typeof babyAgeMonths === 'number' ? babyAgeMonths : undefined,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(
          data.error === 'moderation_failed'
            ? "That post didn't quite fit our community guidelines — keep it kind and supportive!"
            : (data.error ?? 'Something went wrong. Please try again.'),
        )
        return
      }

      setStagePosts(prev => [{
        ...data.post,
        liked_by_me:  false,
        my_reactions: [],
        profiles:     null,
        comment_count: 0,
      }, ...prev])
      setDraft('')
      setTopicCategoryId(null)
    } catch {
      setError('Could not post. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  const banner       = getStageBanner(ageGroup)
  const myStageLabel = stageCategories.find(c => c.id === stageCategoryId)
  const stageLabel   = ageGroupLabel(ageGroup)

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
          {/* Welcome banner */}
          <div className="bg-brand-50 border border-brand-100 rounded-2xl px-5 py-4 flex items-start gap-3">
            <span className="text-xl leading-none mt-0.5">🌱</span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-brand-600 mb-0.5">
                {banner.title}
              </p>
              <p className="text-[12px] text-brand-800 leading-relaxed">
                {banner.body}
              </p>
            </div>
          </div>

          {/* Combined filter chips — stage + topic in one row */}
          {(stageCategories.length > 0 || topicCategories.length > 0) && (
            <FilterChips
              categories={[...stageCategories, ...topicCategories]}
              selected={selectedFilterId}
              onSelect={setSelectedFilterId}
            />
          )}

          {/* Compose box */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-sage-200 px-6 py-5">
            {/* Post type toggle */}
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

            {/* Auto-stage label */}
            {myStageLabel && (
              <p className="text-[11px] text-sage-500 mb-3">
                Posting in: <span className="font-medium text-brand-700">{myStageLabel.icon} {myStageLabel.name}</span>
              </p>
            )}

            {/* Optional topic picker */}
            {topicCategories.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-sage-400 mb-2">
                  Topic <span className="normal-case tracking-normal text-sage-300">(optional)</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {topicCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTopicCategoryId(topicCategoryId === cat.id ? null : cat.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                        topicCategoryId === cat.id
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-sage-200 text-sage-400 hover:border-sage-300 hover:text-sage-600'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

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

          {/* Nest announcements — always shown regardless of filter */}
          {announcements.map(a => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}

          {/* Stage feed */}
          {loading ? (
            <div className="flex justify-center py-10">
              <SpinnerIcon size={20} className="text-brand-400" />
            </div>
          ) : filteredStagePosts.length === 0 ? (
            <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-10 text-center">
              <p className="font-display text-base italic text-sage-400 mb-1">
                {selectedFilterId ? 'No posts match this filter' : 'No posts yet'}
              </p>
              <p className="text-xs text-sage-400">Be the first to share something with parents at the same stage.</p>
            </div>
          ) : (
            filteredStagePosts.map(post => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} topicCategories={topicCategories} />
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
              <PostCard key={post.id} post={post} currentUserId={currentUserId} topicCategories={topicCategories} />
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
