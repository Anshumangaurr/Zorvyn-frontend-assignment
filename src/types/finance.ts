export type Role = 'viewer' | 'admin'
export type Theme = 'light' | 'dark'

export type TransactionType = 'income' | 'expense'

export type Transaction = {
  id: string
  date: string // YYYY-MM-DD
  amount: number // positive number; `type` determines sign in calculations
  category: string
  type: TransactionType
  notes?: string
  createdAt: number
  updatedAt: number
}

export type SortKey = 'date' | 'amount'
export type SortDir = 'asc' | 'desc'

export type TimeRange = '3m' | '6m' | '12m'

export type TransactionFilters = {
  searchCategory: string
  type: 'all' | TransactionType
  sortKey: SortKey
  sortDir: SortDir
}

