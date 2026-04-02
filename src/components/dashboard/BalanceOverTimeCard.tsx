import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { formatMoney } from '../../utils/finance'

export function BalanceOverTimeCard({
  bootLoading,
  data,
}: {
  bootLoading: boolean
  data: { month: string; balance: number }[]
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Balance over time</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Cumulative net movement by month</div>
        </div>
        <div className="rounded-2xl bg-indigo-600/10 px-3 py-2 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-600/20 dark:text-indigo-200 dark:bg-indigo-400/10 dark:ring-indigo-200/10">
          {bootLoading ? 'Loading…' : data.length ? `${data.length} months` : 'No data'}
        </div>
      </div>

      <div className="mt-4 h-72">
        {bootLoading ? (
          <Skeleton className="h-full w-full" />
        ) : data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#f472b6" stopOpacity={0.85} />
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
                formatter={(value: any) => [formatMoney(Number(value)), 'Balance']}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="url(#balanceGradient)"
                strokeWidth={3}
                dot={{ r: 3, fill: '#4f46e5', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">No balance history</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Add income and expenses to see your balance trend.</div>
          </div>
        )}
      </div>
    </Card>
  )
}

