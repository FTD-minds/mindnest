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

interface ProductActionsProps {
  products:             Product[]
  clicksMap:            Record<string, number>
  totalClicksThisMonth: number
  topProductName:       string
  topProductClicks:     number
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

type FormValues = typeof EMPTY_FORM

function productToForm(p: Product): FormValues {
  return {
    title:          p.title,
    description:    p.description    ?? '',
    image_url:      p.image_url      ?? '',
    affiliate_url:  p.affiliate_url,
    age_min_months: p.age_min_months,
    age_max_months: p.age_max_months,
    category:       p.category       ?? '',
    is_active:      p.is_active,
  }
}

export function ProductActions({
  products,
  clicksMap,
  totalClicksThisMonth,
  topProductName,
  topProductClicks,
}: ProductActionsProps) {
  const router = useRouter()

  // ── Form state ───────────────────────────────────────────────────────────────
  const [showForm,       setShowForm]       = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form,           setForm]           = useState<FormValues>(EMPTY_FORM)
  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState<string | null>(null)

  // ── Row action state ─────────────────────────────────────────────────────────
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function openAddForm() {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setError(null)
    setShowForm(true)
  }

  function openEditForm(product: Product) {
    setEditingProduct(product)
    setForm(productToForm(product))
    setError(null)
    setShowForm(true)
    // Scroll the form into view
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeForm() {
    setShowForm(false)
    setEditingProduct(null)
    setError(null)
  }

  // ── Create ───────────────────────────────────────────────────────────────────
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
          description:    form.description    || null,
          image_url:      form.image_url      || null,
          category:       form.category       || null,
          age_min_months: Number(form.age_min_months),
          age_max_months: Number(form.age_max_months),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to create product'); return }
      closeForm()
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  // ── Update ───────────────────────────────────────────────────────────────────
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingProduct) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/products', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          id:             editingProduct.id,
          title:          form.title,
          description:    form.description    || null,
          image_url:      form.image_url      || null,
          affiliate_url:  form.affiliate_url,
          age_min_months: Number(form.age_min_months),
          age_max_months: Number(form.age_max_months),
          category:       form.category       || null,
          is_active:      form.is_active,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to update product'); return }
      closeForm()
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle active ────────────────────────────────────────────────────────────
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

