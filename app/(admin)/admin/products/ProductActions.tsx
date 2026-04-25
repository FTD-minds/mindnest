'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id:             string
  title:          string
  description:    string | null
  image_url:      string | null
  affiliate_url:  string
  age_min_months: number
  age_max_months: number
  category:       string | null
  is_active:      boolean
}

const EMPTY_FORM = {
  title:          '',
  description:    '',
  image_url:      '',
  affiliate_url:  '',
  age_min_months: 0,
  age_max_months: 48,
  category:       '',
  is_active:      true,
}

export function ProductActions({ products }: { products: Product[] }) {
  const router = useRouter()
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [toggling, setToggling]   = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)

  function setField<K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/products', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...form,
          description:   form.description   || null,
          image_url:     form.image_url     || null,
          category:      form.category      || null,
          age_min_months: Number(form.age_min_months),
          age_max_months: Number(form.age_max_months),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to create product'); return }
      setForm(EMPTY_FORM)
      setShowForm(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(product: Product) {
    setToggling(product.id)
    try {
      await fetch('/api/admin/products', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id: product.id, is_active: !product.is_active }),
      })
      router.refresh()
    } finally {
      setToggling(null)
    }
  }

  const INPUT = `
    w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
    outline-none focus:border-[#1c2e1c] transition-colors
  `

  return (
    <div>
      {/* ── Header actions ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Admin</p>
          <h1 className="text-2xl font-bold text-gray-900">
            Products{' '}
            <span className="text-gray-400 font-normal text-xl">({products.length})</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {products.filter(p => p.is_active).length} active · affiliate products shown in the community feed
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 text-sm bg-[#1c2e1c] text-white rounded-xl hover:bg-[#2d4a2d] transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add product'}
        </button>
      </div>

      {/* ── Add form ── */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 space-y-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">New product</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Title *</label>
              <input className={INPUT} required value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. Hatch Rest Baby Monitor" />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
              <textarea className={INPUT} rows={2} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="One line description shown to parents" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Affiliate URL *</label>
              <input className={INPUT} required type="url" value={form.affiliate_url} onChange={e => setField('affiliate_url', e.target.value)} placeholder="https://…" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Image URL</label>
              <input className={INPUT} type="url" value={form.image_url} onChange={e => setField('image_url', e.target.value)} placeholder="https://… (optional)" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Min age (months)</label>
              <input className={INPUT} type="number" min={0} max={48} value={form.age_min_months} onChange={e => setField('age_min_months', Number(e.target.value))} />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Max age (months)</label>
              <input className={INPUT} type="number" min={0} max={60} value={form.age_max_months} onChange={e => setField('age_max_months', Number(e.target.value))} />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
              <input className={INPUT} value={form.category} onChange={e => setField('category', e.target.value)} placeholder="e.g. Sleep, Feeding, Play" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setField('is_active', e.target.checked)} className="w-4 h-4 rounded" />
              <label htmlFor="is_active" className="text-sm text-gray-700">Active (visible to users)</label>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#1c2e1c] text-white text-sm rounded-xl hover:bg-[#2d4a2d] transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Save product'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError(null) }} className="px-5 py-2 text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Products table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Title</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Category</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Age range</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{p.title}</p>
                  {p.description && (
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-xs">{p.description}</p>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500">{p.category ?? '—'}</td>
                <td className="px-5 py-3 text-gray-500 text-[11px]">
                  {p.age_min_months}–{p.age_max_months} mo
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => handleToggleActive(p)}
                    disabled={toggling === p.id}
                    className="text-[11px] text-brand-600 hover:text-brand-700 disabled:opacity-50"
                  >
                    {toggling === p.id ? '…' : p.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                  No products yet. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
