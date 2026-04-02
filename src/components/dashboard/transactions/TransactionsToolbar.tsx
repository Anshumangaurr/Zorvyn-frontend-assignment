import { useFinance } from '../../../context/FinanceContext'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Select } from '../../ui/Select'
import { toCSV, downloadTextFile } from '../../../utils/finance'
import type { Transaction, TransactionType } from '../../../types/finance'

function exportJSON(transactions: Transaction[]) {
  const content = JSON.stringify(transactions, null, 2)
  const filename = `transactions_${new Date().toISOString().slice(0, 10)}.json`
  downloadTextFile(content, filename, 'application/json;charset=utf-8')
}

export function TransactionsToolbar({
  onAdd,
}: {
  onAdd: () => void
}) {
  const { role, ui, visibleTransactions, setSearchCategory, setTypeFilter } = useFinance()
  const isAdmin = role === 'admin'

  function onExportCSV() {
    const content = toCSV(visibleTransactions)
    const filename = `transactions_${new Date().toISOString().slice(0, 10)}.csv`
    downloadTextFile(content, filename, 'text/csv;charset=utf-8')
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-[220px]">
          <Input
            value={ui.searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            placeholder="Search by category…"
            aria-label="Search by category"
          />
        </div>

        <div className="w-full sm:w-52">
          <Select
            value={ui.type}
            onChange={(e) => {
              const v = e.target.value
              setTypeFilter(v === 'all' ? 'all' : (v as TransactionType))
            }}
            aria-label="Filter by type"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onExportCSV} disabled={!visibleTransactions.length}>
            Export CSV
          </Button>
          <Button variant="ghost" onClick={() => exportJSON(visibleTransactions)} disabled={!visibleTransactions.length}>
            Export JSON
          </Button>
        </div>
        <Button variant="primary" onClick={onAdd} disabled={!isAdmin}>
          Add transaction
        </Button>
      </div>
    </div>
  )
}

