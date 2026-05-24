import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requiredPermission }) {
  const { isAuthenticated, hasPermission } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm">
            You don't have permission to access this page.
            Please contact your administrator.
          </p>
        </div>
      </div>
    )
  }

  return children
}
