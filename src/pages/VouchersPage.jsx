import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { voucherService, categoryService } from '../services/voucherService'
import { useFetch } from '../hooks/useFetch'
import { formatCurrency, formatDate, STATUS_CONFIG, VOUCHER_STATUSES, PAYMENT_MODES } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'
import { generateVoucherPDF } from '../utils/pdfGenerator'

const PAGE_SIZE = 15

export default function VouchersPage() {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()

  const [search,   setSearch]   = useState('')
  const [filters,  setFilters]  = useState({ status: '', category: '', paymentMode: '', dateFrom: '', dateTo: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [page,     setPage]     = useState(1)
  const [vouchers, setVouchers] = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)

  const { data: categories } = useFetch(() => categoryService.getAll(), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    voucherService.getAll({ search, ...filters })
      .then(res => {
        if (!cancelled) {
          setVouchers(res.vouchers || res)
          setTotal(res.total || (res.vouchers || res).length)
        }
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [search, filters])

  const paginated = vouchers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function handleFilter(key, val) {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }

  async function handleDownloadPDF(e, voucher) {
    e.stopPropagation()
    try {
      await generateVoucherPDF(voucher)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Vouchers</h2>
          <p className="text-sm text-gray-500">{total} voucher{total !== 1 ? 's' : ''} found</p>
        </div>
        {hasPermission('CREATE_VOUCHER') && (
          <button
            id="btn-new-voucher"
            onClick={() => navigate('/vouchers/create')}
            className="btn-primary"
          >
            <Plus size={16} />
            New Voucher
          </button>
        )}
      </div>

      {/* Search & Filter bar */}
      <div className="card p-3 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="voucher-search"
            type="text"
            placeholder="Search by voucher number, vendor, description…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="form-input pl-9"
          />
        </div>
        <button
          id="btn-toggle-filters"
          onClick={() => setShowFilters(f => !f)}
          className={`btn-secondary ${showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : ''}`}
        >
          <Filter size={15} />
          Filters
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="card p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 animate-fade-in">
          <div>
            <label className="form-label">Status</label>
            <select className="form-select" value={filters.status} onChange={e => handleFilter('status', e.target.value)}>
              <option value="">All Statuses</option>
              {VOUCHER_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Category</label>
            <select className="form-select" value={filters.category} onChange={e => handleFilter('category', e.target.value)}>
              <option value="">All Categories</option>
              {(categories || []).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Payment Mode</label>
            <select className="form-select" value={filters.paymentMode} onChange={e => handleFilter('paymentMode', e.target.value)}>
              <option value="">All Modes</option>
              {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">From Date</label>
            <input type="date" className="form-input" value={filters.dateFrom} onChange={e => handleFilter('dateFrom', e.target.value)} />
          </div>
          <div>
            <label className="form-label">To Date</label>
            <input type="date" className="form-input" value={filters.dateTo} onChange={e => handleFilter('dateTo', e.target.value)} />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Voucher No.</th>
              <th>Date</th>
              <th>Vendor</th>
              <th>Category</th>
              <th>Total Amount</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12">
                <div className="spinner w-6 h-6 mx-auto" />
              </td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">
                No vouchers found. {hasPermission('CREATE_VOUCHER') && (
                  <button onClick={() => navigate('/vouchers/create')} className="text-primary-600 underline ml-1">
                    Create one?
                  </button>
                )}
              </td></tr>
            ) : paginated.map(v => (
              <tr key={v.id} className="cursor-pointer" onClick={() => navigate(`/vouchers/${v.id}`)}>
                <td>
                  <span className="font-mono text-xs font-bold text-primary-700">{v.voucherNumber}</span>
                </td>
                <td className="text-gray-500 text-xs">{formatDate(v.date)}</td>
                <td>
                  <p className="font-medium text-gray-800">{v.vendorName}</p>
                  <p className="text-xs text-gray-400">{v.invoiceNo}</p>
                </td>
                <td className="text-gray-600">{v.category}</td>
                <td className="font-semibold text-gray-800">{formatCurrency(v.total)}</td>
                <td className="text-gray-500 text-xs">{v.paymentMode}</td>
                <td>
                  <span className={STATUS_CONFIG[v.status]?.class || 'badge-draft'}>
                    {STATUS_CONFIG[v.status]?.label || v.status}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/vouchers/${v.id}`)}
                      className="btn-ghost btn-sm p-1.5"
                      title="View"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={e => handleDownloadPDF(e, v)}
                      className="btn-ghost btn-sm p-1.5"
                      title="Download PDF"
                    >
                      <Download size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>Showing {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, total)} of {total}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p-1))}
              disabled={page === 1}
              className="btn-secondary btn-sm disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-3 py-1 rounded-lg bg-primary-50 text-primary-700 font-semibold text-xs">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p+1))}
              disabled={page === totalPages}
              className="btn-secondary btn-sm disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
