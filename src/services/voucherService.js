import api from './api'

// ── Mock data for dev/demo mode ───────────────────────────────
const MOCK_VOUCHERS = [
  {
    id: 'v1', voucherNumber: 'VP-2026-0001', date: '2026-05-01',
    vendorName: 'Shreeji Electricals', category: 'Electrical',
    amount: 12500, gst: 2250, total: 14750,
    paymentMode: 'Cheque', chequeUTR: 'CHQ001234',
    wing: 'D Wing', description: 'Electrical work - lobby lighting replacement',
    invoiceNo: 'INV-2026-101', invoiceDate: '2026-04-28',
    status: 'Chairman Approved',
    createdBy: 'treasurer@arvroyale.com', createdAt: '2026-05-01T10:00:00',
    submittedAt: '2026-05-01T11:00:00',
    treasurerVerifiedBy: 'treasurer@arvroyale.com', treasurerVerifiedAt: '2026-05-02T09:00:00',
    chairmanApprovedBy: 'chairman@arvroyale.com', chairmanApprovedAt: '2026-05-03T10:00:00',
    remarks: 'Approved. Urgent replacement.',
  },
  {
    id: 'v2', voucherNumber: 'VP-2026-0002', date: '2026-05-05',
    vendorName: 'Clean India Services', category: 'Housekeeping',
    amount: 8000, gst: 0, total: 8000,
    paymentMode: 'NEFT', chequeUTR: 'UTR9876543210',
    wing: 'Common Area', description: 'Monthly housekeeping May 2026',
    invoiceNo: 'CIS/2026/047', invoiceDate: '2026-05-01',
    status: 'Treasurer Verified',
    createdBy: 'treasurer@arvroyale.com', createdAt: '2026-05-05T09:00:00',
    submittedAt: '2026-05-05T09:30:00',
    treasurerVerifiedBy: 'treasurer@arvroyale.com', treasurerVerifiedAt: '2026-05-06T10:00:00',
    remarks: '',
  },
  {
    id: 'v3', voucherNumber: 'VP-2026-0003', date: '2026-05-10',
    vendorName: 'Rapid Plumbers', category: 'Plumbing',
    amount: 3500, gst: 630, total: 4130,
    paymentMode: 'Cash', chequeUTR: '',
    wing: 'D Wing', description: 'Water pipe repair - 5th floor',
    invoiceNo: 'RP-234', invoiceDate: '2026-05-10',
    status: 'Submitted',
    createdBy: 'manager@arvroyale.com', createdAt: '2026-05-10T14:00:00',
    submittedAt: '2026-05-10T14:30:00',
    remarks: '',
  },
  {
    id: 'v4', voucherNumber: 'VP-2026-0004', date: '2026-05-15',
    vendorName: 'Green Lift Maintenance', category: 'Lift Maintenance',
    amount: 15000, gst: 2700, total: 17700,
    paymentMode: 'Cheque', chequeUTR: 'CHQ005678',
    wing: 'Common Area', description: 'Quarterly lift AMC - Q1',
    invoiceNo: 'GLM/Q1/2026', invoiceDate: '2026-05-12',
    status: 'Draft',
    createdBy: 'treasurer@arvroyale.com', createdAt: '2026-05-15T11:00:00',
    remarks: '',
  },
  {
    id: 'v5', voucherNumber: 'VP-2026-0005', date: '2026-05-18',
    vendorName: 'Paint Perfect', category: 'Civil Work',
    amount: 22000, gst: 3960, total: 25960,
    paymentMode: 'NEFT', chequeUTR: 'UTR1122334455',
    wing: 'D Wing', description: 'Painting work - staircase floors 1-7',
    invoiceNo: 'PP/2026/089', invoiceDate: '2026-05-17',
    status: 'Payment Completed',
    createdBy: 'treasurer@arvroyale.com', createdAt: '2026-05-18T10:00:00',
    submittedAt: '2026-05-18T10:30:00',
    treasurerVerifiedBy: 'treasurer@arvroyale.com', treasurerVerifiedAt: '2026-05-19T09:00:00',
    chairmanApprovedBy: 'chairman@arvroyale.com', chairmanApprovedAt: '2026-05-20T11:00:00',
    completedAt: '2026-05-21T15:00:00',
    remarks: 'Payment transferred.',
  },
]

const MOCK_CATEGORIES = [
  'Electrical', 'Plumbing', 'Civil Work', 'Housekeeping', 'Lift Maintenance',
  'Security', 'Gardening', 'Water Supply', 'Pest Control', 'Other'
]

const MOCK_VENDORS = [
  { id: 'vn1', name: 'Shreeji Electricals', contact: '9876543210', category: 'Electrical', active: true },
  { id: 'vn2', name: 'Clean India Services', contact: '9123456789', category: 'Housekeeping', active: true },
  { id: 'vn3', name: 'Rapid Plumbers', contact: '9988776655', category: 'Plumbing', active: true },
  { id: 'vn4', name: 'Green Lift Maintenance', contact: '9444333222', category: 'Lift Maintenance', active: true },
  { id: 'vn5', name: 'Paint Perfect', contact: '9111222333', category: 'Civil Work', active: true },
]

const isDev = !import.meta.env.VITE_APPS_SCRIPT_URL ||
  import.meta.env.VITE_APPS_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')

// ── Voucher Service ────────────────────────────────────────────

