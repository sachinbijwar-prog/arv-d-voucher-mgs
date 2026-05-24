import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ShieldCheck, CheckCircle, BarChart2, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const FEATURES = [
  { icon: CheckCircle, text: 'Multi-step voucher creation with auto-numbering' },
  { icon: ShieldCheck, text: 'Role-based access: Treasurer, Chairman, Secretary, Auditor' },
  { icon: BarChart2,   text: 'Dashboard analytics & PDF/Excel reports' },
  { icon: Lock,        text: 'Digital signatures & full approval workflow' },
]

export default function LoginPage() {
  const { login }       = useAuth()
  const navigate        = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (!username.trim()) { toast.error('Please enter your username'); return }
    if (!password) { toast.error('Please enter your password'); return }

    const res = login(username.trim(), password)
    if (res.success) {
      toast.success(`Welcome back!`)
      navigate('/', { replace: true })
    } else {
      toast.error(res.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full" />
      </div>

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">

        {/* ── Left — Branding ── */}
        <div className="text-white space-y-6 animate-slide-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ARV ROYALE D WING CHS</h1>
              <p className="text-primary-200 text-sm font-medium">Digital Voucher System</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Streamline your society<br/>expenses & approvals
            </h2>
            <p className="text-primary-100 text-lg max-w-md">
              A secure, paperless platform for managing vendor payments, digital approvals, and financial records.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                <f.icon className="text-primary-300 mt-0.5 shrink-0" size={18} />
                <p className="text-sm text-primary-50 leading-snug">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right — Login Box ── */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-fade-in relative z-10 border border-gray-100">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Sign in</h3>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                autoFocus
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                placeholder="e.g. sachin, alhad, akshay"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-primary-100"
            >
              Sign In to SDVMS
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500 border border-gray-100">
            <p className="font-semibold text-gray-700 mb-1">Demo Credentials:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>alhad (Treasurer) / password123</li>
              <li>sachin (Chairman) / password123</li>
              <li>nazzar (Secretary) / password123</li>
              <li>akshay (Manager) / password123</li>
              <li>committee (Read-Only) / password123</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