  // ── Delete ───────────────────────────────────────────────────────────────────
  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?\n\nThis cannot be undone.`
    )
    if (!confirmed) return

    setDeleting(product.id)
    try {
      await fetch(`/api/admin/products?id=${product.id}`, { method: 'DELETE' })
      // If we were editing this product, close the form
      if (editingProduct?.id === product.id) closeForm()
      router.refresh()
    } finally {
      setDeleting(null)
    }
  }

  // ── Styles ───────────────────────────────────────────────────────────────────
  const INPUT = `
    w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
    outline-none focus:border-[#1c2e1c] transition-colors
  `

  const totalClicks = Object.values(clicksMap).reduce((s, n) => s + n, 0)
  const isEditing   = editingProduct !== null

  return (
    <div>
      {/* ── Analytics summary ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total products',   value: products.length,      sub: `${products.filter(p => p.is_active).length} active` },
          { label: 'Clicks this month', value: totalClicksThisMonth, sub: `${totalClicks} all time` },
          { label: 'Top product',       value: topProductName,       sub: topProductClicks > 0 ? `${topProductClicks} clicks` : 'No clicks yet' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">{stat.label}</p>
            <p className="text-xl font-semibold text-gray-900 truncate">{stat.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Header actions ────────────────────────────────────────────────── */}
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
          onClick={() => showForm && !isEditing ? closeForm() : openAddForm()}
          className="px-4 py-2 text-sm bg-[#1c2e1c] text-white rounded-xl hover:bg-[#2d4a2d] transition-colors"
        >
          {showForm && !isEditing ? 'Cancel' : '+ Add product'}
        </button>
      </div>

      {/* ── Add / Edit form ───────────────────────────────────────────────── */}
      {showForm && (
        <form
          onSubmit={isEditing ? handleUpdate : handleCreate}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-900">
              {isEditing ? `Editing: ${editingProduct.title}` : 'New product'}
            </p>
            {isEditing && (
              <button
                type="button"
                onClick={closeForm}
                className="text-[11px] text-gray-400 hover:text-gray-600"
              >
                ✕ Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div className="col-span-2">
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Title *</label>
              <input
                className={INPUT} required
                value={form.title}
                onChange={e => setField('title', e.target.value)}
                placeholder="e.g. Hatch Rest Baby Monitor"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
              <textarea
                className={INPUT} rows={2}
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                placeholder="One line description shown to parents"
              />
            </div>

            {/* Affiliate URL — full width, prominent */}
            <div className="col-span-2">
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">
                Amazon Affiliate URL *
                <span className="ml-2 normal-case text-[10px] text-gray-400 font-normal">
                  — paste your affiliate link here
                </span>
              </label>
              <input
                className={`${INPUT} font-mono text-[12px]`}
                required type="url"
                value={form.affiliate_url}
                onChange={e => setField('affiliate_url', e.target.value)}
                placeholder="https://www.amazon.com/dp/…?tag=yourtag-20"
              />
            </div>

            {/* Image URL */}
            <div className="col-span-2">
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Image URL</label>
              <input
                className={INPUT} type="url"
                value={form.image_url}
                onChange={e => setField('image_url', e.target.value)}
                placeholder="https://… (optional)"
              />
            </div>

            {/* Age range */}
            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Min age (months)</label>
              <input
                className={INPUT} type="number" min={0} max={48}
                value={form.age_min_months}
                onChange={e => setField('age_min_months', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Max age (months)</label>
              <input
                className={INPUT} type="number" min={0} max={60}
                value={form.age_max_months}
                onChange={e => setField('age_max_months', Number(e.target.value))}
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
              <input
                className={INPUT}
                value={form.category}
                onChange={e => setField('category', e.target.value)}
                placeholder="e.g. Sleep, Feeding, Play"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox" id="is_active"
                checked={form.is_active}
                onChange={e => setField('is_active', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">Active (visible to users)</label>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#1c2e1c] text-white text-sm rounded-xl hover:bg-[#2d4a2d] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Save product'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="px-5 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Products table ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Title</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Category</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Age range</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Clicks</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const isBeingEdited  = editingProduct?.id === p.id
              const isBeingDeleted = deleting === p.id
              const isBeingToggled = toggling === p.id

              return (
                <tr
                  key={p.id}
                  className={`border-b border-gray-50 last:border-0 transition-colors ${
                    isBeingEdited ? 'bg-amber-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Title */}
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{p.title}</p>
                    {p.description && (
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-xs">{p.description}</p>
                    )}
                    <p className="text-[10px] text-gray-300 mt-0.5 font-mono truncate max-w-xs" title={p.affiliate_url}>
                      {p.affiliate_url}
                    </p>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-3 text-gray-500">{p.category ?? '—'}</td>

                  {/* Age range */}
                  <td className="px-5 py-3 text-gray-500 text-[11px]">
                    {p.age_min_months}–{p.age_max_months} mo
                  </td>

                  {/* Clicks */}
                  <td className="px-5 py-3">
                    <span className="font-medium text-gray-700">{clicksMap[p.id] ?? 0}</span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {/* Edit */}
                      <button
                        onClick={() => isBeingEdited ? closeForm() : openEditForm(p)}
                        className={`text-[11px] font-medium transition-colors ${
                          isBeingEdited
                            ? 'text-amber-600 hover:text-amber-700'
                            : 'text-brand-600 hover:text-brand-700'
                        }`}
                      >
                        {isBeingEdited ? 'Close' : 'Edit'}
                      </button>

                      {/* Activate / Deactivate */}
                      <button
                        onClick={() => handleToggleActive(p)}
                        disabled={isBeingToggled}
                        className="text-[11px] text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        {isBeingToggled ? '…' : p.is_active ? 'Deactivate' : 'Activate'}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={isBeingDeleted}
                        className="text-[11px] text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {isBeingDeleted ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">
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
