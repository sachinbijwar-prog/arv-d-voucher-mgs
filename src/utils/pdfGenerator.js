import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency, formatDate, formatDateTime, STATUS_CONFIG } from './formatters'

const SOCIETY_NAME  = 'ARV ROYALE D WING CHS'
const SOCIETY_SUB   = 'Registered Co-operative Housing Society'
const SOCIETY_ADDR  = 'Mumbai, Maharashtra, India'

export async function generateVoucherPDF(voucher) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  let y = 0

  // ── Header band ───────────────────────────────────────────
  doc.setFillColor(30, 64, 175)          // primary-800
  doc.rect(0, 0, W, 38, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(SOCIETY_NAME, W / 2, 14, { align: 'center' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(SOCIETY_SUB, W / 2, 20, { align: 'center' })
  doc.text(SOCIETY_ADDR, W / 2, 25, { align: 'center' })

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT VOUCHER', W / 2, 34, { align: 'center' })

  y = 46

  // ── Voucher meta row ──────────────────────────────────────
  doc.setTextColor(0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Voucher No: ${voucher.voucherNumber}`, 14, y)
  const status = STATUS_CONFIG[voucher.status]?.label || voucher.status
  doc.setFont('helvetica', 'normal')
  doc.text(`Date: ${formatDate(voucher.date)}`, W - 14, y, { align: 'right' })
  y += 5
  doc.text(`Status: ${status}`, 14, y)
  y += 8

  // ── Divider ───────────────────────────────────────────────
  doc.setDrawColor(200)
  doc.line(14, y, W - 14, y)
  y += 6

  // ── Vendor & work details table ───────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Field', 'Details']],
    body: [
      ['Vendor Name',      voucher.vendorName],
      ['Vendor Contact',   voucher.vendorContact || '—'],
      ['Expense Category', voucher.category],
      ['Wing / Area',      voucher.wing || '—'],
      ['Work Description', voucher.description],
    ],
    headStyles:  { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles:  { fontSize: 9 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
    theme: 'grid',
  })

  y = doc.lastAutoTable.finalY + 6

  // ── Invoice & payment table ───────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Invoice Details', '', 'Payment Details', '']],
    body: [
      ['Invoice No.',   voucher.invoiceNo || '—',   'Payment Mode', voucher.paymentMode || '—'],
      ['Invoice Date',  formatDate(voucher.invoiceDate), 'Cheque / UTR', voucher.chequeUTR || '—'],
    ],
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    theme: 'grid',
  })

  y = doc.lastAutoTable.finalY + 6

  // ── Amount summary ────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Amount Breakdown', 'Value (₹)']],
    body: [
      ['Base Amount',   formatCurrency(voucher.amount)],
      ['GST Amount',    formatCurrency(voucher.gst)],
      ['TOTAL AMOUNT',  formatCurrency(voucher.total)],
    ],
    headStyles:  { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles:  { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' } },
    willDrawCell(data) {
      if (data.row.index === 2 && data.section === 'body') {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fontSize  = 11
        data.cell.styles.fillColor = [236, 253, 245]
      }
    },
    theme: 'grid',
  })

  y = doc.lastAutoTable.finalY + 10

  // ── Remarks ───────────────────────────────────────────────
  if (voucher.remarks) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Remarks:', 14, y)
    doc.setFont('helvetica', 'normal')
    doc.text(voucher.remarks, 14, y + 5, { maxWidth: W - 28 })
    y += 16
  }

  // ── Approval Timeline ─────────────────────────────────────
  const timeline = []
  if (voucher.submittedAt)
    timeline.push(['Submitted',         voucher.createdBy || '',   formatDateTime(voucher.submittedAt)])
  if (voucher.treasurerVerifiedAt)
    timeline.push(['Treasurer Verified', voucher.treasurerVerifiedBy || '', formatDateTime(voucher.treasurerVerifiedAt)])
  if (voucher.chairmanApprovedAt)
    timeline.push(['Chairman Approved', voucher.chairmanApprovedBy || '', formatDateTime(voucher.chairmanApprovedAt)])
  if (voucher.completedAt)
    timeline.push(['Payment Completed', '',                        formatDateTime(voucher.completedAt)])

  if (timeline.length) {
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['Approval Stage', 'By', 'Timestamp']],
      body: timeline,
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      theme: 'grid',
    })
    y = doc.lastAutoTable.finalY + 10
  }

  // ── Signature boxes ───────────────────────────────────────
  const sigW = (W - 42) / 3
  const sigY = y
  const sigH = 28

  ;['Vendor / Contractor', 'Treasurer', 'Chairman'].forEach((label, i) => {
    const x = 14 + i * (sigW + 7)
    doc.setDrawColor(180)
    doc.rect(x, sigY, sigW, sigH)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120)
    doc.text(label, x + sigW / 2, sigY + sigH - 4, { align: 'center' })
    doc.text('Signature & Date', x + sigW / 2, sigY + sigH - 0.5, { align: 'center' })
  })

  y = sigY + sigH + 10

  // ── Footer ────────────────────────────────────────────────
  doc.setDrawColor(200)
  doc.line(14, y, W - 14, y)
  y += 4
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150)
  doc.text(
    `Generated by SDVMS · ARV ROYALE D WING CHS · ${formatDateTime(new Date().toISOString())} · ${voucher.voucherNumber}.pdf`,
    W / 2, y, { align: 'center' }
  )

  // ── Page numbers ──────────────────────────────────────────
  const pages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(180)
    doc.text(`Page ${i} of ${pages}`, W - 14, doc.internal.pageSize.getHeight() - 6, { align: 'right' })
  }

  // ── Save ──────────────────────────────────────────────────
  doc.save(`${voucher.voucherNumber}.pdf`)
  return doc.output('datauristring')
}
