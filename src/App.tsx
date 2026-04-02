import { FinanceProvider } from './context/FinanceContext'
import { DashboardPage } from './pages/DashboardPage'

export function App() {
  return (
    <FinanceProvider>
      <DashboardPage />
    </FinanceProvider>
  )
}

