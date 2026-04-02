import { useFinance } from '../../context/FinanceContext'
import type { Role } from '../../types/finance'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'

function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 14.5C19.5 15.5 17.6 16 15.5 16C10.8 16 7 12.2 7 7.5C7 5.4 7.5 3.5 8.5 2C5.2 3.2 3 6.3 3 10C3 15 7 19 12 19C15.7 19 18.8 16.8 20 13.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TopNav() {
  const { role, setRole } = useFinance()

  const currentRoleLabel: Record<Role, string> = {
    admin: 'Admin',
    viewer: 'Viewer',
  }

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-950/60 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 shadow-sm shadow-indigo-500/20" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">Finance Dashboard</div>
              <div className="truncate text-xs text-slate-500 dark:text-slate-300">
                Premium overview, transactions, and insights.
              </div>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">Role</div>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-40"
              aria-label="Select role"
            >
              <option value="viewer">{currentRoleLabel.viewer}</option>
              <option value="admin">{currentRoleLabel.admin}</option>
            </Select>
          </div>
          <div className="h-7 w-px bg-slate-200/70 dark:bg-white/10" />
          <Button
            variant="ghost"
            className="h-10 w-10 rounded-2xl"
            disabled
            aria-label="Dark mode disabled"
          >
            <span className="text-slate-700 dark:text-slate-200">
              <IconMoon />
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button variant="ghost" className="h-10 w-10 rounded-2xl" disabled aria-label="Dark mode disabled">
            <span className="text-slate-700 dark:text-slate-200">
              <IconMoon />
            </span>
          </Button>
          <Select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-28" aria-label="Select role">
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
      </div>
    </div>
  )
}

