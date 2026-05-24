import { useState } from 'react'
import { Plus, Pencil, Check, X, Phone, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { vendorService, categoryService } from '../services/voucherService'
import { useFetch, useAction } from '../hooks/useFetch'

const EMPTY = { name: '', contact: '', category: '', address: '' }

export default function VendorsPage() {
  const { data: vendors, loading, refetch } = useFetch(() => vendorService.getAll(), [])
  const { data: cats }                       = useFetch(() => categoryService.getAll(), [])
  const { execute, loading: saving }         = useAction()
  const [showForm, setShowForm] = useState(false)
  const [editId,   setEditId]   = useState(null)
  const [form,     setForm]     = useState(EMPTY)

  function startEdit(v) {
    setEditId(v.id)
    setForm({ name: v.name, contact: v.contact, category: v.category, address: v.address || '' })
    setShowForm(true)
  }

  function startCreate() { setEditId(null); setForm(EMPTY); setShowForm(true) }

  async function save() {
    if (!form.name.trim()) return toast.error('Vendor name is required')
    try {
      if (editId) {
        await execute(() => vendorService.update(editId, form))
        toast.success('Vendor updated!')
      } else {
        await execute(() => vendorService.create(form))
        toast.success('Vendor added!')
      }
      setShowForm(false)
      refetch()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Vendors</h2>
          <p className="text-sm text-gray-500">{(vendors || []).length} registered vendors</p>
        </div>
        <button id="btn-add-vendor" onClick={startCreate} className="btn-primary">
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-5 animate-fade-in">
          <h3 className="font-semibold text-gray-700 mb-4">{editId ? 'Edit' : 'Add'} Vendor</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Vendor Name *</label>
              <input id="vendor-name-input" className="form-input" value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Shreeji Electricals" />
            </div>
            <div>
              <label className="form-label">Contact Number</label>
              <input type="tel" className="form-input" value={form.contact}
                onChange={e => setForm(f => ({...f, contact: e.target.value}))} placeholder="10-digit mobile" />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category}
                onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                <option value="">Select category</option>
                {(cats || []).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address}
                onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="Optional address" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex items-center gap-1">
              <X size={15} /> Cancel
            </button>
            <button id="btn-save-vendor" onClick={save} disabled={saving} className="btn-primary">
              {saving ? <span className="spinner w-4 h-4" /> : <><Check size={15} /> Save</>}
            </button>
          </div>
        </div>
      )}

      {/* Vendor grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner w-7 h-7" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(vendors || []).map(v => (
            <div key={v.id} className="card-hover p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-primary-600" />
                </div>
                <button onClick={() => startEdit(v)} className="btn-ghost p-1.5">
                  <Pencil size={14} />
                </button>
              </div>
              <div className="mt-3">
                <p className="font-semibold text-gray-800">{v.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{v.category || 'No category'}</p>
                {v.contact && (
                  <div className="flex items-center gap-1 mt-2">
                    <Phone size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{v.contact}</span>
                  </div>
                )}
                {v.address && (
                  <p className="text-xs text-gray-400 mt-1 truncate">{v.address}</p>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`badge ${v.active ? 'badge-approved' : 'badge-draft'}`}>
                  {v.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
