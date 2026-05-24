/**
 * SDVMS - VoucherService
 * All voucher CRUD, approval workflow, and dashboard stats
 */

var VoucherService = (function () {

  const HEADERS = [
    'VoucherID','VoucherNumber','Date','VendorName','VendorContact','Category',
    'Wing','Description','InvoiceNo','InvoiceDate','Amount','GST','Total',
    'PaymentMode','ChequeUTR','Status','Remarks',
    'InvoiceLink','PaymentProofLink','VendorSigLink','TreasurerSigLink','PDFLink',
    'CreatedBy','CreatedAt','SubmittedAt',
    'TreasurerVerifiedBy','TreasurerVerifiedAt',
    'ChairmanApprovedBy','ChairmanApprovedAt',
    'CompletedAt','ArchivedAt'
  ]

  function generateVoucherNumber() {
    const year = new Date().getFullYear()
    const rows = SheetsService.getAllRows(SheetsService.SHEET_NAMES.VOUCHER_MASTER)
    // Find max sequence for this year
    const thisYear = rows.filter(r => {
      const num = r['VoucherNumber'] || ''
      return num.startsWith('VP-' + year + '-')
    })
    const seq = thisYear.length + 1
    return `VP-${year}-${String(seq).padStart(4, '0')}`
  }

  function createVoucher(data) {
    const id     = 'V-' + Date.now()
    const number = data.voucherNumber || generateVoucherNumber()
    const now    = new Date().toISOString()

    const row = {
      VoucherID:       id,
      VoucherNumber:   number,
      Date:            data.date || now.slice(0,10),
      VendorName:      data.vendorName || '',
      VendorContact:   data.vendorContact || '',
      Category:        data.category || '',
      Wing:            data.wing || '',
      Description:     data.description || '',
      InvoiceNo:       data.invoiceNo || '',
      InvoiceDate:     data.invoiceDate || '',
      Amount:          parseFloat(data.amount) || 0,
      GST:             parseFloat(data.gst) || 0,
      Total:           parseFloat(data.total) || 0,
      PaymentMode:     data.paymentMode || '',
      ChequeUTR:       data.chequeUTR || '',
      Status:          data.status || 'Draft',
      Remarks:         data.remarks || '',
      InvoiceLink:     data.invoiceLink || '',
      PaymentProofLink:data.paymentProofLink || '',
      VendorSigLink:   data.vendorSigLink || '',
      TreasurerSigLink:data.treasurerSigLink || '',
      PDFLink:         '',
      CreatedBy:       data.createdBy || '',
      CreatedAt:       now,
      SubmittedAt:     data.status === 'Submitted' ? now : '',
      TreasurerVerifiedBy: '', TreasurerVerifiedAt: '',
      ChairmanApprovedBy: '',  ChairmanApprovedAt: '',
      CompletedAt: '', ArchivedAt: '',
    }

    SheetsService.appendRow(SheetsService.SHEET_NAMES.VOUCHER_MASTER, row, HEADERS)

    // Audit log
    logAudit(data.createdBy, 'CREATE_VOUCHER', 'Voucher', `Created ${number}`)

    return { success: true, id, voucherNumber: number, voucher: row }
  }

  function updateVoucher(id, data) {
    const now = new Date().toISOString()
    const updates = {}

    const fields = [
      'VendorName','VendorContact','Category','Wing','Description',
      'InvoiceNo','InvoiceDate','Amount','GST','Total',
      'PaymentMode','ChequeUTR','Remarks','Status',
      'InvoiceLink','PaymentProofLink','VendorSigLink','TreasurerSigLink'
    ]
    fields.forEach(f => { if (data[f] !== undefined) updates[f] = data[f] })

    const ok = SheetsService.updateRow(SheetsService.SHEET_NAMES.VOUCHER_MASTER, 'VoucherID', id, updates)
    if (!ok) return { success: false, message: 'Voucher not found' }

    logAudit(data.updatedBy, 'UPDATE_VOUCHER', 'Voucher', `Updated ${id}`)
    return { success: true }
  }

  function approveVoucher(id, action, comment, approverEmail) {
    const now = new Date().toISOString()
    const updates = {}

    switch (action) {
      case 'submit':
        updates.Status       = 'Submitted'
        updates.SubmittedAt  = now
        break
      case 'treasurer_verify':
        updates.Status               = 'Treasurer Verified'
        updates.TreasurerVerifiedBy  = approverEmail
        updates.TreasurerVerifiedAt  = now
        break
      case 'chairman_approve':
        updates.Status              = 'Chairman Approved'
        updates.ChairmanApprovedBy  = approverEmail
        updates.ChairmanApprovedAt  = now
        if (comment) updates.Remarks = comment
        break
      case 'complete_payment':
        updates.Status      = 'Payment Completed'
        updates.CompletedAt = now
        break
      case 'archive':
        updates.Status     = 'Archived'
        updates.ArchivedAt = now
        break
      case 'reject':
        updates.Status  = 'Draft'
        if (comment) updates.Remarks = comment
        break
      default:
        return { success: false, message: 'Unknown action: ' + action }
    }

    const ok = SheetsService.updateRow(SheetsService.SHEET_NAMES.VOUCHER_MASTER, 'VoucherID', id, updates)
    if (!ok) return { success: false, message: 'Voucher not found' }

    // Approval log
    const logRow = {
      LogID:     'AL-' + Date.now(),
      VoucherID: id,
      Action:    action,
      ByEmail:   approverEmail,
      Comment:   comment || '',
      Timestamp: now,
    }
    SheetsService.appendRow(SheetsService.SHEET_NAMES.APPROVAL_LOG, logRow,
      ['LogID','VoucherID','Action','ByEmail','Comment','Timestamp'])

    logAudit(approverEmail, 'APPROVE_VOUCHER', 'Voucher', `${action} on ${id}`)
    return { success: true, updates }
  }

  function getVouchers(filters) {
    let rows = SheetsService.getAllRows(SheetsService.SHEET_NAMES.VOUCHER_MASTER)

    if (filters.status)   rows = rows.filter(r => r.Status === filters.status)
    if (filters.category) rows = rows.filter(r => r.Category === filters.category)
    if (filters.vendor)   rows = rows.filter(r => (r.VendorName || '').toLowerCase().includes(filters.vendor.toLowerCase()))
    if (filters.search)   rows = rows.filter(r =>
      (r.VoucherNumber + r.VendorName + r.Description).toLowerCase().includes(filters.search.toLowerCase())
    )
    if (filters.dateFrom) rows = rows.filter(r => r.Date >= filters.dateFrom)
    if (filters.dateTo)   rows = rows.filter(r => r.Date <= filters.dateTo)

    // Map to frontend camelCase
    const mapped = rows.map(r => ({
      id: r.VoucherID, voucherNumber: r.VoucherNumber, date: r.Date,
      vendorName: r.VendorName, vendorContact: r.VendorContact,
      category: r.Category, wing: r.Wing, description: r.Description,
      invoiceNo: r.InvoiceNo, invoiceDate: r.InvoiceDate,
      amount: r.Amount, gst: r.GST, total: r.Total,
      paymentMode: r.PaymentMode, chequeUTR: r.ChequeUTR,
      status: r.Status, remarks: r.Remarks,
      invoiceLink: r.InvoiceLink, paymentProofLink: r.PaymentProofLink,
      vendorSigLink: r.VendorSigLink, treasurerSigLink: r.TreasurerSigLink, pdfLink: r.PDFLink,
      createdBy: r.CreatedBy, createdAt: r.CreatedAt, submittedAt: r.SubmittedAt,
      treasurerVerifiedBy: r.TreasurerVerifiedBy, treasurerVerifiedAt: r.TreasurerVerifiedAt,
      chairmanApprovedBy: r.ChairmanApprovedBy, chairmanApprovedAt: r.ChairmanApprovedAt,
      completedAt: r.CompletedAt,
    }))

    return { vouchers: mapped, total: mapped.length }
  }

  function getVoucherById(id) {
    const row = SheetsService.findRow(SheetsService.SHEET_NAMES.VOUCHER_MASTER, 'VoucherID', id)
    if (!row) throw new Error('Voucher not found: ' + id)

    return {
      id: row.VoucherID, voucherNumber: row.VoucherNumber, date: row.Date,
      vendorName: row.VendorName, vendorContact: row.VendorContact,
      category: row.Category, wing: row.Wing, description: row.Description,
      invoiceNo: row.InvoiceNo, invoiceDate: row.InvoiceDate,
      amount: row.Amount, gst: row.GST, total: row.Total,
      paymentMode: row.PaymentMode, chequeUTR: row.ChequeUTR,
      status: row.Status, remarks: row.Remarks,
      invoiceLink: row.InvoiceLink, paymentProofLink: row.PaymentProofLink,
      vendorSigLink: row.VendorSigLink, treasurerSigLink: row.TreasurerSigLink,
      pdfLink: row.PDFLink, createdBy: row.CreatedBy, createdAt: row.CreatedAt,
      submittedAt: row.SubmittedAt,
      treasurerVerifiedBy: row.TreasurerVerifiedBy, treasurerVerifiedAt: row.TreasurerVerifiedAt,
      chairmanApprovedBy: row.ChairmanApprovedBy, chairmanApprovedAt: row.ChairmanApprovedAt,
      completedAt: row.CompletedAt,
    }
  }

  function getDashboardStats() {
    const rows = SheetsService.getAllRows(SheetsService.SHEET_NAMES.VOUCHER_MASTER)
    const now  = new Date()
    const thisMonth = now.getMonth()
    const thisYear  = now.getFullYear()

    const total   = rows.length
    const pending = rows.filter(r => ['Submitted','Treasurer Verified'].includes(r.Status)).length
    const monthly = rows
      .filter(r => {
        const d = new Date(r.Date)
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear
      })
      .reduce((s, r) => s + (parseFloat(r.Total) || 0), 0)
    const yearly = rows.reduce((s, r) => s + (parseFloat(r.Total) || 0), 0)

    const byCategory = {}
    const byMonth    = {}
    const byVendor   = {}

    rows.forEach(r => {
      const amt = parseFloat(r.Total) || 0
      byCategory[r.Category] = (byCategory[r.Category] || 0) + amt

      const monthLabel = new Date(r.Date).toLocaleString('en-IN', { month: 'short' })
      byMonth[monthLabel] = (byMonth[monthLabel] || 0) + amt

      byVendor[r.VendorName] = (byVendor[r.VendorName] || 0) + amt
    })

    return {
      total, pending, monthly, yearly,
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
      byMonth:    Object.entries(byMonth).map(([month, amount]) => ({ month, amount })),
      byVendor:   Object.entries(byVendor)
        .sort((a,b) => b[1]-a[1]).slice(0,6)
        .map(([name, amount]) => ({ name, amount })),
      recent: rows.slice(-5).reverse().map(r => ({
        id: r.VoucherID, voucherNumber: r.VoucherNumber,
        vendorName: r.VendorName, total: r.Total,
        status: r.Status, date: r.Date
      })),
    }
  }

  function logAudit(email, action, module_, details) {
    try {
      const row = {
        LogID:     'AU-' + Date.now(),
        UserEmail: email || 'system',
        Action:    action,
        Module:    module_,
        Details:   details,
        Timestamp: new Date().toISOString(),
      }
      SheetsService.appendRow(SheetsService.SHEET_NAMES.AUDIT_LOG, row,
        ['LogID','UserEmail','Action','Module','Details','Timestamp'])
    } catch (_) { /* silent */ }
  }

  return { createVoucher, updateVoucher, approveVoucher, getVouchers, getVoucherById, getDashboardStats, generateVoucherNumber }
})()
