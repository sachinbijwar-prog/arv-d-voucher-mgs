import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { voucherService, categoryService, vendorService } from '../services/voucherService'
import { useFetch } from '../hooks/useFetch'
import { PAYMENT_MODES, WINGS } from '../utils/formatters'
import FileUpload from '../components/FileUpload'
import SignaturePad from '../components/SignaturePad'
import { useAuth } from '../context/AuthContext'

const STEPS = [
  { id: 1, label: 'Voucher Details' },
  { id: 2, label: 'Invoice & Payment' },
  { id: 3, label: 'File Uploads' },
  { id: 4, label: 'Signatures' },
  { id: 5, label: 'Review & Submit' },
]

const INITIAL = {
  voucherNumber: '', date: new Date().toISOString().slice(0,10),
  vendorName: '', vendorContact: '', category: '', description: '',
  invoiceNo: '', invoiceDate: '', amount: '', gst: '', total: '',
  paymentMode: 'Cheque', chequeUTR: '', wing: '', remarks: '',
  invoiceFiles: [], paymentProofFiles: [], otherFiles: [],
  vendorSignature: null, treasurerSignature: null,
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`step-circle ${step.id < current ? 'completed' : step.id === current ? 'active' : 'pending'}`}>
              {step.id < current ? <CheckCircle size={16} /> : step.id}
            </div>
            <span className={`text-[10px] font-medium hidden sm:block ${step.id === current ? 'text-primary-600' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 sm:w-12 h-px mx-1 mb-4 ${step.id < current ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function FieldError({ msg }) {
  if (!msg) return null
  return <p className="form-error flex items-center gap-1"><AlertCircle size={11} />{msg}</p>
}

export default function CreateVoucherPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const { data: categories } = useFetch(() => categoryService.getAll(), [])
  const { data: vendors }    = useFetch(() => vendorService.getAll(), [])

  // Auto-generate voucher number
  useEffect(() => {
    voucherService.getNextNumber().then(res => {
      setForm(f => ({ ...f, voucherNumber: res.voucherNumber || res }))
    })
  }, [])

  function set(key, val) {
    setForm(f => {
      const updated = { ...f, [key]: val }
      // Auto-calc total
      if (key === 'amount' || key === 'gst') {
        const a = parseFloat(key === 'amount' ? val : f.amount) || 0
        const g = parseFloat(key === 'gst' ? val : f.gst) || 0
        updated.total = (a + g).toFixed(2)
      }
      return updated
    })
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  function validateStep(s) {
    const e = {}
    if (s === 1) {
      if (!form.vendorName.trim())  e.vendorName  = 'Vendor name is required'
      if (!form.category)           e.category    = 'Category is required'
      if (!form.description.trim()) e.description = 'Description is required'
      if (!form.date)               e.date        = 'Date is required'
    }
    if (s === 2) {
      if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0)
        e.amount = 'Enter a valid amount'
      if (!form.invoiceNo.trim()) e.invoiceNo = 'Invoice number is required'
      if (!form.paymentMode)      e.paymentMode = 'Select payment mode'
      if (['Cheque','NEFT','RTGS','IMPS','UPI'].includes(form.paymentMode) && !form.chequeUTR.trim())
        e.chequeUTR = 'Cheque/UTR number is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() { if (validateStep(step)) setStep(s => Math.min(5, s+1)) }
  function back() { setStep(s => Math.max(1, s-1)) }

  async function handleSubmit(asDraft = true) {
    if (!asDraft && !validateStep(step)) return
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        status: asDraft ? 'Draft' : 'Submitted',
        createdBy: user?.email,
        amount: parseFloat(form.amount) || 0,
        gst:    parseFloat(form.gst)    || 0,
        total:  parseFloat(form.total)  || 0,
      }
      await voucherService.create(payload)
      toast.success(asDraft ? 'Voucher saved as draft!' : 'Voucher submitted for review!')
      navigate('/vouchers')
    } catch (err) {
      toast.error(err.message || 'Failed to save voucher')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (key) => errors[key] ? 'form-input-error' : 'form-input'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Create Voucher</h2>
        <p className="text-sm text-gray-500">Fill in vendor payment voucher details</p>
      </div>

      <StepIndicator current={step} />

      <div className="card p-6 animate-fade-in">
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Voucher Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Voucher Number</label>
                <input className="form-input bg-gray-50" value={form.voucherNumber} readOnly />
                <p className="form-hint">Auto-generated</p>
              </div>
              <div>
                <label className="form-label">Voucher Date *</label>
                <input id="voucher-date" type="date" className={inputClass('date')} value={form.date}
                  onChange={e => set('date', e.target.value)} />
                <FieldError msg={errors.date} />
              </div>
            </div>

            <div>
              <label className="form-label">Vendor Name *</label>
              <input id="vendor-name" list="vendor-list" className={inputClass('vendorName')} value={form.vendorName}
                onChange={e => set('vendorName', e.target.value)} placeholder="Enter or select vendor name" />
              <datalist id="vendor-list">
                {(vendors || []).map(v => <option key={v.id} value={v.name} />)}
              </datalist>
              <FieldError msg={errors.vendorName} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Vendor Contact</label>
                <input id="vendor-contact" type="tel" className="form-input" value={form.vendorContact}
                  onChange={e => set('vendorContact', e.target.value)} placeholder="10-digit mobile" />
              </div>
              <div>
                <label className="form-label">Expense Category *</label>
                <select id="expense-category" className={inputClass('category')} value={form.category}
                  onChange={e => set('category', e.target.value)}>
                  <option value="">Select category</option>
                  {(categories || []).map(c => <option key={c}>{c}</option>)}
                </select>
                <FieldError msg={errors.category} />
              </div>
            </div>

            <div>
              <label className="form-label">Work Description *</label>
              <textarea id="work-description" rows={3} className={inputClass('description')} value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe the work/service provided" />
              <FieldError msg={errors.description} />
            </div>

            <div>
              <label className="form-label">Wing / Area</label>
              <select id="wing-area" className="form-select" value={form.wing}
                onChange={e => set('wing', e.target.value)}>
                <option value="">Select wing/area</option>
                {WINGS.map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Invoice & Payment Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Invoice Number *</label>
                <input id="invoice-no" className={inputClass('invoiceNo')} value={form.invoiceNo}
                  onChange={e => set('invoiceNo', e.target.value)} placeholder="e.g. INV-2026-101" />
                <FieldError msg={errors.invoiceNo} />
              </div>
              <div>
                <label className="form-label">Invoice Date</label>
                <input type="date" className="form-input" value={form.invoiceDate}
                  onChange={e => set('invoiceDate', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="form-label">Amount (₹) *</label>
                <input id="amount" type="number" min="0" className={inputClass('amount')} value={form.amount}
                  onChange={e => set('amount', e.target.value)} placeholder="0" />
                <FieldError msg={errors.amount} />
              </div>
              <div>
                <label className="form-label">GST Amount (₹)</label>
                <input type="number" min="0" className="form-input" value={form.gst}
                  onChange={e => set('gst', e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className="form-label">Total Amount (₹)</label>
                <input className="form-input bg-green-50 font-bold text-green-700" value={form.total} readOnly />
                <p className="form-hint">Auto-calculated</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Payment Mode *</label>
                <select id="payment-mode" className={inputClass('paymentMode')} value={form.paymentMode}
                  onChange={e => set('paymentMode', e.target.value)}>
                  {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                </select>
                <FieldError msg={errors.paymentMode} />
              </div>
              {form.paymentMode !== 'Cash' && (
                <div>
                  <label className="form-label">
                    {form.paymentMode === 'Cheque' ? 'Cheque Number *' : 'UTR / Reference No. *'}
                  </label>
                  <input id="cheque-utr" className={inputClass('chequeUTR')} value={form.chequeUTR}
                    onChange={e => set('chequeUTR', e.target.value)} placeholder="Enter number" />
                  <FieldError msg={errors.chequeUTR} />
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Remarks</label>
              <textarea rows={2} className="form-textarea" value={form.remarks}
                onChange={e => set('remarks', e.target.value)}
                placeholder="Any additional remarks or notes" />
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-gray-700 border-b pb-2">File Uploads</h3>

            <div>
              <label className="form-label">Invoice PDF / Image</label>
              <FileUpload
                id="invoice-upload"
                files={form.invoiceFiles}
                onChange={files => set('invoiceFiles', files)}
                accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.jpg','.jpeg','.png'] }}
                label="Drop invoice PDF or image here, or click to browse"
              />
            </div>

            <div>
              <label className="form-label">Cheque / Payment Proof</label>
              <FileUpload
                id="payment-proof-upload"
                files={form.paymentProofFiles}
                onChange={files => set('paymentProofFiles', files)}
                accept={{ 'image/*': ['.jpg','.jpeg','.png'], 'application/pdf': ['.pdf'] }}
                label="Drop cheque photo or UTR screenshot here"
              />
            </div>

            <div>
              <label className="form-label">Additional Attachments</label>
              <FileUpload
                id="other-uploads"
                files={form.otherFiles}
                onChange={files => set('otherFiles', files)}
                accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.jpg','.jpeg','.png'] }}
                label="Drop any other supporting documents"
                multiple
              />
            </div>
          </div>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Digital Signatures</h3>

            <SignaturePad
              id="vendor-signature"
              label="Vendor / Contractor Signature"
              value={form.vendorSignature}
              onChange={sig => set('vendorSignature', sig)}
            />

            <SignaturePad
              id="treasurer-signature"
              label="Treasurer Signature"
              value={form.treasurerSignature}
              onChange={sig => set('treasurerSignature', sig)}
            />
          </div>
        )}

        {/* ── STEP 5 ── */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Review & Submit</h3>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Voucher Number',  form.voucherNumber],
                ['Date',           form.date],
                ['Vendor Name',    form.vendorName],
                ['Category',       form.category],
                ['Invoice No.',    form.invoiceNo],
                ['Payment Mode',   form.paymentMode],
                ['Amount',         `₹${form.amount || 0}`],
                ['GST',            `₹${form.gst || 0}`],
                ['Total Amount',   `₹${form.total || 0}`],
                ['Wing / Area',    form.wing || '—'],
              ].map(([label, val]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{val || '—'}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Description</p>
              <p className="text-sm text-gray-800">{form.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="text-xs text-blue-600">Invoice Files</p>
                <p className="font-bold text-blue-800">{form.invoiceFiles.length}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                <p className="text-xs text-purple-600">Payment Proof</p>
                <p className="font-bold text-purple-800">{form.paymentProofFiles.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <p className="text-xs text-green-600">Signatures</p>
                <p className="font-bold text-green-800">
                  {[form.vendorSignature, form.treasurerSignature].filter(Boolean).length}/2
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                id="btn-save-draft"
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="btn-secondary flex-1"
              >
                {submitting ? <span className="spinner w-4 h-4" /> : 'Save as Draft'}
              </button>
              <button
                id="btn-submit-voucher"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting ? <span className="spinner w-4 h-4" /> : 'Submit for Approval'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step < 5 && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            {step > 1 && (
              <button id="btn-back" onClick={back} className="btn-secondary flex items-center gap-1">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <button id="btn-next" onClick={next} className="btn-primary flex-1 flex items-center justify-center gap-1">
              {step === 4 ? 'Review' : 'Continue'} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
