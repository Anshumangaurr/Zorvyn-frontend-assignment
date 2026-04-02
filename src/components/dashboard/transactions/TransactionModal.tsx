import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Transaction, TransactionType } from '../../../types/finance'
import { useFinance } from '../../../context/FinanceContext'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Select } from '../../ui/Select'

type Mode = 'create' | 'edit'

function formatTodayISO() {
  const dt = new Date()
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const d = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function TransactionModal({
  open,
  mode,
  editing,
  onClose,
}: {
  open: boolean
  mode: Mode
  editing?: Transaction
  onClose: () => void
}) {
  const { role, categories, addTransaction, updateTransaction } = useFinance()
  const isAdmin = role === 'admin'

  const initial = useMemo(() => {
    if (mode === 'edit' && editing) {
      return {
        date: editing.date,
        amount: editing.amount.toString(),
        category: editing.category,
        type: editing.type as TransactionType,
        notes: editing.notes ?? '',
      }
    }

    return {
      date: formatTodayISO(),
      amount: '',
      category: categories[0] ?? 'Food',
      type: 'expense' as TransactionType,
      notes: '',
    }
  }, [categories, editing, mode])

  const [form, setForm] = useState(initial)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form on open/mode change
  React.useEffect(() => {
    if (!open) return
    setForm(initial)
    setError(null)
    setSubmitting(false)
  }, [initial, open])

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validate() {
    if (!form.date) return 'Date is required.'
    const amt = Number(form.amount)
    if (!Number.isFinite(amt) || amt <= 0) return 'Amount must be a positive number.'
    if (!form.category.trim()) return 'Category is required.'
    if (form.type !== 'income' && form.type !== 'expense') return 'Type is required.'
    return null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isAdmin) {
      setError('Switch to Admin to manage transactions.')
      return
    }
    const v = validate()
    if (v) {
      setError(v)
      return
    }

    setSubmitting(true)
    setError(null)

    const amt = Number(form.amount)
    const input = {
      date: form.date,
      amount: amt,
      category: form.category.trim(),
      type: form.type,
      notes: form.notes.trim() ? form.notes.trim() : undefined,
    }

    // Small UX delay for better perceived responsiveness
    await new Promise((r) => window.setTimeout(r, 150))

    if (mode === 'create') {
      addTransaction(input)
    } else {
      if (!editing) return
      updateTransaction(editing.id, input)
    }

    setSubmitting(false)
    onClose()
  }

  const title = mode === 'create' ? 'Add transaction' : 'Edit transaction'

  return (
    <Modal
      open={open}
      title={title}
      onClose={() => {
        if (submitting) return
        onClose()
      }}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {role === 'viewer' ? 'Viewer mode is read-only.' : 'Transactions are saved to your device.'}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" disabled={submitting || role !== 'admin'} type="submit" form="tx-form">
              {submitting ? 'Saving…' : mode === 'create' ? 'Add' : 'Save changes'}
            </Button>
          </div>
        </div>
      }
    >
      <form id="tx-form" onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Date</div>
            <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
          </label>
          <label className="space-y-1">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Amount</div>
            <Input
              inputMode="decimal"
              type="number"
              min={0}
              step={1}
              placeholder="e.g. 120"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              required
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Category</div>
            <Select value={form.category} onChange={(e) => set('category', e.target.value)} required>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              {categories.length === 0 ? <option value="Food">Food</option> : null}
            </Select>
          </label>

          <label className="space-y-1">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Type</div>
            <Select value={form.type} onChange={(e) => set('type', e.target.value as TransactionType)} required>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
          </label>
        </div>

        <label className="space-y-1">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Notes (optional)</div>
          <Input
            placeholder="Add context like recurring, paid by card, etc."
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </label>

        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="rounded-2xl border border-rose-200/70 bg-rose-50/70 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
            >
              {error}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </form>
    </Modal>
  )
}

