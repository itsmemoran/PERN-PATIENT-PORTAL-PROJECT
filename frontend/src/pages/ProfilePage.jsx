import { useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { User, Camera, Lock, Save, Shield, Heart } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    address: user?.address || '',
    bloodType: user?.bloodType || '',
    heightCm: user?.heightCm || '',
    weightKg: user?.weightKg || '',
    emergencyContact: user?.emergencyContact || '',
    emergencyPhone: user?.emergencyPhone || '',
  })

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [toast, setToast] = useState(null)
  const [tab, setTab] = useState('info')
  const fileRef = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  const setPw = (field) => (e) => setPasswords(prev => ({ ...prev, [field]: e.target.value }))

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/profile', form)
      updateUser(data.data)
      showToast('Profil mis à jour avec succès')
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error')
    } finally { setSaving(false) }
  }

  const handleChangePassword = async () => {
    if (passwords.new.length < 8) { showToast('Min. 8 caractères', 'error'); return }
    if (passwords.new !== passwords.confirm) { showToast('Mots de passe différents', 'error'); return }
    setSavingPw(true)
    try {
      await api.put('/profile/password', { currentPassword: passwords.current, newPassword: passwords.new })
      showToast('Mot de passe mis à jour')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error')
    } finally { setSavingPw(false) }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      const { data } = await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      updateUser({ ...user, avatarUrl: data.data.avatarUrl })
      showToast('Photo de profil mise à jour')
    } catch {
      showToast('Erreur lors de l\'upload', 'error')
    } finally { setUploadingAvatar(false) }
  }

  const initials = (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')

  const tabs = [
    { id: 'info', label: 'Informations', icon: User },
    { id: 'medical', label: 'Médical', icon: Heart },
    { id: 'security', label: 'Sécurité', icon: Shield },
  ]

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-elevated text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">Mon Profil</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez vos informations personnelles et de sécurité</p>
      </div>

      {/* Avatar section */}
      <div className="card p-6 flex items-center gap-5">
        <div className="relative">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-accent flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
          )}
          <button onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
          <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          {uploadingAvatar && <p className="text-xs text-primary mt-1">Upload en cours...</p>}
        </div>
      </div>

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

      {/* Info tab */}
      {tab === 'info' && (
        <div className="card p-6 space-y-5">
          <h3 className="font-semibold text-gray-800">Informations personnelles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input value={form.firstName} onChange={set('firstName')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input value={form.lastName} onChange={set('lastName')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input value={form.phone} onChange={set('phone')} className="input-field" placeholder="+225..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input value={form.address} onChange={set('address')} className="input-field" placeholder="Votre adresse complète" />
            </div>
          </div>

          <h3 className="font-semibold text-gray-800 pt-2">Contact d'urgence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du contact</label>
              <input value={form.emergencyContact} onChange={set('emergencyContact')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone du contact</label>
              <input value={form.emergencyPhone} onChange={set('emergencyPhone')} className="input-field" />
            </div>
          </div>

          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      )}

      {/* Medical tab */}
      {tab === 'medical' && (
        <div className="card p-6 space-y-5">
          <h3 className="font-semibold text-gray-800">Informations médicales</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Groupe sanguin</label>
              <select value={form.bloodType} onChange={set('bloodType')} className="input-field">
                <option value="">—</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taille (cm)</label>
              <input type="number" value={form.heightCm} onChange={set('heightCm')} className="input-field" placeholder="175" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
              <input type="number" value={form.weightKg} onChange={set('weightKg')} className="input-field" placeholder="72" />
            </div>
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <div className="card p-6 space-y-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Changer le mot de passe
          </h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
              <input type="password" value={passwords.current} onChange={setPw('current')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <input type="password" value={passwords.new} onChange={setPw('new')} className="input-field" placeholder="Min. 8 caractères" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
              <input type="password" value={passwords.confirm} onChange={setPw('confirm')} className="input-field" />
            </div>
          </div>
          <button onClick={handleChangePassword} disabled={savingPw} className="btn-primary">
            <Lock className="w-4 h-4" /> {savingPw ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
        </div>
      )}
    </div>
  )
}
