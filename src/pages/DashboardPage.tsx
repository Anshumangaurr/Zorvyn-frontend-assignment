import { useFinance } from '../context/FinanceContext'
import { TopNav } from '../components/layout/TopNav'
import { MoneyBackdrop } from '../components/layout/MoneyBackdrop'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { TimeRangeSelector } from '../components/dashboard/TimeRangeSelector'
import { BalanceOverTimeCard } from '../components/dashboard/BalanceOverTimeCard'
import { CategorySpendingCard } from '../components/dashboard/CategorySpendingCard'
import { InsightsCards } from '../components/dashboard/InsightsCards'
import { BudgetsCard } from '../components/dashboard/BudgetsCard'
import { CashflowForecastCard } from '../components/dashboard/CashflowForecastCard'
import { TransactionsSection } from '../components/dashboard/TransactionsSection'
import { Card } from '../components/ui/Card'

export function DashboardPage() {
  const {
    bootLoading,
    totals,
    balanceSeries,
    spendingSlices,
    highestSpendingCategory,
    monthlyComparison,
    smartObservation,
    latestMonthLabel,
  } = useFinance()

  return (
    <div className="relative min-h-screen">
      <TopNav />
      <MoneyBackdrop />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
                  Finance Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Premium overview of your balance, spending categories, and transaction activity.
                </p>
              </div>

              <div className="sm:text-right">
                <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-200">
                  {bootLoading ? 'Preparing your data…' : 'Live mock data with local persistence'}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Role-based UI: {highestSpendingCategory ? 'Insights enabled' : 'Manage transactions to unlock insights'}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <SummaryCards bootLoading={bootLoading} totals={totals} />
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <TimeRangeSelector />
              <div className="rounded-2xl bg-white/60 px-4 py-3 text-xs ring-1 ring-slate-200/70 dark:bg-slate-950/50 dark:ring-white/10">
                {latestMonthLabel ? (
                  <>
                    Latest month: <span className="font-semibold text-slate-900 dark:text-slate-50">{latestMonthLabel}</span>
                    <span className="mx-2 text-slate-300 dark:text-slate-700">•</span>
                    Charts respect your selected time range
                  </>
                ) : (
                  <span className="text-slate-500 dark:text-slate-300">Add transactions to unlock charts</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <BalanceOverTimeCard bootLoading={bootLoading} data={balanceSeries} />
            <CategorySpendingCard bootLoading={bootLoading} data={spendingSlices} />
          </div>

          <div className="grid gap-4">
            <InsightsCards
              bootLoading={bootLoading}
              highestSpendingCategory={highestSpendingCategory}
              monthlyComparison={monthlyComparison}
              smartObservation={smartObservation}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <BudgetsCard bootLoading={bootLoading} />
            <CashflowForecastCard bootLoading={bootLoading} />
          </div>

          <TransactionsSection bootLoading={bootLoading} />

          <Card className="flex flex-col items-center justify-center gap-2 px-6 py-8 text-center">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Export-ready</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Use the transaction toolbar to export your visible table as CSV or JSON.
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

