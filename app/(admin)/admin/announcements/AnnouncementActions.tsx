'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Announcement {
  id:         string
  title:      string
  content:    string
  is_pinned:  boolean
  is_active:  boolean
  created_at: string
  updated_at: string
}

const EMPTY_FORM = { title: '', content: '', is_pinned: false, is_active: true }
type FormValues  = typeof EMPTY_FORM

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function AnnouncementActions({ announcements: initial }: { announcements: Announcement[] }) {
  const router = useRouter()

  const [announcements,    setAnnouncements]    = useState<Announcement[]>(initial)
  const [showForm,         setShowForm]         = useState(false)
  const [editingId,        setEditingId]        = useState<string | null>(null)
  const [form,             setForm]             = useState<FormValues>(EMPTY_FORM)
  const [saving,           setSaving]           = useState(false)
  const [error,            setError]            = useState<string | null>(null)
  const [toggling,         setToggling]         = useState<string | null>(null)
  const [deleting,         setDeleting]         = useState<string | null>(null)

  function setField<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openEdit(a: Announcement) {
    setEditingId(a.id)
    setForm({ title: a.title, content: a.content, is_pinned: a.is_pinned, is_active: a.is_active })
    setError(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.')
      return
    }
    setSaving(true)
    setError(null)

    try {
      if (editingId) {
        const res  = await fetch('/api/admin/announcements', {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ id: editingId, ...form }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Failed to save'); return }
        setAnnouncements(prev => prev.map(a => a.id === editingId ? data.announcement : a))
      } else {
        const res  = await fetch('/api/admin/announcements', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Failed to create'); return }
        setAnnouncements(prev => [data.announcement, ...prev])
      }
      closeForm()
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(a: Announcement, field: 'is_pinned' | 'is_active') {
    setToggling(`${a.id}:${field}`)
    try {
      const res  = await fetch('/api/admin/announcements', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id: a.id, [field]: !a[field] }),
      })
      const data = await res.json()
      if (res.ok) setAnnouncements(prev => prev.map(x => x.id === a.id ? data.announcement : x))
    } finally {
      setToggling(null)
    }
  }

  async function handleDelete(a: Announcement) {
    const confirmed = window.confirm(`Delete "${a.title}"?\n\nThis cannot be undone.`)
    if (!confirmed) return
    setDeleting(a.id)
    try {
      await fetch(`/api/admin/announcements?id=${a.id}`, { method: 'DELETE' })
      setAnnouncements(prev => prev.filter(x => x.id !== a.id))
      if (editingId === a.id) closeForm()
    } finally {
      setDeleting(null)
    }
  }

  const INPUT = `w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1c2e1c] transition-colors`

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Admin</p>
          <h1 className="text-2xl font-bold text-gray-900">
            Nest Announcements{' '}
            <span className="text-gray-400 font-normal text-xl">({announcements.length})</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {announcements.filter(a => a.is_active).length} active ·{' '}
            {announcements.filter(a => a.is_pinned).length} pinned
          </p>
        </div>
        <button
          onClick={() => showForm && !editingId ? closeForm() : openAdd()}
          className="px-4 py-2 text-sm bg-[#1c2e1c] text-white rounded-xl hover:bg-[#2d4a2d] transition-colors"
        >
          {showForm && !editingId ? 'Cancel' : '+ New Announcement'}
        </button>
      </div>

      {/* ── Form ────────────────────────────────────────────────────────────── */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-900">
              {editingId ? 'Edit announcement' : 'New announcement'}
            </p>
            {editingId && (
              <button type="button" onClick={closeForm} className="text-[11px] text-gray-400 hover:text-gray-600">
                ✕ Cancel
              </button>
            )}
          </div>

          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Title *</label>
            <input
              className={INPUT} required
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="e.g. Welcome to MindNest Community!"
            />
          </div>

          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Content *</label>
            <textarea
              className={INPUT} rows={4} required
              value={form.content}
              onChange={e => setField('content', e.target.value)}
              placeholder="Write your announcement here…"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_pinned}
                onChange={e => setField('is_pinned', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Pin to top</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setField('is_active', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Active (visible to users)</span>
            </label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#1c2e1c] text-white text-sm rounded-xl hover:bg-[#2d4a2d] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish'}
            </button>
            <button type="button" onClick={closeForm} className="px-5 py-2 text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400 w-[25%]">Title</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400 w-[35%]">Content</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Pinned</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Active</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Created</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map(a => {
              const isEditing = editingId === a.id
              return (
                <tr
                  key={a.id}
                  className={`border-b border-gray-50 last:border-0 transition-colors ${
                    isEditing ? 'bg-amber-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Title */}
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{a.title}</p>
                  </td>

                  {/* Content preview */}
                  <td className="px-5 py-3">
                    <p className="text-[12px] text-gray-500 leading-relaxed">
                      {a.content.length > 80 ? a.content.slice(0, 80) + '…' : a.content}
                    </p>
                  </td>

                  {/* Pinned toggle */}
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggle(a, 'is_pinned')}
                      disabled={toggling === `${a.id}:is_pinned`}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-all disabled:opacity-50 ${
                        a.is_pinned
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {toggling === `${a.id}:is_pinned` ? '…' : a.is_pinned ? '📌 Pinned' : 'Pin'}
                    </button>
                  </td>

                  {/* Active toggle */}
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggle(a, 'is_active')}
                      disabled={toggling === `${a.id}:is_active`}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-all disabled:opacity-50 ${
                        a.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {toggling === `${a.id}:is_active` ? '…' : a.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  {/* Created */}
                  <td className="px-5 py-3 text-gray-400 text-[11px]">{timeAgo(a.created_at)}</td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => isEditing ? closeForm() : openEdit(a)}
                        className={`text-[11px] font-medium transition-colors ${
                          isEditing ? 'text-amber-600 hover:text-amber-700' : 'text-[#1c2e1c] hover:text-[#2d4a2d]'
                        }`}
                      >
                        {isEditing ? 'Close' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDelete(a)}
                        disabled={deleting === a.id}
                        className="text-[11px] text-red-500 hover:text-red-700 font-medium disabled:opacity-50 transition-colors"
                      >
                        {deleting === a.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {announcements.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                  No announcements yet. Create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
