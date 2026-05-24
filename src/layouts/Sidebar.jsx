import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FileText, PlusCircle, CheckSquare,
  BarChart2, Users, Settings, X, Building2, LogOut, ShieldCheck
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',      to: '/',          icon: LayoutDashboard, exact: true },
  { label: 'Vouchers',       to: '/vouchers',  icon: FileText },
  { label: 'Create Voucher', to: '/vouchers/create', icon: PlusCircle, permission: 'CREATE_VOUCHER' },
  { label: 'Approvals',      to: '/approvals', icon: CheckSquare, permission: 'CHAIRMAN_APPROVE' },
  { label: 'Reports',        to: '/reports',   icon: BarChart2,   permission: 'EXPORT_REPORTS' },
  { label: 'Vendors',        to: '/vendors',   icon: Users },
  { label: 'Settings',       to: '/settings',  icon: Settings,    permission: 'ADMIN_SETTINGS' },
]

const ROLE_LABELS = {
  treasurer: 'Treasurer',
  manager:   'Manager / Admin',
  chairman:  'Chairman',
  auditor:   'Auditor',
  committee: 'Committee Member',
}

export default function Sidebar({ onClose }) {
  const { user, role, logout, hasPermission } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const visibleItems = navItems.filter(item =>
    !item.permission || hasPermission(item.permission)
  )

  return (
    <div className="flex flex-col h-full">
      {/* Logo / Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
            <Building2 size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-primary-700 leading-tight uppercase tracking-wide">
              ARV ROYALE
            </p>
            <p className="text-[10px] text-gray-400 font-medium">D Wing CHS · SDVMS</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-2 pb-1">
          Navigation
        </p>
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={18} className="flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
          {user?.picture
            ? <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full flex-shrink-0" />
            : (
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 font-semibold text-sm">
                  {user?.name?.charAt(0) || '?'}
                </span>
              </div>
            )
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <div className="flex items-center gap-1">
              <ShieldCheck size={10} className="text-primary-500" />
              <p className="text-[11px] text-gray-500 truncate">{ROLE_LABELS[role] || role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
