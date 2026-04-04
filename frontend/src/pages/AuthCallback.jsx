import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

/**
 * AuthCallback — Google OAuth landing page.
 *
 * After the user authenticates with Google, the backend redirects to:
 *   http://localhost:5173/auth/callback?accessToken=...&refreshToken=...
 *
 * This page:
 *  1. Reads accessToken + refreshToken from the URL query string
 *  2. Stores them in localStorage
 *  3. Fetches /api/auth/me to get the user profile
 *  4. Redirects to the dashboard
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [status, setStatus] = useState('Connexion en cours...')

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    if (!accessToken || !refreshToken) {
      setStatus('Échec de la connexion Google. Redirection...')
      setTimeout(() => navigate('/login?error=oauth_failed'), 2000)
      return
    }

    // Store tokens
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    // Fetch user profile
    api.get('/auth/me')
      .then(({ data }) => {
        const user = data.data
        localStorage.setItem('user', JSON.stringify(user))
        updateUser(user)
        navigate('/', { replace: true })
      })
      .catch(() => {
        // Even if /me fails, tokens are stored — redirect anyway
        navigate('/', { replace: true })
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-200">
      <div className="card p-8 text-center space-y-4 max-w-sm">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin-slow mx-auto" />
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  )
}
