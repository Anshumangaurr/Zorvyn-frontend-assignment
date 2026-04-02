import { useFinance } from '../../context/FinanceContext'
import type { TimeRange } from '../../types/finance'
import { Card } from '../ui/Card'

const ranges: Array<{ key: TimeRange; label: string }> = [
  { key: '3m', label: 'Last 3M' },
  { key: '6m', label: 'Last 6M' },
  { key: '12m', label: 'Last 12M' },
]

export function TimeRangeSelector() {
  const { timeRange, setTimeRange } = useFinance()

  return (
    <Card className="flex flex-wrap items-center gap-2 p-3">
      <div className="mr-1 text-xs font-semibold text-slate-600 dark:text-slate-300">Time</div>
      {ranges.map((r) => {
        const active = r.key === timeRange
        return (
          <button
            key={r.key}
            type="button"
            onClick={() => setTimeRange(r.key)}
            className={[
              'rounded-2xl px-3 py-1 text-xs font-semibold transition',
              active
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                : 'bg-white/70 text-slate-700 ring-1 ring-slate-200/70 hover:bg-white dark:bg-slate-950/50 dark:text-slate-100 dark:ring-white/10',
            ].join(' ')}
            aria-pressed={active}
          >
            {r.label}
          </button>
        )
      })}
    </Card>
  )
}

