import type { SortDir, SortKey, Transaction, TransactionType } from '../types/finance'

export function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function parseISODateLocal(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map((v) => Number(v))
  return new Date(y, m - 1, d)
}

export function formatDate(isoDate: string) {
  const dt = parseISODateLocal(isoDate)
  return dt.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export function getMonthKey(isoDate: string) {
  return isoDate.slice(0, 7) // YYYY-MM
}

export function getMonthLabel(monthKey: string) {
  const [y, m] = monthKey.split('-').map((v) => Number(v))
  const dt = new Date(y, m - 1, 1)
  return dt.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

export function filterTransactionsToLastNMonths(transactions: Transaction[], months: number) {
  if (transactions.length === 0) return []
  const latest = getMostRecentMonthKey(transactions)
  if (!latest) return []
  const threshold = addMonthsToMonthKey(latest, -(months - 1))
  return transactions.filter((t) => getMonthKey(t.date) >= threshold)
}

export function signedAmount(tx: Transaction) {
  return tx.type === 'income' ? tx.amount : -tx.amount
}

export function computeTotals(transactions: Transaction[]) {
  let income = 0
  let expenses = 0

  for (const tx of transactions) {
    if (tx.type === 'income') income += tx.amount
    else expenses += tx.amount
  }

  return {
    income,
    expenses,
    balance: income - expenses,
  }
}

export function sortTransactions(transactions: Transaction[], key: SortKey, dir: SortDir) {
  const sign = dir === 'asc' ? 1 : -1
  const sorted = [...transactions]

  sorted.sort((a, b) => {
    if (key === 'date') return sign * a.date.localeCompare(b.date)
    return sign * (a.amount - b.amount)
  })

  return sorted
}

export function filterByCategory(transactions: Transaction[], searchCategory: string) {
  const q = searchCategory.trim().toLowerCase()
  if (!q) return transactions
  return transactions.filter((t) => t.category.toLowerCase().includes(q))
}

export function filterByType(transactions: Transaction[], type: 'all' | TransactionType) {
  if (type === 'all') return transactions
  return transactions.filter((t) => t.type === type)
}

export type BalancePoint = { month: string; balance: number }

export function computeBalanceOverTime(transactions: Transaction[], months = 6): BalancePoint[] {
  if (transactions.length === 0) return []

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))

  // Aggregate signed net per month
  const netByMonth = new Map<string, number>()
  for (const tx of sorted) {
    const key = getMonthKey(tx.date)
    netByMonth.set(key, (netByMonth.get(key) ?? 0) + signedAmount(tx))
  }

  const allMonthKeys = [...netByMonth.keys()].sort()
  const slicedMonthKeys = allMonthKeys.slice(Math.max(0, allMonthKeys.length - months))

  // Build cumulative balance series
  let running = 0
  const points: BalancePoint[] = []
  for (const mk of slicedMonthKeys) {
    running += netByMonth.get(mk) ?? 0
    points.push({ month: mk, balance: running })
  }

  return points.map((p) => ({ ...p, month: getMonthLabel(p.month) }))
}

export type PieSlice = { name: string; value: number }

export function computeSpendingByCategory(transactions: Transaction[], topN = 6): PieSlice[] {
  const expenses = transactions.filter((t) => t.type === 'expense')
  if (expenses.length === 0) return []

  const totals = new Map<string, number>()
  for (const tx of expenses) {
    totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount)
  }

  const sorted = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  if (sorted.length <= topN) return sorted

  const top = sorted.slice(0, topN - 1)
  const restTotal = sorted.slice(topN - 1).reduce((acc, s) => acc + s.value, 0)

  return [...top, { name: 'Other', value: restTotal }]
}

export function computeHighestSpendingCategory(transactions: Transaction[]) {
  const expenses = transactions.filter((t) => t.type === 'expense')
  if (expenses.length === 0) return undefined

  const totals = new Map<string, number>()
  for (const tx of expenses) {
    totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount)
  }

  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1])
  const [name, value] = sorted[0]
  return { name, value }
}

export type MonthlyComparisonPoint = {
  month: string
  income: number
  expense: number
}

export function computeMonthlyComparison(transactions: Transaction[], months = 3) {
  if (transactions.length === 0) return []

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))
  const keys = [...new Set(sorted.map((t) => getMonthKey(t.date)))].sort()
  const sliceKeys = keys.slice(Math.max(0, keys.length - months))

  const byMonth = new Map<string, { income: number; expense: number }>()
  for (const mk of sliceKeys) byMonth.set(mk, { income: 0, expense: 0 })

  for (const tx of transactions) {
    const mk = getMonthKey(tx.date)
    if (!byMonth.has(mk)) continue
    const cur = byMonth.get(mk)!
    if (tx.type === 'income') cur.income += tx.amount
    else cur.expense += tx.amount
  }

  return sliceKeys.map((mk) => {
    const v = byMonth.get(mk)!
    return { month: getMonthLabel(mk), income: v.income, expense: v.expense }
  })
}

export function getMostRecentMonthKey(transactions: Transaction[]) {
  if (transactions.length === 0) return undefined
  let max = transactions[0].date
  for (const t of transactions) if (t.date > max) max = t.date
  return getMonthKey(max)
}

