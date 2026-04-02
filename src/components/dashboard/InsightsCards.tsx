import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { Badge } from '../ui/Badge'
import { formatMoney } from '../../utils/finance'
import type { SmartObservation } from '../../utils/finance'

function toneToBadge(tone: SmartObservation['tone']) {
  if (tone === 'up') return { tone: 'danger' as const, label: 'Watch' }
  if (tone === 'down') return { tone: 'success' as const, label: 'Good' }
  return { tone: 'neutral' as const, label: 'Steady' }
}

export function InsightsCards({
  bootLoading,
  highestSpendingCategory,
  monthlyComparison,
  smartObservation,
}: {
  bootLoading: boolean
  highestSpendingCategory?: { name: string; value: number }
  monthlyComparison: { month: string; income: number; expense: number }[]
  smartObservation: { tone: 'up' | 'down' | 'neutral'; title: string; detail: string }
}) {
  const badge = toneToBadge(smartObservation.tone)

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Highest spending</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your biggest expense category</div>
          </div>
          {bootLoading ? (
            <Skeleton className="h-9 w-9 rounded-2xl" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600/10 text-rose-700 ring-1 ring-rose-600/20 dark:text-rose-200 dark:bg-rose-400/10 dark:ring-rose-200/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2L15 9H22L16.5 13.5L18.8 21L12 16.9L5.2 21L7.5 13.5L2 9H9L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="mt-4">
          {bootLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-9 w-28" />
            </div>
          ) : highestSpendingCategory ? (
            <>
              <div className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                {highestSpendingCategory.name}
              </div>
              <div className="mt-1 text-sm text-rose-600 dark:text-rose-300">
                {formatMoney(highestSpendingCategory.value)} total
              </div>
            </>
          ) : (
            <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4 ring-1 ring-slate-200/70 dark:bg-white/5 dark:ring-white/10">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">No expenses yet</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Add an expense transaction to unlock category insights.</div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Monthly pulse</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Income vs expenses (last 3 months)</div>
          </div>
          <Badge tone="neutral">{bootLoading ? 'Loading' : 'Comparison'}</Badge>
        </div>

        <div className="mt-4 h-72">
          {bootLoading ? (
            <Skeleton className="h-full w-full" />
          ) : monthlyComparison.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.85} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb7185" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'rgba(100,116,139,1)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(148,163,184,0.25)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(100,116,139,1)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(148,163,184,0.25)' }}
                  tickLine={false}
                  tickFormatter={(v) => formatMoney(Number(v)).replace('.00', '')}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,23,42,0.9)',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  }}
                  formatter={(value: any, name: any) => [
                    formatMoney(Number(value)),
                    name === 'income' ? 'Income' : 'Expenses',
                  ]}
                />
                <Bar dataKey="income" fill="url(#incomeGrad)" radius={[12, 12, 0, 0]} />
                <Bar dataKey="expense" fill="url(#expenseGrad)" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Not enough data</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Add income and expenses over time to see trends.</div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Smart observation</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Actionable summary from your data</div>
          </div>
          <Badge tone={badge.tone}>{badge.label}</Badge>
        </div>

        <div className="mt-4">
          {bootLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{smartObservation.title}</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{smartObservation.detail}</div>
              <div className="mt-4 rounded-2xl bg-slate-50/60 p-4 ring-1 ring-slate-200/70 dark:bg-white/5 dark:ring-white/10">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Tip</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Try filtering transactions by category, then add notes for recurring purchases to build better clarity.
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

