import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import {
  Calendar, FileText, Pill, Bot, ArrowRight,
  CheckCircle, AlertCircle, Clock, TrendingUp
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const firstName = user?.firstName || user?.first_name || 'Utilisateur'

  useEffect(() => {
    api.get('/dashboard')
      .then(({ data: res }) => setData(res.data))
      .catch(() => setError('Impossible de charger le tableau de bord.'))
      .finally(() => setLoading(false))
  }, [])

  const quickActions = [
    { icon: Calendar, label: 'Prendre RDV', to: '/appointments', color: 'from-primary to-primary-600' },
    { icon: FileText, label: 'Mes résultats', to: '/test-results', color: 'from-accent to-accent-600' },
    { icon: Pill, label: 'Ordonnances', to: '/prescriptions', color: 'from-secondary to-secondary-600' },
    { icon: Bot, label: 'Assistant IA', to: '/chatbot', color: 'from-emerald-500 to-emerald-600' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-600 to-secondary p-6 lg:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <p className="text-primary-100 text-sm font-medium mb-1">Portail Patient</p>
          <h1 className="text-2xl lg:text-3xl font-bold font-display mb-2">
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-white/70 max-w-lg">
            Voici un aperçu de votre dossier médical. Consultez vos rendez-vous, résultats et ordonnances.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map(({ icon: Icon, label, to, color }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="card p-5 flex flex-col items-center gap-3 hover:shadow-elevated transition-all duration-200 group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center
              group-hover:scale-110 transition-transform duration-200`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin-slow" />
        </div>
      ) : data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming appointments */}
          <div className="card">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-base font-semibold font-display text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Prochains rendez-vous
              </h2>
              <button onClick={() => navigate('/appointments')} className="text-xs text-primary hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="px-6 pb-5 space-y-3">
              {data.upcomingAppointments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Aucun rendez-vous à venir</p>
              ) : (
                data.upcomingAppointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-200/60 hover:bg-surface-300/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{a.type}</p>
                        <p className="text-xs text-gray-500">{a.doctor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-gray-400">{a.time?.slice(0, 5)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent results */}
          <div className="card">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-base font-semibold font-display text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Résultats récents
              </h2>
              <button onClick={() => navigate('/test-results')} className="text-xs text-primary hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="px-6 pb-5 space-y-3">
              {data.recentResults.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Aucun résultat disponible</p>
              ) : (
                data.recentResults.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-200/60">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.test_name}</p>
                      <p className="text-xs text-gray-500">{r.doctor}</p>
                    </div>
                    <span className={`badge ${r.status === 'normal' ? 'badge-green' : 'badge-yellow'}`}>
                      {r.status === 'normal' ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Normal</>
                      ) : (
                        <><AlertCircle className="w-3 h-3 mr-1" /> À surveiller</>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active prescriptions — full width */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-base font-semibold font-display text-gray-800 flex items-center gap-2">
                <Pill className="w-5 h-5 text-secondary" />
                Ordonnances actives
              </h2>
              <button onClick={() => navigate('/prescriptions')} className="text-xs text-primary hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="px-6 pb-5">
              {data.activePrescriptions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Aucune ordonnance active</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.activePrescriptions.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-gray-800">{p.medication}</p>
                        <span className="badge badge-green">Active</span>
                      </div>
                      <p className="text-xs text-gray-500">{p.dosage}</p>
                      {p.expiry_date && (
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expire le {new Date(p.expiry_date).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
