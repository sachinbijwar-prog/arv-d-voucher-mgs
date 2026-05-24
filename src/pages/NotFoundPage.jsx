import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="card p-12 text-center max-w-md">
        <div className="text-8xl mb-4">404</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={16} /> Go Back
          </button>
          <button onClick={() => navigate('/')} className="btn-primary flex items-center gap-2">
            <Home size={16} /> Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
