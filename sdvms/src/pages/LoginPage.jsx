import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ShieldCheck, CheckCircle, BarChart2, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ROLES_CONFIG = [
  {
    role:    'treasurer',
    label:   'Treasurer',
    desc:    'Create & verify vouchers, manage payments',
    color:   'border-blue-300 bg-blue-50 hover:bg-blue-100',
    badge:   'bg-blue-100 text-blue-800',
    icon:    '💼',
  },
  {
    role:    'manager',
    label:   'Manager / Admin',
    desc:    'Full access except chairman approval',
    color:   'border-indigo-300 bg-indigo-50 hover:bg-indigo-100',
    badge:   'bg-indigo-100 text-indigo-800',
    icon:    '🛠️',
  },
  {
    role:    'chairman',
    label:   'Chairman',
    desc:    'Final approvals & system settings',
    color:   'border-green-300 bg-green-50 hover:bg-green-100',
    badge:   'bg-green-100 text-green-800',
    icon:    '👑',
  },
  {
    role:    'auditor',
    label:   'Auditor',
    desc:    'Read-only access & exports',
    color:   'border-amber-300 bg-amber-50 hover:bg-amber-100',
    badge:   'bg-amber-100 text-amber-800',
    icon:    '🔍',
  },
  {
    role:    'committee',
    label:   'Committee Member',
    desc:    'View approved vouchers only',
    color:   'border-gray-300 bg-gray-50 hover:bg-gray-100',
    badge:   'bg-gray-100 text-gray-700',
    icon:    '👥',
  },
]

const FEATURES = [
  { icon: CheckCircle, text: 'Multi-step voucher creation with auto-numbering' },
  { icon: ShieldCheck, text: 'Role-based access: Treasurer, Chairman, Auditor' },
  { icon: BarChart2,   text: 'Dashboard analytics & PDF/Excel reports' },
  { icon: Lock,        text: 'Digital signatures & full approval workflow' },
]

export default function LoginPage() {
  const { login }       = useAuth()
  const navigate        = useNavigate()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [selected, setSelected] = useState('')
  const [step,     setStep]     = useState(1) // 1 = pick role, 2 = enter name

  function handleRoleSelect(role) {
    setSelected(role)
    setStep(2)
  }

  function handleLogin(e) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Please enter your name'); return }
    if (!selected)    { toast.error('Please select a role');   return }

    const userData = {
      id:      Date.now().toString(),
      name:    name.trim(),
      email:   email.trim() || `${selected}@arvroyale.com`,
      picture: null,
    }
    login(userData, selected)
    toast.success(`Welcome, ${userData.name}!`)
    navigate('/', { replace: true })
  }

  const selectedConfig = ROLES_CONFIG.find(r => r.role === selected)

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
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Building2 size={28} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-200">
                Society Digital Voucher
              </p>
              <p className="text-xs text-primary-300">Management System</p>
            </div>
          </div>

          <div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              ARV ROYALE<br />
              <span className="text-primary-200">D WING CHS</span>
            </h1>
            <p className="mt-3 text-primary-200 text-lg">
              Transparent · Paperless · Audit-Ready
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-primary-100">
                <f.icon size={16} className="text-primary-300 flex-shrink-0" />
                <span className="text-sm">{f.text}</span>
              </li>
            ))}
          </ul>

          <p className="text-primary-400 text-xs">
            FY {new Date().getFullYear()}–{String(new Date().getFullYear() + 1).slice(2)} · Vendor Payment Vouchers
          </p>
        </div>

        {/* ── Right — Login card ── */}
        <div className="card p-6 shadow-2xl animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
              <Building2 size={28} className="text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Sign In</h2>
            <p className="text-gray-500 text-sm mt-1">
              {step === 1 ? 'Select your role to continue' : 'Enter your details'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-5">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${s <= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {s}
                </div>
                <span className={`text-xs font-medium ${s === step ? 'text-primary-700' : 'text-gray-400'}`}>
                  {s === 1 ? 'Select Role' : 'Your Details'}
                </span>
                {s < 2 && <div className={`flex-1 h-px ${step > 1 ? 'bg-primary-300' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* ── Step 1: Role Selector ── */}
          {step === 1 && (
            <div className="space-y-2">
              {ROLES_CONFIG.map(r => (
                <button
                  key={r.role}
                  id={`role-${r.role}`}
                  onClick={() => handleRoleSelect(r.role)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-150 text-left ${r.color}`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{r.label}</p>
                    <p className="text-xs text-gray-500">{r.desc}</p>
                  </div>
                  <span className="text-xs text-gray-400">→</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Step 2: Name & Email ── */}
          {step === 2 && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Selected role display */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border-2 ${selectedConfig?.color}`}>
                <span className="text-2xl">{selectedConfig?.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{selectedConfig?.label}</p>
                  <p className="text-xs text-gray-500">{selectedConfig?.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-primary-600 underline"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="form-label">Your Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="login-name"
                    type="text"
                    className="form-input pl-9"
                    placeholder="e.g. Ramesh Sharma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Email (optional)</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="e.g. ramesh@arvroyale.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <p className="form-hint">Leave blank to use default role email</p>
              </div>

              <button
                id="btn-login"
                type="submit"
                className="btn-primary w-full text-base py-3"
              >
                Enter SDVMS →
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-5">
            ARV ROYALE D WING CHS · SDVMS v1.0
          </p>
        </div>
      </div>
    </div>
  )
}
