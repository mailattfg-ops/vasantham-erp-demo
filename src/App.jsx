import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Inventory } from './pages/registration/Inventory'
import { ItemGroups } from './pages/registration/ItemGroups'
import { GSTUnits } from './pages/registration/GSTUnits'
import { Customers } from './pages/registration/Customers'
import { Vendors } from './pages/registration/Vendors'
import { Employees } from './pages/registration/Employees'
import { CompanyInfo } from './pages/registration/CompanyInfo'
import { POS } from './pages/tasks/POS'
import { Sales } from './pages/tasks/Sales'
import { SalesReturns } from './pages/tasks/SalesReturns'
import { Purchases } from './pages/tasks/Purchases'
import { PurchaseReturns } from './pages/tasks/PurchaseReturns'
import { DayBook } from './pages/financial/DayBook'
import { CashBook } from './pages/financial/CashBook'
import { Ledger } from './pages/financial/Ledger'
import { TrialBalance } from './pages/financial/TrialBalance'
import { StockReport } from './pages/reports/StockReport'
import { StockValuation } from './pages/reports/StockValuation'
import { SalesReport } from './pages/reports/SalesReport'
import { GSTReport } from './pages/reports/GSTReport'
import { PurchaseReport } from './pages/reports/PurchaseReport'
import { MISDashboard } from './pages/mis/MISDashboard'
import { TopItems } from './pages/mis/TopItems'
import { CategoryAnalysis } from './pages/mis/CategoryAnalysis'
import { PaymentAnalysis } from './pages/mis/PaymentAnalysis'

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="inventory"    element={<Inventory />} />
          <Route path="item-groups"  element={<ItemGroups />} />
          <Route path="gst-units"    element={<GSTUnits />} />
          <Route path="customers"    element={<Customers />} />
          <Route path="vendors"      element={<Vendors />} />
          <Route path="employees"    element={<Employees />} />
          <Route path="company"      element={<CompanyInfo />} />
          <Route path="pos"              element={<POS />} />
          <Route path="sales"            element={<Sales />} />
          <Route path="sales-returns"    element={<SalesReturns />} />
          <Route path="purchases"        element={<Purchases />} />
          <Route path="purchase-returns" element={<PurchaseReturns />} />
          <Route path="accounts/daybook"  element={<DayBook />} />
          <Route path="accounts/cashbook" element={<CashBook />} />
          <Route path="accounts/ledger"   element={<Ledger />} />
          <Route path="accounts/trial"    element={<TrialBalance />} />
          <Route path="reports/stock"     element={<StockReport />} />
          <Route path="reports/valuation" element={<StockValuation />} />
          <Route path="reports/sales"     element={<SalesReport />} />
          <Route path="reports/gst"       element={<GSTReport />} />
          <Route path="reports/purchases" element={<PurchaseReport />} />
          <Route path="mis"                element={<MISDashboard />} />
          <Route path="mis/top-items"      element={<TopItems />} />
          <Route path="mis/categories"     element={<CategoryAnalysis />} />
          <Route path="mis/payments"       element={<PaymentAnalysis />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
