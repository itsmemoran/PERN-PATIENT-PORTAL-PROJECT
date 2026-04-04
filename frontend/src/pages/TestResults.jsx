import { useState, useEffect } from 'react'
import api from '@/lib/api'
import {
  FlaskConical, TrendingUp, TrendingDown, Minus,
  CheckCircle, AlertCircle, Eye, BarChart3
} from 'lucide-react'

const statusConfig = {
  normal: { label: 'Normal', class: 'badge-green' },
  attention: { label: 'À surveiller', class: 'badge-yellow' },
  abnormal: { label: 'Anormal', class: 'badge-red' },
}

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-red-500" />
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-blue-500" />
  return <Minus className="w-4 h-4 text-gray-400" />
}

export default function TestResults() {
  const [results, setResults] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/test-results'), api.get('/test-results/summary')])
      .then(([res, sum]) => { setResults(res.data.data); setSummary(sum.data.data) })
      .catch(() => setError('Impossible de charger les résultats.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin-slow" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">Mes Résultats</h1>
        <p className="text-sm text-gray-500 mt-1">Historique de vos examens ophtalmologiques</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: results.length, label: 'Total examens', icon: FlaskConical, color: 'text-primary bg-primary-50' },
            { value: summary.normal, label: 'Normaux', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
            { value: summary.attention, label: 'À surveiller', icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
            { value: summary.lastVisit ? new Date(summary.lastVisit).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—', label: 'Dernier examen', icon: BarChart3, color: 'text-secondary bg-secondary-50' },
          ].map(({ value, label, icon: Icon, color }, i) => (
            <div key={i} className="card p-5">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold font-display text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Results list */}
      {results.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">
          Aucun résultat d'examen disponible.
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(r => {
            const cfg = statusConfig[r.status] || statusConfig.normal
            let parsed = r.results
            if (typeof parsed === 'string') {
              try { parsed = JSON.parse(parsed) } catch { parsed = null }
            }

            return (
              <div key={r.id} className="card overflow-hidden">
                <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{r.testName || r.test_name}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}{r.doctor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendIcon trend={r.trend} />
                    <span className={`badge ${cfg.class}`}>{cfg.label}</span>
                  </div>
                </div>

                {parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0 && (
                  <div className="px-6 pb-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {Object.entries(parsed).map(([k, v]) => (
                        <div key={k} className="p-3 rounded-lg bg-surface-200/60">
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
                            {k.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm font-medium text-gray-800">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {r.notes && (
                  <div className="px-6 pb-5 pt-2">
                    <p className="text-sm text-gray-500 italic">{r.notes}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
