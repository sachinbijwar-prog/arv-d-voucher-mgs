// Currency formatter
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
    .format(amount || 0)

// Date formatter
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  } catch { return dateStr }
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch { return dateStr }
}

// Status config
export const STATUS_CONFIG = {
  'Draft':             { label: 'Draft',             class: 'badge-draft',     color: '#6b7280' },
  'Submitted':         { label: 'Submitted',         class: 'badge-submitted', color: '#3b82f6' },
  'Treasurer Verified':{ label: 'Treasurer Verified',class: 'badge-verified',  color: '#6366f1' },
  'Chairman Approved': { label: 'Chairman Approved', class: 'badge-approved',  color: '#22c55e' },
  'Payment Completed': { label: 'Payment Completed', class: 'badge-completed', color: '#10b981' },
  'Archived':          { label: 'Archived',          class: 'badge-archived',  color: '#9ca3af' },
  'Rejected':          { label: 'Rejected',          class: 'badge-rejected',  color: '#ef4444' },
}

export const VOUCHER_STATUSES = Object.keys(STATUS_CONFIG)

export const PAYMENT_MODES = ['Cash', 'Cheque', 'NEFT', 'RTGS', 'IMPS', 'UPI']

export const WINGS = [
  'D Wing', 'Common Area', 'Terrace', 'Parking Area',
  'Garden', 'Basement', 'Clubhouse', 'Society Office'
]

// Voucher workflow transitions
export const WORKFLOW_TRANSITIONS = {
  'Draft':             { next: 'Submitted',          action: 'submit',             label: 'Submit for Review' },
  'Submitted':         { next: 'Treasurer Verified', action: 'treasurer_verify',   label: 'Verify (Treasurer)' },
  'Treasurer Verified':{ next: 'Chairman Approved',  action: 'chairman_approve',   label: 'Approve (Chairman)' },
  'Chairman Approved': { next: 'Payment Completed',  action: 'complete_payment',   label: 'Mark Payment Done' },
  'Payment Completed': { next: 'Archived',           action: 'archive',            label: 'Archive' },
}

// Generate fiscal year label
export function getFiscalYear(date = new Date()) {
  const month = date.getMonth() // 0-based
  const year = date.getFullYear()
  if (month >= 3) return `FY ${year}-${String(year + 1).slice(2)}` // Apr onwards
  return `FY ${year - 1}-${String(year).slice(2)}`
}

// File size formatter
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`
}

// Debounce
export function debounce(fn, ms = 300) {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}
