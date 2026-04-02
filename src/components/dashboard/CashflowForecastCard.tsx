import { useFinance } from '../../context/FinanceContext'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Skeleton } from '../ui/Skeleton'

function toneForNet(net: number) {
  if (net > 0) return { badge: 'success' as const, label: 'Positive' }
  if (net < 0) return { badge: 'danger' as const, label: 'Negative' }
  return { badge: 'neutral' as const, label: 'Flat' }
}

export function CashflowForecastCard({ bootLoading }: { bootLoading: boolean }) {
  const { cashflowForecast } = useFinance()

  if (!cashflowForecast) {
    return (
      <Card className="p-5">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Cashflow forecast</div>
        <div className="mt-3 rounded-2xl bg-slate-50/60 p-4 text-xs text-slate-500 ring-1 ring-slate-200/70 dark:bg-white/5 dark:text-slate-400 dark:ring-white/10">
          Add a few transactions to unlock forecast insights.
        </div>
      </Card>
    )
  }

  const net = cashflowForecast.projectedIncome - cashflowForecast.projectedExpense
  const tone = toneForNet(net)

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Cashflow forecast</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Based on the last 3 months average
          </div>
        </div>
        <Badge tone={tone.badge}>{tone.label}</Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50/60 p-4 ring-1 ring-slate-200/70 dark:bg-white/5 dark:ring-white/10">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Next month</div>
          <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{cashflowForecast.nextMonthLabel}</div>
        </div>
        <div className="rounded-2xl bg-emerald-50/50 p-4 ring-1 ring-emerald-200/80 dark:bg-emerald-500/10 dark:ring-emerald-400/20">
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Projected income</div>
          <div className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-200">
            {bootLoading ? <Skeleton className="h-6 w-20" /> : `₹${cashflowForecast.projectedIncome.toLocaleString('en-IN')}`}
          </div>
        </div>
        <div className="rounded-2xl bg-rose-50/60 p-4 ring-1 ring-rose-200/80 dark:bg-rose-500/10 dark:ring-rose-400/20">
          <div className="text-xs font-semibold text-rose-800 dark:text-rose-300">Projected expenses</div>
          <div className="mt-1 text-lg font-semibold text-rose-700 dark:text-rose-200">
            {bootLoading ? <Skeleton className="h-6 w-20" /> : `₹${cashflowForecast.projectedExpense.toLocaleString('en-IN')}`}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-indigo-600/10 p-4 ring-1 ring-indigo-600/20 dark:bg-indigo-400/10 dark:ring-indigo-300/20">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">Projected balance</div>
            <div className="mt-1 text-sm text-indigo-900/70 dark:text-indigo-200/90">
              Current balance + projected net cashflow
            </div>
          </div>
          <div className="text-xl font-semibold tracking-tight text-indigo-900 dark:text-indigo-50">
            {bootLoading ? <Skeleton className="h-9 w-32" /> : `₹${cashflowForecast.projectedBalance.toLocaleString('en-IN')}`}
          </div>
        </div>
      </div>
    </Card>
  )
}

