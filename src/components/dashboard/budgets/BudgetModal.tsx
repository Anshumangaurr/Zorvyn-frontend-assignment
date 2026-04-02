import React, { useEffect, useMemo, useState } from 'react'
import { useFinance } from '../../../context/FinanceContext'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Select } from '../../ui/Select'

export function BudgetModal({
  open,
  onClose,
  initialCategory,
}: {
  open: boolean
  onClose: () => void
  initialCategory?: string
}) {
  const { role, categories, budgets, setBudget, deleteBudget } = useFinance()
  const isAdmin = role === 'admin'

  const defaultCategory = useMemo(() => {
    if (initialCategory && categories.includes(initialCategory)) return initialCategory
    return categories[0] ?? 'Food'
  }, [categories, initialCategory])

  const [category, setCategory] = useState(defaultCategory)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setSubmitting(false)
    setCategory(defaultCategory)
    const existing = budgets[defaultCategory]
    setAmount(existing != null ? String(existing) : '')
  }, [open, defaultCategory, budgets])

  function validate() {
    if (!category.trim()) return 'Category is required.'
    const v = Number(amount)
    if (!Number.isFinite(v) || v <= 0) return 'Budget must be a positive number.'
    return null
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!isAdmin) {
      setError('Switch to Admin to manage budgets.')
      return
    }
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setSubmitting(true)
    setError(null)
    const num = Math.round(Number(amount))
    setBudget(category.trim(), num)
    setSubmitting(false)
    onClose()
  }

  const existingBudget = budgets[category]

  return (
    <Modal
      open={open}
      title="Monthly budget"
      onClose={() => {
        if (submitting) return
        onClose()
      }}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {role === 'viewer' ? 'Viewer mode is read-only.' : 'Budgets are stored on this device.'}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && existingBudget != null ? (
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  if (!window.confirm(`Remove budget for ${category}?`)) return
                  deleteBudget(category)
                  onClose()
                }}
              >
                Remove
              </Button>
            ) : null}
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" disabled={submitting || role !== 'admin'} type="submit" form="budget-form">
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      }
    >
      <form id="budget-form" onSubmit={onSave} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Category</div>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} required>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              {categories.length === 0 ? <option value="Food">Food</option> : null}
            </Select>
          </label>
          <label className="space-y-1">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Monthly budget (INR)</div>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200/70 bg-rose-50/70 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}
      </form>
    </Modal>
  )
}

