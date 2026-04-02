import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { formatMoney } from '../../utils/finance'

function IconWallet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16 7V6a2 2 0 0 0-2-2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M16 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18.5" cy="12.5" r="1" fill="currentColor" />
    </svg>
  )
}

function IconIncome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 19V5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 11l6-6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconExpense() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6 13l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SummaryCards({
  bootLoading,
  totals,
}: {
  bootLoading: boolean
  totals: { income: number; expenses: number; balance: number }
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="relative overflow-hidden p-5 transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Balance</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {bootLoading ? <Skeleton className="h-9 w-32" /> : formatMoney(totals.balance)}
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-700 ring-1 ring-indigo-600/20 dark:text-indigo-200 dark:bg-indigo-400/10">
            <IconWallet />
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden p-5 transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Income</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">
              {bootLoading ? <Skeleton className="h-9 w-32" /> : formatMoney(totals.income)}
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-600/20 dark:text-emerald-200 dark:bg-emerald-400/10">
            <IconIncome />
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden p-5 transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Expenses</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-rose-700 dark:text-rose-300">
              {bootLoading ? <Skeleton className="h-9 w-32" /> : formatMoney(totals.expenses)}
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600/10 text-rose-700 ring-1 ring-rose-600/20 dark:text-rose-200 dark:bg-rose-400/10">
            <IconExpense />
          </div>
        </div>
      </Card>
    </div>
  )
}

