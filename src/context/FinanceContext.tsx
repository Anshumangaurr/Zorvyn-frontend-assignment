import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type {
  Role,
  SortDir,
  SortKey,
  Theme,
  TimeRange,
  Transaction,
  TransactionFilters,
  TransactionType,
} from '../types/finance'
import {
  computeBalanceOverTime,
  computeHighestSpendingCategory,
  computeMonthlyComparison,
  computeCashflowForecast,
  computeSmartObservation,
  computeSpendingByCategory,
  computeTotals,
  filterTransactionsToLastNMonths,
  filterByCategory,
  filterByType,
  getMostRecentMonthKey,
  getMonthLabel,
  sortTransactions,
} from '../utils/finance'
import { mockTransactions } from '../data/mockTransactions'

const STORAGE_KEY = 'zorvyn.financeDashboard.v1'

type UIState = TransactionFilters

type State = {
  hydrated: boolean
  bootLoading: boolean
  role: Role
  theme: Theme
  transactions: Transaction[]
  ui: UIState
  timeRange: TimeRange
  budgets: Record<string, number>
}

type Action =
  | { type: 'HYDRATE'; payload: Partial<Pick<State, 'role' | 'theme' | 'transactions' | 'timeRange' | 'budgets'>> }
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_TIMERANGE'; payload: TimeRange }
  | { type: 'SET_BUDGET'; payload: { category: string; amount: number } }
  | { type: 'DELETE_BUDGET'; payload: { category: string } }
  | { type: 'SET_SEARCH_CATEGORY'; payload: string }
  | { type: 'SET_TYPE_FILTER'; payload: 'all' | TransactionType }
  | { type: 'SET_SORT'; payload: { key: SortKey; dir: SortDir } }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: { id: string } }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true, bootLoading: false }
    case 'SET_ROLE':
      return { ...state, role: action.payload }
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    case 'SET_TIMERANGE':
      return { ...state, timeRange: action.payload }
    case 'SET_BUDGET':
      return { ...state, budgets: { ...state.budgets, [action.payload.category]: action.payload.amount } }
    case 'DELETE_BUDGET': {
      const next = { ...state.budgets }
      delete next[action.payload.category]
      return { ...state, budgets: next }
    }
    case 'SET_SEARCH_CATEGORY':
      return { ...state, ui: { ...state.ui, searchCategory: action.payload } }
    case 'SET_TYPE_FILTER':
      return { ...state, ui: { ...state.ui, type: action.payload } }
    case 'SET_SORT':
      return { ...state, ui: { ...state.ui, sortKey: action.payload.key, sortDir: action.payload.dir } }
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] }
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.payload.id ? action.payload : t)),
      }
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload.id) }
    default: {
      return state
    }
  }
}

