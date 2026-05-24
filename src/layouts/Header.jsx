import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, Bell, LogOut } from 'lucide-react'

const BREADCRUMBS = {
  '/':                'Dashboard',
  '/vouchers':        'Vouchers',
  '/vouchers/create': 'Create Voucher',
  '/approvals':       'Approvals',
  '/reports':         'Reports',
  '/vendors':         'Vendors',
  '/settings':        'Settings',
}

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const pathKey = Object.keys(BREADCRUMBS)
    .sort((a, b) => b.length - a.length)
    .find(k => location.pathname.startsWith(k)) || '/'
  const pageTitle = location.pathname.includes('/vouchers/') && location.pathname !== '/vouchers/create'
    ? 'Voucher Details'
    : BREADCRUMBS[pathKey] || 'SDVMS'

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-4">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
        <p className="text-xs text-gray-400 hidden sm:block">
          ARV ROYALE D WING CHS · Society Digital Voucher Management System
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {user?.picture
          ? <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border-2 border-gray-200" />
          : (
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center" title={user?.name}>
              <span className="text-primary-700 font-semibold text-sm">
                {user?.name?.charAt(0) || '?'}
              </span>
            </div>
          )
        }
        
        <button 
          onClick={logout} 
          className="flex items-center gap-1.5 p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors ml-1 border border-transparent hover:border-red-100"
          title="Logout"
        >
          <LogOut size={16} />
          <span className="text-xs font-medium hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  )
}
