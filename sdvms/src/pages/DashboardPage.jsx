import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { FileText, Clock, TrendingUp, IndianRupee, Plus, Eye } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { voucherService } from '../services/voucherService'
import { formatCurrency, formatDate, STATUS_CONFIG } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

const PIE_COLORS = ['#3b82f6','#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899']

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="stat-card animate-fade-in">
      <div className={`stat-icon ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const { data: stats, loading } = useFetch(() => voucherService.getDashboardStats())

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner w-8 h-8" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-500">Overview of ARV ROYALE D WING CHS vouchers</p>
        </div>
        {hasPermission('CREATE_VOUCHER') && (
          <button
            id="btn-create-voucher"
            onClick={() => navigate('/vouchers/create')}
            className="btn-primary"
          >
            <Plus size={16} />
            New Voucher
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total Vouchers"
          value={stats?.total ?? 0}
          sub="All time"
          color="bg-primary-500"
        />
        <StatCard
          icon={Clock}
          label="Pending Approvals"
          value={stats?.pending ?? 0}
          sub="Awaiting action"
          color="bg-amber-500"
        />
        <StatCard
          icon={IndianRupee}
          label="Monthly Expense"
          value={formatCurrency(stats?.monthly ?? 0)}
          sub="This month"
          color="bg-indigo-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Year-to-Date"
          value={formatCurrency(stats?.yearly ?? 0)}
          sub="Current FY"
          color="bg-green-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Monthly bar chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Expense Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.byMonth || []}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => formatCurrency(v)} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats?.byCategory || []}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                paddingAngle={3} dataKey="value"
              >
                {(stats?.byCategory || []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend iconSize={10} iconType="circle" formatter={v => <span className="text-xs">{v}</span>} />
              <Tooltip formatter={v => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor bar chart + Recent Vouchers */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Vendor bar chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Vendors by Spend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.byVendor || []} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={v => formatCurrency(v)} />
              <Bar dataKey="amount" fill="#6366f1" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent vouchers table */}
        <div className="card lg:col-span-2">
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Recent Vouchers</h3>
            <button
              onClick={() => navigate('/vouchers')}
              className="btn-ghost btn-sm flex items-center gap-1"
            >
              <Eye size={14} /> View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Voucher No.</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recent || []).map(v => (
                  <tr
                    key={v.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/vouchers/${v.id}`)}
                  >
                    <td className="font-mono text-xs font-semibold text-primary-700">{v.voucherNumber}</td>
                    <td className="font-medium">{v.vendorName}</td>
                    <td className="font-semibold">{formatCurrency(v.total)}</td>
                    <td>
                      <span className={STATUS_CONFIG[v.status]?.class || 'badge-draft'}>
                        {STATUS_CONFIG[v.status]?.label || v.status}
                      </span>
                    </td>
                    <td className="text-gray-500">{formatDate(v.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
