import { useFinance } from '../../../context/FinanceContext'
import type { Transaction, TransactionType } from '../../../types/finance'
import { formatDate, formatMoney } from '../../../utils/finance'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { Skeleton } from '../../ui/Skeleton'

function typeTone(type: TransactionType) {
  return type === 'income' ? 'success' : 'danger'
}

function typeLabel(type: TransactionType) {
  return type === 'income' ? 'Income' : 'Expense'
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  const opacity = active ? 1 : 0.25
  return (
    <span style={{ opacity }} className="inline-flex items-center">
      {dir === 'asc' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

export function TransactionsTable({
  bootLoading,
  onEdit,
}: {
  bootLoading: boolean
  onEdit: (tx: Transaction) => void
}) {
  const { role, transactions, visibleTransactions, ui, setSort, deleteTransaction } = useFinance()
  const isAdmin = role === 'admin'

  function toggleSort(key: 'date' | 'amount') {
    if (ui.sortKey === key) {
      setSort(key, ui.sortDir === 'asc' ? 'desc' : 'asc')
      return
    }
    // Default direction per key
    setSort(key, key === 'date' ? 'desc' : 'desc')
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Transactions</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {bootLoading ? 'Loading…' : `${visibleTransactions.length} items`}
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        {bootLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-6 gap-3">
                <Skeleton className="h-10 w-full col-span-2" />
                <Skeleton className="h-10 w-full col-span-1" />
                <Skeleton className="h-10 w-full col-span-2" />
                <Skeleton className="h-10 w-full col-span-1" />
                <Skeleton className="h-10 w-full col-span-0" />
              </div>
            ))}
          </div>
        ) : visibleTransactions.length ? (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 pr-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-200 hover:opacity-90"
                    onClick={() => toggleSort('date')}
                    aria-label="Sort by date"
                  >
                    Date <SortIcon active={ui.sortKey === 'date'} dir={ui.sortDir} />
                  </button>
                </th>
                <th className="py-3 pr-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-200 hover:opacity-90"
                    onClick={() => toggleSort('amount')}
                    aria-label="Sort by amount"
                  >
                    Amount <SortIcon active={ui.sortKey === 'amount'} dir={ui.sortDir} />
                  </button>
                </th>
                <th className="py-3 pr-2">Category</th>
                <th className="py-3 pr-2">Type</th>
                <th className="py-3 pr-2 text-right">{isAdmin ? 'Actions' : ''}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {visibleTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="group hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 pr-2 whitespace-nowrap text-slate-700 dark:text-slate-200">
                    <div className="font-medium">{formatDate(tx.date)}</div>
                  </td>
                  <td className="py-3 pr-2 whitespace-nowrap">
                    <div
                      className={[
                        'font-semibold',
                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300',
                      ].join(' ')}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatMoney(tx.amount)}
                    </div>
                  </td>
                  <td className="py-3 pr-2 whitespace-nowrap text-slate-700 dark:text-slate-200">
                    <div className="font-medium">{tx.category}</div>
                    {tx.notes ? (
                      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate" title={tx.notes}>
                        {tx.notes}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-3 pr-2 whitespace-nowrap">
                    <Badge tone={typeTone(tx.type)}>{typeLabel(tx.type)}</Badge>
                  </td>
                  <td className="py-3 pr-2 whitespace-nowrap text-right">
                    {isAdmin ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(tx)}
                          className="rounded-xl"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-rose-600 hover:bg-rose-50/60 dark:text-rose-300 dark:hover:bg-white/10"
                          onClick={() => {
                            // Confirm avoids accidental deletes and feels “enterprise”
                            const ok = window.confirm(`Delete transaction "${tx.category}" on ${tx.date}?`)
                            if (!ok) return
                            deleteTransaction(tx.id)
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50/60 p-8 text-center ring-1 ring-slate-200/70 dark:bg-white/5 dark:ring-white/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100/60 text-slate-600 dark:bg-white/10 dark:text-slate-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 6V12L16 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {transactions.length === 0 ? 'No transactions yet' : 'No transactions match your filters'}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {transactions.length === 0
                ? isAdmin
                  ? 'Add your first income or expense to see insights and charts.'
                  : 'Switch role to Admin to add transactions.'
                : 'Try changing the category search or switching between Income/Expense.'}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

