import { useState } from 'react'
import { Plus, X, Check, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoryService } from '../services/voucherService'
import { useFetch } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import { getFiscalYear } from '../utils/formatters'

export default function SettingsPage() {
  const { hasPermission, user } = useAuth()
  const { data: cats, loading, refetch } = useFetch(() => categoryService.getAll(), [])
  const [newCat,     setNewCat]     = useState('')
  const [categories, setCategories] = useState(null)

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

  if (!hasPermission('ADMIN_SETTINGS')) {
    return (
      <div className="card p-12 text-center max-w-md mx-auto">
        <div className="text-5xl mb-4">🔒</div>
        <h3 className="font-semibold text-gray-800">Chairman Access Only</h3>
        <p className="text-gray-500 text-sm mt-2">
          Settings can only be modified by the Chairman.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-500">System configuration · Chairman access only</p>
      </div>

      {/* Society Info */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Society Information</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Society Name', 'ARV ROYALE D WING CHS'],
            ['Registration Type', 'Registered Co-operative Housing Society'],
            ['Current Fiscal Year', getFiscalYear()],
            ['Administrator', user?.email || '—'],
          ].map(([k, v]) => (
            <div key={k} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400">{k}</p>
              <p className="text-sm font-semibold text-gray-800">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Google Integration */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-700 mb-2">Google Integration Status</h3>
        <p className="text-sm text-gray-500 mb-4">
          Configure your Google Apps Script URL and OAuth Client ID in the <code className="text-xs bg-gray-100 px-1 rounded">.env</code> file.
        </p>
        <div className="space-y-2">
          {[
            ['Apps Script URL', import.meta.env.VITE_APPS_SCRIPT_URL],
            ['Google Client ID', import.meta.env.VITE_GOOGLE_CLIENT_ID],
          ].map(([label, val]) => {
            const isSet = val && !val.includes('YOUR_')
            return (
              <div key={label} className={`flex items-center justify-between p-3 rounded-lg border ${isSet ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className={`text-xs font-semibold ${isSet ? 'text-green-700' : 'text-amber-700'}`}>
                  {isSet ? '✅ Configured' : '⚠️ Not configured'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Expense Categories */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Expense Categories</h3>

        <div className="flex gap-2 mb-4">
          <input
            id="new-category-input"
            className="form-input flex-1"
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            placeholder="Add new category…"
          />
          <button id="btn-add-category" onClick={addCategory} className="btn-primary px-4">
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

      {/* Google Drive Structure */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Google Drive Folder Structure</h3>
        <p className="text-sm text-gray-500 mb-3">
          Files are organized in the following structure in your Google Drive:
        </p>
        <pre className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 overflow-x-auto leading-relaxed">
{`Society Accounts/
└── FY 2026-27/
    ├── Vendor Vouchers/
    │   ├── April/
    │   ├── May/
    │   └── .../
    ├── Vendor Bills/
    ├── Payment Proofs/
    ├── Signatures/
    ├── Signed PDFs/
    └── Audit Exports/`}
        </pre>
      </div>

      {/* Google Sheets Structure */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Google Sheets Database</h3>
        <div className="space-y-2">
          {[
            ['Voucher_Master',     'All payment vouchers with full details'],
            ['Vendors_Master',     'Registered vendor list'],
            ['Expense_Categories', 'List of expense categories'],
            ['Approval_Log',       'Approval actions and timestamps'],
            ['Audit_Log',          'Full system audit trail'],
            ['Users',              'User emails and role assignments'],
          ].map(([sheet, desc]) => (
            <div key={sheet} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="font-mono text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                {sheet}
              </span>
              <span className="text-sm text-gray-600">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
