import { useState } from 'react'
import { Plus, X, Check, Tag, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoryService } from '../services/voucherService'
import { useFetch } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import { getFiscalYear } from '../utils/formatters'

export default function SettingsPage() {
  const { hasPermission, user, changePassword } = useAuth()
  const { data: cats, loading, refetch } = useFetch(() => categoryService.getAll(), [])
  
  const [newCat,     setNewCat]     = useState('')
  const [categories, setCategories] = useState(null)
  
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const current = categories ?? (cats || [])

  function addCategory() {
    if (!newCat.trim()) return
    setCategories([...current, newCat.trim()])
    setNewCat('')
    toast.success(`Category "${newCat.trim()}" added (saved on next deploy)`)
  }

  function removeCategory(cat) {
    setCategories(current.filter(c => c !== cat))
  }

  function handlePasswordChange(e) {
    e.preventDefault()
    if (!oldPassword || !newPassword) {
      toast.error('Please enter both passwords')
      return
    }
    const res = changePassword(oldPassword, newPassword)
    if (res.success) {
      toast.success('Password changed successfully!')
      setOldPassword('')
      setNewPassword('')
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-500">System configuration & user preferences</p>
      </div>

      {/* Change Password - Available to all users */}
      <div className="card p-5 border-l-4 border-l-primary-500">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-primary-600" />
          <h3 className="font-semibold text-gray-700">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="grid sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">Update Password</button>
          </div>
        </form>
      </div>

      {!hasPermission('ADMIN_SETTINGS') ? (
        <div className="card p-12 text-center max-w-md mx-auto mt-8">
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="font-semibold text-gray-800">Chairman Access Only</h3>
          <p className="text-gray-500 text-sm mt-2">
            The rest of the settings can only be modified by the Chairman.
          </p>
        </div>
      ) : (
        <>
          {/* Society Info */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Society Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Society Name', 'ARV ROYALE D WING CHS'],
                ['Registration Type', 'Registered Co-operative Housing Society'],
                ['Current Fiscal Year', getFiscalYear()],
                ['Administrator', user?.username || '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="text-sm font-semibold text-gray-800">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Categories */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Expense Categories</h3>

            <div className="flex gap-2 mb-4">
              <input
                className="form-input flex-1"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCategory()}
                placeholder="Add new category…"
              />
              <button onClick={addCategory} className="btn-primary px-4">
                <Plus size={16} />
              </button>
            </div>

            {loading ? <div className="spinner w-5 h-5" /> : (
              <div className="flex flex-wrap gap-2">
                {current.map(cat => (
                  <div key={cat} className="flex items-center gap-1.5 bg-primary-50 border border-primary-200 rounded-full px-3 py-1">
                    <Tag size={11} className="text-primary-500" />
                    <span className="text-sm text-primary-700 font-medium">{cat}</span>
                    <button onClick={() => removeCategory(cat)} className="text-primary-400 hover:text-red-500 ml-1">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