export const voucherService = {
  async getAll(filters = {}) {
    if (isDev) {
      let data = [...MOCK_VOUCHERS]
      if (filters.status)   data = data.filter(v => v.status === filters.status)
      if (filters.vendor)   data = data.filter(v => v.vendorName.toLowerCase().includes(filters.vendor.toLowerCase()))
      if (filters.category) data = data.filter(v => v.category === filters.category)
      if (filters.search)   data = data.filter(v =>
        v.voucherNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        v.vendorName.toLowerCase().includes(filters.search.toLowerCase()) ||
        v.description.toLowerCase().includes(filters.search.toLowerCase())
      )
      await delay(400)
      return { vouchers: data, total: data.length }
    }
    return api({ params: { action: 'getVouchers', ...filters } })
  },

  async getById(id) {
    if (isDev) {
      await delay(300)
      const v = MOCK_VOUCHERS.find(v => v.id === id)
      if (!v) throw new Error('Voucher not found')
      return v
    }
    return api({ params: { action: 'getVoucherById', id } })
  },

  async create(data) {
    if (isDev) {
      await delay(800)
      const newV = {
        ...data,
        id: 'v' + Date.now(),
        status: 'Draft',
        createdAt: new Date().toISOString(),
      }
      MOCK_VOUCHERS.unshift(newV)
      return { success: true, voucher: newV }
    }
    return api({ method: 'post', data: { action: 'createVoucher', ...data } })
  },

  async update(id, data) {
    if (isDev) {
      await delay(600)
      const idx = MOCK_VOUCHERS.findIndex(v => v.id === id)
      if (idx === -1) throw new Error('Voucher not found')
      MOCK_VOUCHERS[idx] = { ...MOCK_VOUCHERS[idx], ...data }
      return { success: true }
    }
    return api({ method: 'post', data: { action: 'updateVoucher', id, ...data } })
  },

  async approve(id, action, comment, approverEmail) {
    if (isDev) {
      await delay(600)
      const idx = MOCK_VOUCHERS.findIndex(v => v.id === id)
      if (idx === -1) throw new Error('Voucher not found')
      const STATUS_MAP = {
        submit: 'Submitted',
        treasurer_verify: 'Treasurer Verified',
        chairman_approve: 'Chairman Approved',
        complete_payment: 'Payment Completed',
        archive: 'Archived',
        reject: 'Draft',
      }
      MOCK_VOUCHERS[idx].status = STATUS_MAP[action] || MOCK_VOUCHERS[idx].status
      MOCK_VOUCHERS[idx].remarks = comment || MOCK_VOUCHERS[idx].remarks
      return { success: true }
    }
    return api({ method: 'post', data: { action: 'approveVoucher', id, approval: action, comment, approverEmail } })
  },

  async getNextNumber() {
    if (isDev) {
      await delay(200)
      const year = new Date().getFullYear()
      const seq = String(MOCK_VOUCHERS.length + 1).padStart(4, '0')
      return { voucherNumber: `VP-${year}-${seq}` }
    }
    return api({ params: { action: 'generateVoucherNumber' } })
  },

  async getDashboardStats() {
    if (isDev) {
      await delay(500)
      const total = MOCK_VOUCHERS.length
      const pending = MOCK_VOUCHERS.filter(v => ['Submitted', 'Treasurer Verified'].includes(v.status)).length
      const monthly = MOCK_VOUCHERS
        .filter(v => new Date(v.date).getMonth() === new Date().getMonth())
        .reduce((s, v) => s + v.total, 0)
      const yearly = MOCK_VOUCHERS.reduce((s, v) => s + v.total, 0)

      const byCategory = {}
      const byMonth = {}
      const byVendor = {}

      MOCK_VOUCHERS.forEach(v => {
        byCategory[v.category] = (byCategory[v.category] || 0) + v.total
        const m = new Date(v.date).toLocaleString('en-IN', { month: 'short' })
        byMonth[m] = (byMonth[m] || 0) + v.total
        byVendor[v.vendorName] = (byVendor[v.vendorName] || 0) + v.total
      })

      return {
        total, pending, monthly, yearly,
        byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
        byMonth: Object.entries(byMonth).map(([month, amount]) => ({ month, amount })),
        byVendor: Object.entries(byVendor).map(([name, amount]) => ({ name, amount })),
        recent: MOCK_VOUCHERS.slice(0, 5),
      }
    }
    return api({ params: { action: 'getDashboardStats' } })
  },
}

export const vendorService = {
  async getAll() {
    if (isDev) { await delay(300); return MOCK_VENDORS }
    return api({ params: { action: 'getVendors' } })
  },
  async create(data) {
    if (isDev) {
      await delay(500)
      const v = { ...data, id: 'vn' + Date.now(), active: true }
      MOCK_VENDORS.push(v)
      return { success: true, vendor: v }
    }
    return api({ method: 'post', data: { action: 'createVendor', ...data } })
  },
  async update(id, data) {
    if (isDev) {
      await delay(400)
      const idx = MOCK_VENDORS.findIndex(v => v.id === id)
      if (idx > -1) MOCK_VENDORS[idx] = { ...MOCK_VENDORS[idx], ...data }
      return { success: true }
    }
    return api({ method: 'post', data: { action: 'updateVendor', id, ...data } })
  },
}

export const categoryService = {
  async getAll() {
    if (isDev) { await delay(200); return MOCK_CATEGORIES }
    return api({ params: { action: 'getCategories' } })
  },
}

export const fileService = {
  async upload(file, folder) {
    if (isDev) {
      await delay(1000)
      return {
        success: true,
        link: `https://drive.google.com/file/d/MOCK_${Date.now()}/view`,
        name: file.name,
      }
    }
    const base64 = await fileToBase64(file)
    return api({
      method: 'post',
      data: { action: 'uploadFile', base64, name: file.name, mimeType: file.type, folder },
    })
  },
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = e => resolve(e.target.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