export function addMonthsToMonthKey(monthKey: string, monthsToAdd: number) {
  const [y, m] = monthKey.split('-').map((v) => Number(v))
  const dt = new Date(y, m - 1, 1)
  dt.setMonth(dt.getMonth() + monthsToAdd)
  const y2 = dt.getFullYear()
  const m2 = String(dt.getMonth() + 1).padStart(2, '0')
  return `${y2}-${m2}`
}

export type CategoryExpenseSnapshot = { category: string; expense: number }

export function computeCategoryExpenseForMonth(transactions: Transaction[], monthKey: string) {
  const by = new Map<string, number>()
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue
    if (getMonthKey(tx.date) !== monthKey) continue
    by.set(tx.category, (by.get(tx.category) ?? 0) + tx.amount)
  }
  return [...by.entries()]
    .map(([category, expense]) => ({ category, expense }))
    .sort((a, b) => b.expense - a.expense)
}

export function computeCashflowForecast(transactions: Transaction[], lookbackMonths = 3) {
  if (transactions.length === 0) return undefined

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))
  const monthKeys = [...new Set(sorted.map((t) => getMonthKey(t.date)))].sort()
  const sliceKeys = monthKeys.slice(Math.max(0, monthKeys.length - lookbackMonths))
  const sliceKeySet = new Set(sliceKeys)

  const incomeByMonth = new Map<string, number>()
  const expenseByMonth = new Map<string, number>()

  for (const mk of sliceKeys) {
    incomeByMonth.set(mk, 0)
    expenseByMonth.set(mk, 0)
  }

  for (const tx of transactions) {
    const mk = getMonthKey(tx.date)
    if (!sliceKeySet.has(mk)) continue
    if (tx.type === 'income') incomeByMonth.set(mk, (incomeByMonth.get(mk) ?? 0) + tx.amount)
    else expenseByMonth.set(mk, (expenseByMonth.get(mk) ?? 0) + tx.amount)
  }

  const avgIncome =
    sliceKeys.reduce((acc, mk) => acc + (incomeByMonth.get(mk) ?? 0), 0) / Math.max(1, sliceKeys.length)
  const avgExpense =
    sliceKeys.reduce((acc, mk) => acc + (expenseByMonth.get(mk) ?? 0), 0) /
    Math.max(1, sliceKeys.length)

  const currentBalance = computeTotals(transactions).balance
  const projectedNet = avgIncome - avgExpense
  const projectedBalance = currentBalance + projectedNet

  const lastMonthKey = monthKeys[monthKeys.length - 1]
  const nextMonthKey = addMonthsToMonthKey(lastMonthKey, 1)
  const nextMonthLabel = getMonthLabel(nextMonthKey)

  return {
    nextMonthLabel,
    projectedIncome: Math.round(avgIncome),
    projectedExpense: Math.round(avgExpense),
    projectedBalance: Math.round(projectedBalance),
  }
}

export type SmartObservation = {
  tone: 'up' | 'down' | 'neutral'
  title: string
  detail: string
}

export function computeSmartObservation(transactions: Transaction[]) {
  const monthly = computeMonthlyComparison(transactions, 2)
  if (monthly.length < 2) {
    return {
      tone: 'neutral',
      title: 'Add a few transactions',
      detail: 'Insights will appear as you build history.',
    } satisfies SmartObservation
  }

  const prev = monthly[monthly.length - 2]
  const cur = monthly[monthly.length - 1]

  const prevExpense = prev.expense
  const curExpense = cur.expense
  if (prevExpense <= 0) {
    const pct = curExpense > 0 ? 100 : 0
    return {
      tone: curExpense > 0 ? 'up' : 'neutral',
      title: 'Spending detected',
      detail: `In ${cur.month}, expenses totaled ${formatMoney(curExpense)} (${pct}% vs. prior period).`,
    } satisfies SmartObservation
  }

  const pctChange = ((curExpense - prevExpense) / prevExpense) * 100
  const rounded = Math.round(Math.abs(pctChange))

  if (pctChange > 1) {
    return {
      tone: 'up',
      title: 'Spending increased',
      detail: `Spending increased by ${rounded}% in ${cur.month}. Consider revisiting your top categories.`,
    } satisfies SmartObservation
  }

  if (pctChange < -1) {
    return {
      tone: 'down',
      title: 'Nice reduction',
      detail: `Spending decreased by ${rounded}% in ${cur.month}. Keep the momentum.`,
    } satisfies SmartObservation
  }

  return {
    tone: 'neutral',
    title: 'Spending is steady',
    detail: `Expenses were relatively stable in ${cur.month} (difference within ${rounded}%).`,
  } satisfies SmartObservation
}

export function toCSV(transactions: Transaction[]) {
  const headers = ['Date', 'Amount', 'Category', 'Type']
  const rows = transactions.map((t) => {
    const safeCategory = t.category.includes(',') ? `"${t.category.replace(/"/g, '""')}"` : t.category
    return [t.date, String(t.amount), safeCategory, t.type].join(',')
  })
  return [headers.join(','), ...rows].join('\n')
}

export function downloadTextFile(content: string, filename: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

