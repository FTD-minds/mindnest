'use client'

import { useState, useTransition } from 'react'
import { CheckIcon, SpinnerIcon } from '@/components/ui/icons'

interface MilestoneCardProps {
  id:           string
  babyId:       string
  title:        string
  description:  string
  howToSupport: string
  brainArea:    string
  isEmerging:   boolean
  isNoted:      boolean
  isPremium?:   boolean
  babyName?:    string
}

const AREA_COLORS: Record<string, string> = {
  'Language':         'bg-brand-100 text-brand-700',
  'Motor':            'bg-green-100 text-green-700',
  'Social-Emotional': 'bg-warm-100 text-warm-700',
  'Cognitive':        'bg-purple-100 text-purple-700',
  'Sensory':          'bg-blue-100 text-blue-700',
}

export function MilestoneCard({
  id, babyId, title, description, howToSupport, brainArea,
  isEmerging, isNoted: initialIsNoted,
  isPremium = false, babyName,
}: MilestoneCardProps) {
  const [isNoted,          setIsNoted]          = useState(initialIsNoted)
  const [expanded,         setExpanded]         = useState(false)
  const [showSharePrompt,  setShowSharePrompt]  = useState(false)
  const [shareStatus,      setShareStatus]      = useState<'idle' | 'sharing' | 'shared'>('idle')
  const [, startTransition] = useTransition()

  async function handleToggle() {
    const next = !isNoted
    setIsNoted(next)
    // Show share prompt when noting (not un-noting), premium only
    if (next && isPremium) {
      setShowSharePrompt(true)
      setShareStatus('idle')
    } else {
      setShowSharePrompt(false)
    }
    startTransition(async () => {
      await fetch('/api/milestones/note', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ babyId, milestoneId: id }),
      })
    })
  }

  async function handleShare() {
    setShareStatus('sharing')
    const name    = babyName ?? 'My baby'
    const content = `🌱 ${name} just reached: ${title}!`
    try {
      await fetch('/api/community/post', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          content,
          is_memory_card: true,
          milestone_id:   id,
        }),
      })
      setShareStatus('shared')
      setTimeout(() => setShowSharePrompt(false), 1800)
    } catch {
      setShareStatus('idle')
    }
  }

  function handleSkip() {
    setShowSharePrompt(false)
  }

  const areaColor = AREA_COLORS[brainArea] ?? 'bg-sage-100 text-sage-600'

  return (
    <div
      className={`
        bg-white rounded-2xl border px-5 py-4 transition-all
        ${isNoted ? 'border-brand-300 ring-1 ring-brand-100' : 'border-sage-200'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Check button */}
        <button
          onClick={handleToggle}
          className={`
            flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center mt-0.5
            transition-all
            ${isNoted
              ? 'bg-brand-600 border-brand-600 text-white'
              : 'border-sage-300 text-transparent hover:border-brand-400'
            }
          `}
        >
          <CheckIcon size={13} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${areaColor}`}>
              {brainArea}
            </span>
            {isEmerging && (
              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-warm-200 text-warm-700">
                Emerging now
              </span>
            )}
          </div>

          <p className={`text-sm font-medium leading-snug ${isNoted ? 'text-brand-700' : 'text-brand-900'}`}>
            {title}
            {isNoted && (
              <span className="ml-2 text-[9px] uppercase tracking-wider text-brand-500 font-medium">✓ Noted</span>
            )}
          </p>

          <p className="text-[12px] text-sage-500 mt-1 leading-relaxed">{description}</p>

          {/* Support tip — expandable */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-[11px] text-brand-600 hover:text-brand-700 mt-2 font-medium"
          >
            {expanded ? 'Hide tip ↑' : 'How to support →'}
          </button>

          {expanded && (
            <div className="mt-2 bg-brand-50 rounded-xl px-4 py-3">
              <p className="text-[12px] text-brand-800 leading-relaxed">{howToSupport}</p>
            </div>
          )}

          {/* Share prompt — only shows after noting, premium users only */}
          {showSharePrompt && (
            <div className="mt-3 bg-warm-50 border border-warm-200 rounded-xl px-4 py-3">
              {shareStatus === 'shared' ? (
                <p className="text-[12px] text-brand-700 font-medium">
                  🌱 Shared to the community!
                </p>
              ) : (
                <>
                  <p className="text-[12px] text-brand-800 mb-2.5 leading-relaxed">
                    Share this milestone with the community?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShare}
                      disabled={shareStatus === 'sharing'}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-[11px] font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
                    >
                      {shareStatus === 'sharing' ? (
                        <><SpinnerIcon size={11} /><span>Sharing…</span></>
                      ) : (
                        'Share'
                      )}
                    </button>
                    <button
                      onClick={handleSkip}
                      className="px-3 py-1.5 text-[11px] text-sage-400 hover:text-sage-600 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
