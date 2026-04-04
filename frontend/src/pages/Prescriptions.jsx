import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Pill, RefreshCw, Calendar, User, AlertCircle, X, Clock } from 'lucide-react'

const statusConfig = {
  active: { label: 'Active', class: 'badge-green' },
  expired: { label: 'Expirée', class: 'badge-gray' },
  completed: { label: 'Terminée', class: 'badge-blue' },
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [renewals, setRenewals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [renewing, setRenewing] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    Promise.all([api.get('/prescriptions'), api.get('/prescriptions/renewals')])
      .then(([p, r]) => { setPrescriptions(p.data.data); setRenewals(r.data.data) })
      .catch(() => showToast('Erreur de chargement', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleRenew = async (id) => {
    setRenewing(true)
    try {
      const { data } = await api.post(`/prescriptions/${id}/renew`)
      setRenewals(prev => [data.data, ...prev])
      showToast('Demande de renouvellement envoyée !')
      setSelected(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error')
    } finally { setRenewing(false) }
  }

  const hasPending = (id) => renewals.some(r => r.prescriptionId === id && r.status === 'pending')

  const active = prescriptions.filter(p => p.status === 'active')
  const others = prescriptions.filter(p => p.status !== 'active')

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin-slow" />
    </div>
  )

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-elevated text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">Mes Ordonnances</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez vos médicaments et demandes de renouvellement</p>
      </div>

      {/* Active */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Ordonnances actives</h2>
        {active.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">Aucune ordonnance active.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map(p => (
              <div key={p.id} onClick={() => setSelected(p)}
                className="card p-5 cursor-pointer hover:shadow-elevated hover:border-primary-200 transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                      <Pill className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-medium text-gray-800">{p.medication}</h3>
                  </div>
                  <span className={`badge ${statusConfig[p.status]?.class}`}>
                    {statusConfig[p.status]?.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{p.dosage}</p>
                {p.frequency && <p className="text-xs text-gray-400 mt-1">{p.frequency}</p>}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                  {p.expiryDate && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expire le {new Date(p.expiryDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  {p.prescribedBy && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <User className="w-3 h-3" /> {p.prescribedBy}
                    </p>
                  )}
                </div>
                {hasPending(p.id) && (
                  <div className="flex items-center gap-1 text-amber-600 mt-2">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs">Renouvellement en attente</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Renewals */}
      {renewals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Demandes de renouvellement</h2>
          <div className="space-y-3">
            {renewals.map(r => (
              <div key={r.id} className="card px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{r.medication}</p>
                  <p className="text-xs text-gray-500">
                    Demandé le {new Date(r.requestDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={`badge ${
                  r.status === 'approved' ? 'badge-green' :
                  r.status === 'rejected' ? 'badge-red' : 'badge-yellow'
                }`}>
                  {r.status === 'approved' ? 'Approuvé' : r.status === 'rejected' ? 'Refusé' : 'En attente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {others.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-500 mb-3">Historique</h2>
          <div className="space-y-3">
            {others.map(p => (
              <div key={p.id} className="card px-5 py-4 flex items-center justify-between opacity-70">
                <div>
                  <p className="font-medium text-gray-700">{p.medication}</p>
                  <p className="text-xs text-gray-500">{p.dosage}</p>
                </div>
                <span className={`badge ${statusConfig[p.status]?.class || 'badge-gray'}`}>
                  {statusConfig[p.status]?.label || p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail dialog */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-elevated w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold font-display text-gray-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" /> {selected.medication}
              </h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              {[
                ['Type', selected.medicationType],
                ['Dosage', selected.dosage],
                ['Fréquence', selected.frequency],
                ['Durée', selected.duration],
                ['Instructions', selected.instructions],
                ['Effets secondaires', selected.sideEffects],
                ['Renouvellements', selected.refillsRemaining != null ? `${selected.refillsRemaining} / ${selected.totalRefills}` : null],
                ['Prescrit le', selected.prescribedDate ? new Date(selected.prescribedDate).toLocaleDateString('fr-FR') : null],
                ['Expire le', selected.expiryDate ? new Date(selected.expiryDate).toLocaleDateString('fr-FR') : null],
                ['Prescrit par', selected.prescribedBy],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800 text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5">
              {selected.status === 'active' && !hasPending(selected.id) && (
                <button onClick={() => handleRenew(selected.id)} disabled={renewing} className="btn-primary w-full">
                  <RefreshCw className="w-4 h-4" />
                  {renewing ? 'Envoi...' : 'Demander un renouvellement'}
                </button>
              )}
              {hasPending(selected.id) && (
                <p className="text-center text-sm text-amber-600">Renouvellement déjà en cours.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
