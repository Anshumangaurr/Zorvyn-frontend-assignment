import React from 'react'
import { useFinance } from '../../context/FinanceContext'
import { SectionTitle } from '../ui/SectionTitle'
import { TransactionsToolbar } from './transactions/TransactionsToolbar'
import { TransactionsTable } from './transactions/TransactionsTable'
import { TransactionModal } from './transactions/TransactionModal'

export function TransactionsSection({ bootLoading }: { bootLoading: boolean }) {
  const { role } = useFinance()

  const [modalOpen, setModalOpen] = React.useState(false)
  const [mode, setMode] = React.useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const { transactions } = useFinance()
  const editingTx = editingId ? transactions.find((t) => t.id === editingId) : undefined

  function openCreate() {
    if (role !== 'admin') return
    setMode('create')
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(id: string) {
    if (role !== 'admin') return
    setMode('edit')
    setEditingId(id)
    setModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <SectionTitle
          title="Transactions"
          subtitle="Search, filter, sort, and manage your finance records."
        />
        {role === 'viewer' ? (
          <div className="rounded-2xl bg-slate-50/60 p-4 text-sm ring-1 ring-slate-200/70 dark:bg-white/5 dark:ring-white/10">
            <span className="font-semibold">Viewer mode:</span> transactions are read-only. Switch to Admin to add, edit, or delete.
          </div>
        ) : null}
      </div>

      <TransactionsToolbar onAdd={openCreate} />

      <TransactionsTable
        bootLoading={bootLoading}
        onEdit={(tx) => openEdit(tx.id)}
      />

      <TransactionModal
        open={modalOpen}
        mode={mode}
        editing={editingTx}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

