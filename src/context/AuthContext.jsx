import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export const ROLES = {
  TREASURER:  'treasurer',
  MANAGER:    'manager',
  CHAIRMAN:   'chairman',
  AUDITOR:    'auditor',
  COMMITTEE:  'committee',
}

const PERMISSIONS = {
  CREATE_VOUCHER:    ['treasurer', 'manager'],
  EDIT_DRAFT:        ['treasurer', 'manager'],
  SUBMIT_VOUCHER:    ['treasurer', 'manager'],
  TREASURER_VERIFY:  ['treasurer', 'manager'],
  CHAIRMAN_APPROVE:  ['chairman'],
  VIEW_ALL:          ['treasurer', 'manager', 'chairman', 'auditor', 'committee'],
  EXPORT_REPORTS:    ['treasurer', 'manager', 'chairman', 'auditor'],
  ADMIN_SETTINGS:    ['chairman'],
  MANAGE_VENDORS:    ['treasurer', 'manager', 'chairman'],
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [role,    setRole]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sdvms_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        setUser(parsed.user)
        setRole(parsed.role)
      }
    } catch (_) {
      localStorage.removeItem('sdvms_user')
    }
    setLoading(false)
  }, [])

  const login = useCallback((userData, selectedRole) => {
    setUser(userData)
    setRole(selectedRole)
    localStorage.setItem('sdvms_user', JSON.stringify({ user: userData, role: selectedRole }))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setRole(null)
    localStorage.removeItem('sdvms_user')
  }, [])

  const hasPermission = useCallback((permission) => {
    if (!role) return false
    return (PERMISSIONS[permission] || []).includes(role)
  }, [role])

  return (
    <AuthContext.Provider value={{
      user, role, loading,
      isAuthenticated: Boolean(user),
      login, logout, hasPermission,
      ROLES, PERMISSIONS,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
