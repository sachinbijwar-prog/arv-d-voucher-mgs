import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, CheckCircle, XCircle, Clock, User, PenTool } from 'lucide-react'
import toast from 'react-hot-toast'
import { voucherService } from '../services/voucherService'
import { useFetch, useAction } from '../hooks/useFetch'
import { formatCurrency, formatDate, formatDateTime, STATUS_CONFIG } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'
import { generateVoucherPDF } from '../utils/pdfGenerator'
import SignaturePad from '../components/SignaturePad'

function TimelineItem({ icon: Icon, color, title, by, at, comment }) {
  return (
    <div className="timeline-item">
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0 z-10`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="flex-1 pt-1.5">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {by && <p className="text-xs text-gray-500">By {by}</p>}
        {at && <p className="text-xs text-gray-400">{formatDateTime(at)}</p>}
        {comment && <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded p-2 italic">"{comment}"</p>}
      </div>
    </div>
  )
}

export default function VoucherDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, role, hasPermission } = useAuth()
  const { data: voucher, loading, error, refetch } = useFetch(() => voucherService.getById(id), [id])
  const { execute, loading: acting } = useAction()
  
  const [comment, setComment] = useState('')
  const [showCommentFor, setShowCommentFor] = useState(null)
  const [managerSig, setManagerSig] = useState(null)

  async function doAction(action, signatureLink = null) {
    try {
      await execute(() => voucherService.approve(id, action, comment, user?.username, signatureLink))
      toast.success('Voucher updated!')
      setComment('')
      setShowCommentFor(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Action failed')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="spinner w-8 h-8" /></div>
  if (error || !voucher) return (
    <div className="text-center py-20">
      <p className="text-red-500">{error || 'Voucher not found'}</p>
      <button onClick={() => navigate('/vouchers')} className="btn-secondary mt-4">Back to List</button>
    </div>
  )

  // Calculate permissions for actions based on state
  const canSubmit = voucher.status === 'Draft' && hasPermission('SUBMIT_VOUCHER')
  const canVerify = voucher.status === 'Submitted' && hasPermission('TREASURER_VERIFY')
  
  const needsChairmanApproval = voucher.status === 'Treasurer Verified' && !voucher.chairmanApprovedBy
  const needsSecretaryApproval = voucher.status === 'Treasurer Verified' && !voucher.secretaryApprovedBy
  
  const canApproveChairman = needsChairmanApproval && hasPermission('CHAIRMAN_APPROVE')
  const canApproveSecretary = needsSecretaryApproval && hasPermission('SECRETARY_APPROVE')
  
  const canManagerSign = voucher.status === 'Ready for Payment' && role === 'manager'

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/vouchers')} className="btn-ghost p-2">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800 font-mono">{voucher.voucherNumber}</h2>
            <span className={STATUS_CONFIG[voucher.status]?.class || 'badge-draft'}>
              {STATUS_CONFIG[voucher.status]?.label || voucher.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">{voucher.vendorName} · {formatDate(voucher.date)}</p>
        </div>
        <button
          onClick={() => generateVoucherPDF(voucher)}
          className="btn-secondary flex items-center gap-2"
        >
          <Download size={16} /> PDF
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Voucher Info */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Voucher Details</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              {[
                ['Vendor Name', voucher.vendorName],
                ['Category', voucher.category],
                ['Invoice No.', voucher.invoiceNo],
                ['Invoice Date', formatDate(voucher.invoiceDate)],
                ['Payment Mode', voucher.paymentMode],
                ['Cheque/UTR', voucher.chequeUTR || '—'],
                ['Wing/Area', voucher.wing || '—'],
                ['Created By', voucher.createdBy],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="text-sm font-medium text-gray-800">{v || '—'}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700">{voucher.description}</p>
            </div>
            {voucher.remarks && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Remarks</p>
                <p className="text-sm text-gray-700 italic">"{voucher.remarks}"</p>
              </div>
            )}
          </div>

          {/* Financial summary */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Financial Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">{formatCurrency(voucher.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">GST</span>
                <span className="font-medium">{formatCurrency(voucher.gst)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="font-bold text-lg text-primary-700">{formatCurrency(voucher.total)}</span>
              </div>
            </div>
          </div>

          {/* Manager Signature Pad */}
          {canManagerSign && (
            <div className="card p-5 border-l-4 border-l-primary-500 animate-slide-in">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <PenTool size={18} className="text-primary-600" />
                Manager Receipt Confirmation
              </h3>
              <p className="text-sm text-gray-500 mb-4">Please sign below to confirm you have received the cheque for this voucher.</p>
              
              <SignaturePad
                id="manager-signature"
                label="Manager Signature"
                value={managerSig}
                onChange={setManagerSig}
              />
              
              <div className="mt-4 flex justify-end">
                <button 
                  className="btn-primary" 
                  disabled={!managerSig || acting}
                  onClick={() => doAction('manager_sign', managerSig)}
                >
                  {acting ? <span className="spinner w-4 h-4" /> : 'Confirm Receipt & Complete'}
                </button>
              </div>
            </div>
          )}

          {/* Attached files */}
          {(voucher.invoiceLink || voucher.paymentProofLink) && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Attached Documents</h3>
              <div className="space-y-2">
                {voucher.invoiceLink && (
                  <a href={voucher.invoiceLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                    📄 Invoice Document
                  </a>
                )}
                {voucher.paymentProofLink && (
                  <a href={voucher.paymentProofLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                    📸 Payment Proof
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Signatures Display */}
          {(voucher.managerSignatureLink) && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Signatures</h3>
              <div className="grid grid-cols-2 gap-4">
                {voucher.managerSignatureLink && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Manager Signature</p>
                    <img src={voucher.managerSignatureLink} alt="Manager signature"
                      className="border rounded-lg h-20 w-full object-contain bg-gray-50" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Timeline + Actions */}
        <div className="space-y-4">
          
          {/* Action Buttons */}
          {(canSubmit || canVerify || canApproveChairman || canApproveSecretary) && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Actions</h3>

              {showCommentFor ? (
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Add a comment (optional)"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowCommentFor(null)} className="btn-secondary btn-sm flex-1">
                      Cancel
                    </button>
                    <button
                      onClick={() => doAction(showCommentFor)}
                      disabled={acting}
                      className="btn-success btn-sm flex-1"
                    >
                      {acting ? <span className="spinner w-4 h-4" /> : 'Confirm'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {canSubmit && (
                    <button onClick={() => setShowCommentFor('submit')} className="btn-primary w-full">
                      <CheckCircle size={16} /> Submit for Review
                    </button>
                  )}
                  {canVerify && (
                    <button onClick={() => setShowCommentFor('treasurer_verify')} className="btn-primary w-full">
                      <CheckCircle size={16} /> Verify (Treasurer)
                    </button>
                  )}
                  {canApproveChairman && (
                    <button onClick={() => setShowCommentFor('chairman_approve')} className="btn-primary w-full">
                      <CheckCircle size={16} /> Approve (Chairman)
                    </button>
                  )}
                  {canApproveSecretary && (
                    <button onClick={() => setShowCommentFor('secretary_approve')} className="btn-primary w-full">
                      <CheckCircle size={16} /> Approve (Secretary)
                    </button>
                  )}
                  
                  {voucher.status !== 'Draft' && (
                    <button
                      onClick={() => doAction('reject')}
                      disabled={acting}
                      className="btn-danger w-full btn-sm mt-4"
                    >
                      <XCircle size={14} /> Return to Draft
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Approval Timeline</h3>
            <div className="space-y-0">
              <TimelineItem
                icon={Clock} color="bg-gray-400"
                title="Voucher Created"
                by={voucher.createdBy}
                at={voucher.createdAt}
              />
              {voucher.submittedAt && (
                <TimelineItem
                  icon={User} color="bg-blue-500"
                  title="Submitted for Review"
                  by={voucher.createdBy}
                  at={voucher.submittedAt}
                />
              )}
              {voucher.treasurerVerifiedAt && (
                <TimelineItem
                  icon={CheckCircle} color="bg-indigo-500"
                  title="Treasurer Verified"
                  by={voucher.treasurerVerifiedBy}
                  at={voucher.treasurerVerifiedAt}
                />
              )}
              {voucher.chairmanApprovedAt && (
                <TimelineItem
                  icon={CheckCircle} color="bg-green-500"
                  title="Chairman Approved"
                  by={voucher.chairmanApprovedBy}
                  at={voucher.chairmanApprovedAt}
                  comment={voucher.remarks}
                />
              )}
              {voucher.secretaryApprovedAt && (
                <TimelineItem
                  icon={CheckCircle} color="bg-green-500"
                  title="Secretary Approved"
                  by={voucher.secretaryApprovedBy}
                  at={voucher.secretaryApprovedAt}
                />
              )}
              {voucher.completedAt && (
                <TimelineItem
                  icon={CheckCircle} color="bg-emerald-500"
                  title="Payment Completed"
                  by={voucher.managerSignatureLink ? 'Manager Signature' : undefined}
                  at={voucher.completedAt}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
