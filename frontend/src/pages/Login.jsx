import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return }
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary via-secondary to-accent relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 px-12 text-white max-w-md">
          <img className= 'w-25 h-20 rounded- bg- backdrop-blur-sm flex items-center justify-center mb-8' src="/assets/logodananwhite.png" alt="logo" />
          {/* <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
            <span className="text-3xl font-bold font-display">D</span>
          </div> */}
          <h1 className="text-4xl font-bold font-display leading-tight mb-4">
            Centre Medical<br />Danan
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Votre portail patient sécurisé. Gérez vos rendez-vous, consultez vos résultats
            et accédez à votre dossier médical en toute simplicité.
          </p>
          <div className="mt-10 flex gap-6 text-sm text-white/60">
            <div><p className="text-2xl font-bold text-white">3</p><p>Médecins</p></div>
            <div><p className="text-2xl font-bold text-white">24/7</p><p>Assistant IA</p></div>
            <div><p className="text-2xl font-bold text-white">100%</p><p>Sécurisé</p></div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface-200">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img className= 'w-22 h-12 flex items-center justify-center' src="/assets/logo-danan-500x500.png" alt="logo" />
            <div>
              <p className="font-semibold font-display text-gray-500">Centre Medical Danan</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold font-display text-gray-900 mb-1">
            Bienvenue
          </h2>
          <p className="text-gray-500 mb-8">Connectez-vous à votre espace patient</p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="vous@exemple.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Se connecter <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <span className="flex-1 h-px bg-gray-200" />
            <span className="mx-3 text-sm text-gray-400">ou</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => {
              window.location.href = import.meta.env.VITE_API_URL
                ? `${import.meta.env.VITE_API_URL}/api/auth/google`
                : '/api/auth/google'
            }}
            className="btn-secondary w-full"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.9 0 7.1 1.3 9.4 3.1l7-7C37.2 2 30.2 0 24 0 14.9 0 6.9 4.6 2.8 11.4l8.8 6.8C13.8 13 18.4 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.6H24v9.1h12.7c-.5 2.8-2.1 5.1-4.4 6.6l6.9 5.2C44.6 37.7 46.5 31.5 46.5 24.5z"/>
              <path fill="#FBBC05" d="M10.6 28.2a14.5 14.5 0 010-8.4L2 13.1A24 24 0 000 24c0 3.9.9 7.6 2.5 11l8.1-6.8z"/>
              <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.4l-7.4-5.6C30.9 37.7 27.7 38.9 24 38.9 18.4 38.9 13.8 35.4 11.6 30.8l-8.8 6.8C6.9 43.4 14.9 48 24 48z"/>
            </svg>
            Continuer avec Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-8">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Créer un compte
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-6 p-4 rounded-xl bg-primary-50 border border-primary-100 text-sm">
            <p className="font-medium text-primary-700 mb-1">Compte démo</p>
            <p className="text-primary-600">
              Email: <code className="bg-primary-100 px-1.5 py-0.5 rounded">test@demo.com</code><br />
              Mot de passe: <code className="bg-primary-100 px-1.5 py-0.5 rounded">Test1234</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
