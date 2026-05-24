import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { voucherService } from '../services/voucherService'
import { useFetch, useAction } from '../hooks/useFetch'
import { formatCurrency, formatDate, STATUS_CONFIG, WORKFLOW_TRANSITIONS } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

export default function ApprovalsPage() {
  const navigate = useNavigate()
  const { user, hasPermission } = useAuth()
  const { data, loading, refetch } = useFetch(() => voucherService.getAll(), [])
  const { execute, loading: acting } = useAction()
  const [comment, setComment] = useState('')
  const [activeId, setActiveId] = useState(null)

  const vouchers = (data?.vouchers || data || [])

  // Filter to vouchers pending this user's action
  const pending = vouchers.filter(v => {
    if (v.status === 'Submitted' && hasPermission('TREASURER_VERIFY'))  return true
    if (v.status === 'Treasurer Verified' && hasPermission('CHAIRMAN_APPROVE')) return true
    if (v.status === 'Chairman Approved' && hasPermission('TREASURER_VERIFY')) return true
    return false
  })

  async function act(id, action, comment) {
    try {
      await execute(() => voucherService.approve(id, action, comment, user?.email))
      toast.success('Action completed!')
      setActiveId(null)
      setComment('')
      refetch()
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="spinner w-8 h-8" /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Approvals Queue</h2>
        <p className="text-sm text-gray-500">{pending.length} voucher{pending.length !== 1 ? 's' : ''} awaiting your action</p>
      </div>

      {pending.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No pending approvals</p>
          <p className="text-gray-400 text-sm">All vouchers are up to date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(v => {
            const transition = WORKFLOW_TRANSITIONS[v.status]
            const isActive = activeId === v.id
            return (
              <div key={v.id} className="card p-5 animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-primary-700">{v.voucherNumber}</span>
                      <span className={STATUS_CONFIG[v.status]?.class}>{STATUS_CONFIG[v.status]?.label}</span>
                    </div>
                    <p className="font-semibold text-gray-800">{v.vendorName}</p>
                    <p className="text-sm text-gray-500">{v.category} · {v.description.slice(0,80)}…</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="font-bold text-gray-800">{formatCurrency(v.total)}</span>
                      <span className="text-gray-400">{formatDate(v.date)}</span>
                      <span className="text-gray-400">{v.paymentMode}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => navigate(`/vouchers/${v.id}`)} className="btn-secondary btn-sm">
                      <Eye size={14} /> View
                    </button>
                    {!isActive && transition && (
                      <button onClick={() => setActiveId(v.id)} className="btn-success btn-sm">
                        <CheckCircle size={14} /> {transition.label}
                      </button>
                    )}
                    {!isActive && (
                      <button onClick={() => act(v.id, 'reject', '')} disabled={acting} className="btn-danger btn-sm">
                        <XCircle size={14} /> Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* Comment panel */}
                {isActive && (
                  <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                    <textarea
                      rows={2}
                      className="form-textarea"
                      placeholder="Add approval comment (optional)"
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setActiveId(null)} className="btn-secondary btn-sm">
                        Cancel
                      </button>
                      <button
                        onClick={() => act(v.id, transition.action, comment)}
                        disabled={acting}
                        className="btn-success btn-sm flex-1"
                      >
                        {acting ? <span className="spinner w-4 h-4" /> : `Confirm: ${transition.label}`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
