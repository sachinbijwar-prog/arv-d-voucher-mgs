import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '../layouts/AppLayout'

// Pages
import LoginPage         from '../pages/LoginPage'
import DashboardPage     from '../pages/DashboardPage'
import VouchersPage      from '../pages/VouchersPage'
import CreateVoucherPage from '../pages/CreateVoucherPage'
import VoucherDetailPage from '../pages/VoucherDetailPage'
import ApprovalsPage     from '../pages/ApprovalsPage'
import ReportsPage       from '../pages/ReportsPage'
import VendorsPage       from '../pages/VendorsPage'
import SettingsPage      from '../pages/SettingsPage'
import NotFoundPage      from '../pages/NotFoundPage'

export default function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner w-10 h-10 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading SDVMS…</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index                       element={<DashboardPage />} />
        <Route path="vouchers"             element={<VouchersPage />} />
        <Route path="vouchers/create"      element={<CreateVoucherPage />} />
        <Route path="vouchers/:id"         element={<VoucherDetailPage />} />
        <Route path="approvals"            element={<ApprovalsPage />} />
        <Route path="reports"              element={<ReportsPage />} />
        <Route path="vendors"              element={<VendorsPage />} />
        <Route path="settings"             element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
