import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { FileDown, Table } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { voucherService } from '../services/voucherService'
import { formatCurrency, formatDate } from '../utils/formatters'
import { generateVoucherPDF } from '../utils/pdfGenerator'
import * as XLSX from 'xlsx'

const REPORT_TYPES = [
  { id: 'monthly',   label: 'Monthly Expense Summary' },
  { id: 'vendor',    label: 'Vendor Ledger' },
  { id: 'category',  label: 'Category-wise Expense' },
  { id: 'pending',   label: 'Pending Approvals' },
  { id: 'annual',    label: 'Annual Expense Summary' },
]

const COLORS = ['#3b82f6','#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

export default function ReportsPage() {
  const [reportType, setReportType] = useState('monthly')
  const [dateFrom,   setDateFrom]   = useState('')
  const [dateTo,     setDateTo]     = useState('')

  const { data: stats, loading } = useFetch(() => voucherService.getDashboardStats(), [])
  const { data: all }            = useFetch(() => voucherService.getAll(), [])

  const vouchers = all?.vouchers || all || []

  // Build report data
  function getReportData() {
    switch (reportType) {
      case 'monthly':   return stats?.byMonth || []
      case 'vendor':    return stats?.byVendor || []
      case 'category':  return stats?.byCategory || []
      case 'pending':
        return vouchers.filter(v => ['Draft','Submitted','Treasurer Verified'].includes(v.status))
      case 'annual':
        return stats?.byMonth || []
      default: return []
    }
  }

  function exportExcel() {
    const data = getReportData()
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, reportType)
    XLSX.writeFile(wb, `SDVMS_${reportType}_report.xlsx`)
  }

  const reportData = getReportData()
  const isTable = ['pending'].includes(reportType)
  const isBar   = ['monthly', 'vendor', 'annual'].includes(reportType)
  const isPie   = reportType === 'category'

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Reports</h2>
        <p className="text-sm text-gray-500">Generate and export financial reports</p>
      </div>

      {/* Controls */}
      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="form-label">Report Type</label>
          <select id="report-type" className="form-select" value={reportType} onChange={e => setReportType(e.target.value)}>
            {REPORT_TYPES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">From Date</label>
          <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="form-label">To Date</label>
          <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <button id="btn-export-excel" onClick={exportExcel} className="btn-secondary flex items-center gap-2">
          <FileDown size={16} /> Excel
        </button>
      </div>

      {/* Report visualization */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner w-8 h-8" /></div>
      ) : (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-700 mb-4">
            {REPORT_TYPES.find(r => r.id === reportType)?.label}
          </h3>

          {isBar && reportData.length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={reportData}>
                <XAxis dataKey={reportType === 'vendor' ? 'name' : 'month'} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => formatCurrency(v)} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {isPie && reportData.length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={reportData} cx="50%" cy="50%" outerRadius={110} dataKey="value" label={e => e.name}>
                  {reportData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}

          {isTable && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Voucher No.</th>
                    <th>Vendor</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">No data found</td></tr>
                  ) : reportData.map(v => (
                    <tr key={v.id}>
                      <td className="font-mono text-xs font-bold text-primary-700">{v.voucherNumber}</td>
                      <td>{v.vendorName}</td>
                      <td>{v.category}</td>
                      <td className="font-semibold">{formatCurrency(v.total)}</td>
                      <td>{v.status}</td>
                      <td className="text-gray-500 text-xs">{formatDate(v.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary footer */}
          {!isTable && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-6">
              <div>
                <p className="text-xs text-gray-400">Total Records</p>
                <p className="font-bold text-gray-800">{reportData.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Amount</p>
                <p className="font-bold text-primary-700">
                  {formatCurrency(reportData.reduce((s, r) => s + (r.amount || r.value || 0), 0))}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
