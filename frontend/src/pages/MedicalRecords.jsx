import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import {
  FolderHeart, FileText, User, AlertTriangle,
  Download, Syringe, History, Upload, X
} from 'lucide-react'

export default function MedicalRecords() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [records, setRecords] = useState([])
  const [vaccinations, setVaccinations] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    Promise.all([
      api.get('/medical-records'),
      api.get('/medical-records/vaccinations'),
      api.get('/medical-records/documents'),
    ])
      .then(([rec, vac, doc]) => {
        setRecords(rec.data.data); setVaccinations(vac.data.data); setDocuments(doc.data.data)
      })
      .catch(() => setError('Impossible de charger le dossier médical.'))
      .finally(() => setLoading(false))
  }, [])

  const parseList = (val) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    try { return JSON.parse(val) } catch { return [val] }
  }

  const allergies = parseList(user?.allergies)
  const conditions = parseList(user?.chronicConditions || user?.chronic_conditions)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'Document')
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDocuments(prev => [
        { id: data.data.id, name: data.data.fileName, file_type: data.data.fileType, file_size: data.data.fileSize, file_path: data.data.filePath, date: data.data.date },
        ...prev,
      ])
      showToast('Document uploadé avec succès')
      setShowUpload(false)
    } catch {
      showToast('Erreur lors de l\'upload', 'error')
    } finally { setUploading(false) }
  }

  const tabs = [
    { id: 'overview', label: 'Aperçu', icon: FolderHeart },
    { id: 'history', label: 'Historique', icon: History },
    { id: 'vaccinations', label: 'Vaccins', icon: Syringe },
    { id: 'documents', label: 'Documents', icon: FileText },
  ]

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-elevated text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Mon Dossier Médical</h1>
          <p className="text-sm text-gray-500 mt-1">Consultez votre historique et documents médicaux</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-secondary">
          <Upload className="w-4 h-4" /> Ajouter un document
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${tab === id ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin-slow" />
        </div>
      ) : (
        <>
          {/* Overview */}
          {tab === 'overview' && (
            <div className="space-y-4">
              <div className="card p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Informations personnelles</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {[
                    ['Nom', `${user?.firstName || ''} ${user?.lastName || ''}`],
                    ['Date de naissance', user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('fr-FR') : '—'],
                    ['Groupe sanguin', user?.bloodType || '—'],
                    ['Taille', user?.heightCm ? `${user.heightCm} cm` : '—'],
                    ['Poids', user?.weightKg ? `${user.weightKg} kg` : '—'],
                    ['Téléphone', user?.phone || '—'],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">{l}</p>
                      <p className="font-medium text-gray-800 mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {(allergies.length > 0 || conditions.length > 0) && (
                <div className="card p-6">
                  <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Informations médicales importantes
                  </h2>
                  {allergies.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Allergies</p>
                      <div className="flex flex-wrap gap-2">
                        {allergies.map((a, i) => (
                          <span key={i} className="badge badge-red">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {conditions.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Conditions chroniques</p>
                      <div className="flex flex-wrap gap-2">
                        {conditions.map((c, i) => (
                          <span key={i} className="badge badge-blue">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {user?.emergencyContact && (
                <div className="card p-6">
                  <h2 className="font-semibold text-gray-800 mb-3">Contact d'urgence</h2>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-400">Nom :</span> {user.emergencyContact}</p>
                    <p><span className="text-gray-400">Téléphone :</span> {user.emergencyPhone || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History */}
          {tab === 'history' && (
            <div className="space-y-4">
              {records.length === 0 ? (
                <div className="card p-10 text-center text-gray-400">Aucun antécédent médical enregistré.</div>
              ) : records.map(r => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">{r.recordType}</h3>
                    <span className="badge badge-blue">
                      {new Date(r.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {r.doctor && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                      <User className="w-3 h-3" /> {r.doctor}
                    </p>
                  )}
                  {r.diagnosis && <p className="text-sm"><span className="font-medium">Diagnostic :</span> {r.diagnosis}</p>}
                  {r.treatment && <p className="text-sm"><span className="font-medium">Traitement :</span> {r.treatment}</p>}
                  {r.notes && <p className="text-sm text-gray-500 italic mt-2">{r.notes}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Vaccinations */}
          {tab === 'vaccinations' && (
            <div className="space-y-3">
              {vaccinations.length === 0 ? (
                <div className="card p-10 text-center text-gray-400">Aucun vaccin enregistré.</div>
              ) : vaccinations.map(v => (
                <div key={v.id} className="card px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{v.vaccine_name}</p>
                    <p className="text-xs text-gray-500">
                      Administré le {new Date(v.date).toLocaleDateString('fr-FR')}
                      {v.administered_by ? ` · ${v.administered_by}` : ''}
                    </p>
                  </div>
                  <span className="badge badge-green">À jour</span>
                </div>
              ))}
            </div>
          )}

          {/* Documents */}
          {tab === 'documents' && (
            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="card p-10 text-center text-gray-400">Aucun document médical disponible.</div>
              ) : documents.map(d => (
                <div key={d.id} className="card px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{d.name}</p>
                      <p className="text-xs text-gray-500">
                        {d.file_type} · {d.file_size}
                        {d.date ? ` · ${new Date(d.date).toLocaleDateString('fr-FR')}` : ''}
                      </p>
                    </div>
                  </div>
                  {d.file_path && (
                    <a href={d.file_path} target="_blank" rel="noreferrer" className="btn-secondary text-sm py-2">
                      <Download className="w-4 h-4" /> Télécharger
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Upload dialog */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-elevated w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold font-display">Ajouter un document</h3>
              <button onClick={() => setShowUpload(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-3">PDF, JPG, PNG, DOC (max 10 MB)</p>
              <label className="btn-primary cursor-pointer">
                {uploading ? 'Upload...' : 'Choisir un fichier'}
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
