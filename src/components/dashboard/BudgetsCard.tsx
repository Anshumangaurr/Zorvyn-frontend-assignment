import { useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Skeleton } from '../ui/Skeleton'
import { Badge } from '../ui/Badge'
import { BudgetModal } from './budgets/BudgetModal'
import { computeCategoryExpenseForMonth, getMostRecentMonthKey } from '../../utils/finance'

function ProgressBar({
  pct,
  tone,
}: {
  pct: number
  tone: 'neutral' | 'success' | 'danger'
}) {
  const cl =
    tone === 'success'
      ? 'bg-emerald-600'
      : tone === 'danger'
        ? 'bg-rose-600'
        : 'bg-indigo-600'
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70 ring-1 ring-slate-200/60 dark:bg-white/10">
      <div
        className={[cl, 'h-full rounded-full transition-all duration-500'].join(' ')}
        style={{ width: `${Math.round(Math.min(1, Math.max(0, pct)) * 100)}%` }}
      />
    </div>
  )
}

export function BudgetsCard({ bootLoading }: { bootLoading: boolean }) {
  const { role, transactions, budgets, categories, latestMonthLabel } = useFinance()
  const isAdmin = role === 'admin'

  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [budgetModalCategory, setBudgetModalCategory] = useState<string | undefined>(undefined)

  const latestMonthKey = useMemo(() => getMostRecentMonthKey(transactions), [transactions])

  const expenseSnapshot = useMemo(() => {
    if (!latestMonthKey) return []
    return computeCategoryExpenseForMonth(transactions, latestMonthKey)
  }, [transactions, latestMonthKey])

  const budgetCategories = useMemo(() => Object.keys(budgets), [budgets])

  const top = useMemo(() => expenseSnapshot.slice(0, 6), [expenseSnapshot])

  const totalBudget = useMemo(() => {
    let sum = 0
    for (const cat of budgetCategories) sum += budgets[cat] ?? 0
    return sum
  }, [budgetCategories, budgets])

  const totalSpentThisMonth = useMemo(() => top.reduce((acc, x) => acc + x.expense, 0), [top])

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Monthly budgets</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {latestMonthLabel ? `Latest month: ${latestMonthLabel}` : 'Track spending vs your goals'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {bootLoading ? (
            <Skeleton className="h-9 w-28 rounded-2xl" />
          ) : budgetCategories.length ? (
            <Badge tone="neutral">
              {totalBudget > 0 ? `Goal: ₹${totalBudget.toLocaleString('en-IN')}` : 'Goals set'}
            </Badge>
          ) : (
            <Badge tone="neutral">No goals</Badge>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-4 flex flex-col gap-4">
        {bootLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
        ) : expenseSnapshot.length ? (
          <>
            {budgetCategories.length === 0 ? (
              <div className="rounded-2xl bg-slate-50/60 p-4 ring-1 ring-slate-200/70 dark:bg-white/5 dark:ring-white/10">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Set budgets to unlock alerts</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Admin can define monthly category budgets. Then this card shows progress and overspend warnings.
                </div>
                <div className="mt-3">
                  <Button
                    variant="primary"
                    disabled={!isAdmin}
                    onClick={() => {
                      if (!isAdmin) return
                      setBudgetModalCategory(categories[0] ?? 'Food')
                      setBudgetModalOpen(true)
                    }}
                  >
                    Set first budget
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50/60 p-4 ring-1 ring-slate-200/70 dark:bg-white/5 dark:ring-white/10">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Spent (top categories)</div>
                  <div className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    ₹{totalSpentThisMonth.toLocaleString('en-IN')}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">in {latestMonthLabel ?? 'this month'}</div>
                </div>
                <div className="rounded-2xl bg-slate-50/60 p-4 ring-1 ring-slate-200/70 dark:bg-white/5 dark:ring-white/10">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Budget coverage</div>
                  <div className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    {Math.round((budgetCategories.length / Math.max(1, expenseSnapshot.length)) * 100)}%
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">categories with goals</div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {top.map((item, idx) => {
                const budget = budgets[item.category] ?? 0
                const pct = budget > 0 ? item.expense / budget : 0
                const tone: 'neutral' | 'success' | 'danger' =
                  budget > 0 ? (pct >= 1 ? 'danger' : 'success') : 'neutral'
                const label =
                  budget > 0
                    ? pct >= 1
                      ? 'Overspent'
                      : 'On track'
                    : 'Set budget'
                return (
                  <button
                    key={item.category}
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => {
                      if (!isAdmin) return
                      setBudgetModalCategory(item.category)
                      setBudgetModalOpen(true)
                    }}
                    className={[
                      'w-full text-left rounded-2xl p-3 ring-1 transition',
                      budget > 0
                        ? pct >= 1
                          ? 'bg-rose-50/60 ring-rose-200/80 hover:bg-rose-50/90'
                          : 'bg-emerald-50/50 ring-emerald-200/80 hover:bg-emerald-50/80'
                        : 'bg-white/40 ring-slate-200/70 hover:bg-white/60 dark:bg-white/5 dark:ring-white/10',
                      !isAdmin ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer',
                    ].join(' ')}
                    aria-label={`Budget for ${item.category}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: idx % 2 ? '#4f46e5' : '#e11d48' }} />
                          <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{item.category}</div>
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Spent ₹{Math.round(item.expense).toLocaleString('en-IN')}
                          {budget > 0 ? ` / ₹${Math.round(budget).toLocaleString('en-IN')}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : 'neutral'}>{label}</Badge>
                      </div>
                    </div>
                    <div className="mt-2">
                      <ProgressBar pct={pct} tone={tone} />
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50/60 p-8 text-center ring-1 ring-slate-200/70 dark:bg-white/5 dark:ring-white/10">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">No expense data yet</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Add an expense transaction to see budget progress.
            </div>
          </div>
        )}
      </div>

      <BudgetModal
        open={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        initialCategory={budgetModalCategory}
      />
    </Card>
  )
}

