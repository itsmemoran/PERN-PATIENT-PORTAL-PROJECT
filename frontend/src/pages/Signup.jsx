import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'

export default function Signup() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', password: '', confirm: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { firstName, lastName, email, phone, dateOfBirth, password, confirm } = form

    if (!firstName || !lastName || !email || !dateOfBirth || !password) {
      setError('Veuillez remplir tous les champs obligatoires.'); return
    }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }

    setLoading(true)
    try {
      await signup({ firstName, lastName, email, phone: phone.replace(/\s/g, '') || undefined, dateOfBirth, password })
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.details
        ? err.response.data.details.map(d => d.message).join(' ')
        : err.response?.data?.message || 'Erreur lors de l\'inscription.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface-200">
      <div className="w-full max-w-lg">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour à la connexion
        </Link>

        <div className="card p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white text-lg font-bold font-display">D</span>
            </div>
            <div>
              <p className="font-bold font-display text-gray-900">Centre Medical Danan</p>
              <p className="text-xs text-gray-500">Créer votre compte patient</p>
            </div>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input value={form.firstName} onChange={set('firstName')} className="input-field" placeholder="Moran" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input value={form.lastName} onChange={set('lastName')} className="input-field" placeholder="Demo" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={set('email')} className="input-field" placeholder="vous@exemple.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="tel" value={form.phone} onChange={set('phone')} className="input-field" placeholder="+225..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
                <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password} onChange={set('password')}
                    className="input-field pr-10" placeholder="Min. 8 caractères"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation *</label>
                <input type="password" value={form.confirm} onChange={set('confirm')} className="input-field" placeholder="Répéter" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Créer mon compte <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <span className="flex-1 h-px bg-gray-200" />
            <span className="mx-3 text-sm text-gray-400">ou</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Sign Up */}
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
            S'inscrire avec Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
