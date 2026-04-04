import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-200 px-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <p className="text-[120px] font-bold font-display text-primary-100 leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <span className="text-white text-4xl">👁️</span>
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
          Page introuvable
        </h1>
        <p className="text-gray-500 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn-primary">
            <Home className="w-4 h-4" /> Tableau de bord
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        </div>
      </div>
    </div>
  )
}
