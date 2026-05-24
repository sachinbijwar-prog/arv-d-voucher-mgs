import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const ROLES = {
  TREASURER:  'treasurer',
  MANAGER:    'manager',
  CHAIRMAN:   'chairman',
  SECRETARY:  'secretary',
  AUDITOR:    'auditor',
  COMMITTEE:  'committee',
}

const PERMISSIONS = {
  CREATE_VOUCHER:    ['treasurer'],
  EDIT_DRAFT:        ['treasurer'],
  SUBMIT_VOUCHER:    ['treasurer'],
  TREASURER_VERIFY:  ['treasurer'],
  CHAIRMAN_APPROVE:  ['chairman'],
  SECRETARY_APPROVE: ['secretary'],
  VIEW_ALL:          ['treasurer', 'manager', 'chairman', 'secretary', 'auditor', 'committee'],
  EXPORT_REPORTS:    ['treasurer', 'manager', 'chairman', 'secretary', 'auditor'],
  ADMIN_SETTINGS:    ['chairman'],
  MANAGE_VENDORS:    ['treasurer', 'manager', 'chairman'],
}

const DEFAULT_USERS = [
  { id: 'u1', username: 'alhad',     password: 'password123', name: 'Alhad Saraf',    role: ROLES.TREASURER },
  { id: 'u2', username: 'akshay',    password: 'password123', name: 'Akshay Paygude', role: ROLES.MANAGER },
  { id: 'u3', username: 'sachin',    password: 'password123', name: 'Sachin Bijwar',  role: ROLES.CHAIRMAN },
  { id: 'u4', username: 'nazzar',    password: 'password123', name: 'Nazzar C',       role: ROLES.SECRETARY },
  { id: 'u5', username: 'committee', password: 'password123', name: 'Committee View', role: ROLES.COMMITTEE },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usersDb, setUsersDb] = useState(DEFAULT_USERS)

  const isDev = !import.meta.env.VITE_APPS_SCRIPT_URL || import.meta.env.VITE_APPS_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')

  // Load session and user DB on mount
  useEffect(() => {
    async function init() {
      try {
        if (!isDev) {
          try {
            const liveUsers = await api({ params: { action: 'getUsers' } })
            if (liveUsers && liveUsers.length > 0) {
              setUsersDb(liveUsers)
            }
          } catch (e) {
            console.error("Failed to load live users, falling back to local DB", e)
          }
        } else {
          const storedDb = localStorage.getItem('sdvms_users_db')
          if (storedDb) {
            setUsersDb(JSON.parse(storedDb))
          } else {
            localStorage.setItem('sdvms_users_db', JSON.stringify(DEFAULT_USERS))
          }
        }

        const storedSession = localStorage.getItem('sdvms_user')
        if (storedSession) {
          const parsed = JSON.parse(storedSession)
          setUser(parsed.user)
          setRole(parsed.role)
        }
      } catch (_) {
        localStorage.removeItem('sdvms_user')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = useCallback((username, password) => {
    const foundUser = usersDb.find(u => u.username.toLowerCase() === username.toLowerCase())
    if (!foundUser) return { success: false, error: 'User not found' }
    if (foundUser.password !== password) return { success: false, error: 'Incorrect password' }

    const userData = { id: foundUser.id, name: foundUser.name, username: foundUser.username }
    setUser(userData)
    setRole(foundUser.role)
    localStorage.setItem('sdvms_user', JSON.stringify({ user: userData, role: foundUser.role }))
    
    return { success: true }
  }, [usersDb])

  const logout = useCallback(() => {
    setUser(null)
    setRole(null)
    localStorage.removeItem('sdvms_user')
  }, [])

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    if (!user) return { success: false, error: 'Not logged in' }
    
    if (!isDev) {
      try {
        const res = await api({ method: 'post', data: { action: 'updatePassword', username: user.username, oldPassword, newPassword } })
        if (res.success) {
          // Update local state to reflect change
          setUsersDb(prev => prev.map(u => u.username === user.username ? { ...u, password: newPassword } : u))
          return { success: true }
        }
        return { success: false, error: res.message || 'Failed to update' }
      } catch (err) {
        return { success: false, error: err.message || 'Network error' }
      }
    } else {
      const currentUserIdx = usersDb.findIndex(u => u.id === user.id)
      if (currentUserIdx === -1) return { success: false, error: 'User not found in DB' }
      
      if (usersDb[currentUserIdx].password !== oldPassword) {
        return { success: false, error: 'Current password is incorrect' }
      }

      const updatedDb = [...usersDb]
      updatedDb[currentUserIdx] = { ...updatedDb[currentUserIdx], password: newPassword }
      
      setUsersDb(updatedDb)
      localStorage.setItem('sdvms_users_db', JSON.stringify(updatedDb))
      return { success: true }
    }
  }, [user, usersDb])

  const hasPermission = useCallback((permission) => {
    if (!role) return false
    return (PERMISSIONS[permission] || []).includes(role)
  }, [role])

  return (
    <AuthContext.Provider value={{
      user, role, loading,
      isAuthenticated: Boolean(user),
      login, logout, changePassword, hasPermission,
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
