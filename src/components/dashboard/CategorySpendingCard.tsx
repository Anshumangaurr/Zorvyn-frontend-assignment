import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { formatMoney } from '../../utils/finance'

const COLORS = ['#f43f5e', '#fb7185', '#ef4444', '#f97316', '#f59e0b', '#a78bfa', '#60a5fa', '#34d399']

export function CategorySpendingCard({
  bootLoading,
  data,
}: {
  bootLoading: boolean
  data: { name: string; value: number }[]
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Spending by category</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Expense breakdown (top categories)</div>
        </div>
        <div className="rounded-2xl bg-rose-600/10 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-600/20 dark:text-rose-200 dark:bg-rose-400/10 dark:ring-rose-200/10">
          {bootLoading ? 'Loading…' : data.length ? `${data.length} categories` : 'No data'}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_190px] lg:items-center">
        <div className="h-72">
          {bootLoading ? (
            <Skeleton className="h-full w-full" />
          ) : data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,23,42,0.9)',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  }}
                  formatter={(value: any) => formatMoney(Number(value))}
                />
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={86} paddingAngle={2}>
                  {data.map((slice, idx) => (
                    <Cell key={slice.name} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">No expense categories</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Add expenses to unlock category insights.</div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {bootLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : data.length ? (
            data.slice(0, 5).map((s, idx) => (
              <div
                key={s.name}
                className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50/70 px-3 py-2 ring-1 ring-slate-200/70 dark:bg-white/5 dark:ring-white/10"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{s.name}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-50">{formatMoney(s.value)}</div>
              </div>
            ))
          ) : null}
        </div>
      </div>
    </Card>
  )
}