type FinanceContextValue = {
  bootLoading: boolean
  hydrated: boolean
  role: Role
  theme: Theme

  transactions: Transaction[]
  visibleTransactions: Transaction[]

  ui: UIState

  timeRange: TimeRange
  budgets: Record<string, number>
  setTimeRange: (range: TimeRange) => void
  setBudget: (category: string, amount: number) => void
  deleteBudget: (category: string) => void

  totals: { income: number; expenses: number; balance: number }
  balanceSeries: { month: string; balance: number }[]
  spendingSlices: { name: string; value: number }[]
  highestSpendingCategory?: { name: string; value: number }
  monthlyComparison: { month: string; income: number; expense: number }[]
  smartObservation: { tone: 'up' | 'down' | 'neutral'; title: string; detail: string }
  cashflowForecast?: { nextMonthLabel: string; projectedIncome: number; projectedExpense: number; projectedBalance: number }
  latestMonthLabel?: string

  categories: string[]

  setRole: (role: Role) => void
  setTheme: (theme: Theme) => void
  setSearchCategory: (value: string) => void
  setTypeFilter: (value: 'all' | TransactionType) => void
  setSort: (key: SortKey, dir: SortDir) => void

  addTransaction: (input: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTransaction: (id: string, input: Omit<Transaction, 'createdAt' | 'updatedAt' | 'id'>) => void
  deleteTransaction: (id: string) => void
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

function safeId() {
  // `crypto.randomUUID()` is widely available in modern browsers
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now())
}

function normalizeTransaction(t: any): Transaction | null {
  if (!t || typeof t !== 'object') return null
  if (typeof t.id !== 'string') return null
  if (typeof t.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(t.date)) return null
  if (typeof t.amount !== 'number' || !Number.isFinite(t.amount) || t.amount < 0) return null
  if (typeof t.category !== 'string' || !t.category.trim()) return null
  if (t.type !== 'income' && t.type !== 'expense') return null
  const createdAt = typeof t.createdAt === 'number' ? t.createdAt : Date.now()
  const updatedAt = typeof t.updatedAt === 'number' ? t.updatedAt : createdAt

  return {
    id: t.id,
    date: t.date,
    amount: t.amount,
    category: t.category,
    type: t.type,
    notes: typeof t.notes === 'string' ? t.notes : undefined,
    createdAt,
    updatedAt,
  }
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    hydrated: false,
    bootLoading: true,
    role: 'admin',
    theme: 'dark',
    transactions: [],
    ui: {
      searchCategory: '',
      type: 'all',
      sortKey: 'date',
      sortDir: 'desc',
    },
    timeRange: '6m',
    budgets: {},
  })

  const [didHydrateLocalStorage, setDidHydrateLocalStorage] = useState(false)
  const didUserEditRoleRef = useRef(false)
  const lastRoleRef = useRef<Role>(state.role)

  // Theme -> document class
  useEffect(() => {
    const isDark = state.theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    document.body?.classList.toggle('dark', isDark)
  }, [state.theme])

  // Boot: restore from localStorage immediately (avoid timing issues with dark-mode)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const hydratedRole = didUserEditRoleRef.current ? lastRoleRef.current : 'admin'
        dispatch({
          type: 'HYDRATE',
          payload: {
            role: hydratedRole,
            theme: 'dark',
            transactions: mockTransactions,
            timeRange: '6m',
            budgets: {},
          },
        })
        setDidHydrateLocalStorage(true)
        return
      }

      const parsed = JSON.parse(raw) as Partial<{
        role: Role
        theme: Theme
        transactions: any[]
        timeRange: TimeRange
        budgets: Record<string, number>
      }>
      const parsedRole = parsed.role === 'viewer' || parsed.role === 'admin' ? parsed.role : 'admin'
      const role = didUserEditRoleRef.current ? lastRoleRef.current : parsedRole
      const theme: Theme = 'dark'
      const timeRange =
        parsed.timeRange === '3m' || parsed.timeRange === '6m' || parsed.timeRange === '12m'
          ? parsed.timeRange
          : '6m'

      const budgets = parsed.budgets && typeof parsed.budgets === 'object' ? parsed.budgets : {}
      const normalizedBudgets: Record<string, number> = {}
      for (const [k, v] of Object.entries(budgets)) {
        if (!k.trim()) continue
        if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) continue
        normalizedBudgets[k] = Math.round(v)
      }

      const normalized = Array.isArray(parsed.transactions) ? parsed.transactions : []
      const transactions = normalized
        .map((t) => normalizeTransaction(t))
        .filter((t): t is Transaction => Boolean(t))

      dispatch({
        type: 'HYDRATE',
        payload: {
          role,
          theme,
          transactions: transactions.length > 0 ? transactions : mockTransactions,
          timeRange,
          budgets: normalizedBudgets,
        },
      })
    } catch {
      const hydratedRole = didUserEditRoleRef.current ? lastRoleRef.current : 'admin'
      dispatch({
        type: 'HYDRATE',
        payload: {
          role: hydratedRole,
          theme: 'dark',
          transactions: mockTransactions,
          timeRange: '6m',
          budgets: {},
        },
      })
    } finally {
      setDidHydrateLocalStorage(true)
    }
  }, [])

  // Persist state after boot
  useEffect(() => {
    if (!didHydrateLocalStorage) return
    const payload = {
      role: state.role,
      theme: state.theme,
      transactions: state.transactions,
      timeRange: state.timeRange,
      budgets: state.budgets,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [didHydrateLocalStorage, state.role, state.theme, state.transactions, state.timeRange, state.budgets])

  const visibleTransactions = useMemo(() => {
    const bySearch = filterByCategory(state.transactions, state.ui.searchCategory)
    const byType = filterByType(bySearch, state.ui.type)
    return sortTransactions(byType, state.ui.sortKey, state.ui.sortDir)
  }, [state.transactions, state.ui.searchCategory, state.ui.sortKey, state.ui.sortDir, state.ui.type])

  const totals = useMemo(() => computeTotals(state.transactions), [state.transactions])

  const rangeMonths = state.timeRange === '3m' ? 3 : state.timeRange === '6m' ? 6 : 12
  const filteredForCharts = useMemo(
    () => filterTransactionsToLastNMonths(state.transactions, rangeMonths),
    [rangeMonths, state.transactions],
  )

  const balanceSeries = useMemo(
    () => computeBalanceOverTime(state.transactions, rangeMonths),
    [state.transactions, rangeMonths],
  )
  const spendingSlices = useMemo(
    () => computeSpendingByCategory(filteredForCharts, 6),
    [filteredForCharts],
  )
  const highestSpendingCategory = useMemo(
    () => computeHighestSpendingCategory(filteredForCharts),
    [filteredForCharts],
  )
  const monthlyComparison = useMemo(
    () => computeMonthlyComparison(state.transactions, Math.min(rangeMonths, 6)),
    [state.transactions, rangeMonths],
  )
  const smartObservation = useMemo(() => computeSmartObservation(state.transactions), [state.transactions])

  const cashflowForecast = useMemo(() => computeCashflowForecast(state.transactions, 3), [state.transactions])
  const latestMonthLabel = useMemo(() => {
    const mk = getMostRecentMonthKey(state.transactions)
    return mk ? getMonthLabel(mk) : undefined
  }, [state.transactions])

  const categories = useMemo(() => {
    const set = new Set(state.transactions.map((t) => t.category))
    const list = [...set]
    list.sort((a, b) => a.localeCompare(b))
    return list
  }, [state.transactions])

  const value: FinanceContextValue = {
    bootLoading: state.bootLoading,
    hydrated: state.hydrated,
    role: state.role,
    theme: state.theme,
    transactions: state.transactions,
    visibleTransactions,
    ui: state.ui,
    timeRange: state.timeRange,
    budgets: state.budgets,
    totals,
    balanceSeries,
    spendingSlices,
    highestSpendingCategory,
    monthlyComparison,
    smartObservation,
    cashflowForecast,
    latestMonthLabel,
    categories,
    setRole: (role) => {
      didUserEditRoleRef.current = true
      lastRoleRef.current = role
      dispatch({ type: 'SET_ROLE', payload: role })
    },
    setTheme: () => {
      // Dark mode is intentionally disabled to keep light-mode contrast consistent.
    },
    setTimeRange: (range) => dispatch({ type: 'SET_TIMERANGE', payload: range }),
    setBudget: (category, amount) => dispatch({ type: 'SET_BUDGET', payload: { category, amount } }),
    deleteBudget: (category) => dispatch({ type: 'DELETE_BUDGET', payload: { category } }),
    setSearchCategory: (value) => dispatch({ type: 'SET_SEARCH_CATEGORY', payload: value }),
    setTypeFilter: (value) => dispatch({ type: 'SET_TYPE_FILTER', payload: value }),
    setSort: (key, dir) => dispatch({ type: 'SET_SORT', payload: { key, dir } }),
    addTransaction: (input) => {
      const tx: Transaction = {
        id: safeId(),
        ...input,
        notes: input.notes ? input.notes : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      dispatch({ type: 'ADD_TRANSACTION', payload: tx })
    },
    updateTransaction: (id, input) => {
      const tx: Transaction = {
        id,
        ...input,
        notes: input.notes ? input.notes : undefined,
        createdAt: state.transactions.find((t) => t.id === id)?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      }
      dispatch({ type: 'UPDATE_TRANSACTION', payload: tx })
    },
    deleteTransaction: (id) => dispatch({ type: 'DELETE_TRANSACTION', payload: { id } }),
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}

