import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`nav-drawer lg:static lg:translate-x-0 lg:flex lg:flex-col lg:w-64 lg:shadow-none lg:border-r lg:border-gray-200 ${sidebarOpen ? 'open' : 'closed'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
