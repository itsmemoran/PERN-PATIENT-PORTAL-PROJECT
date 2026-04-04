import { useState } from 'react'
import api from '@/lib/api'
import {
  MapPin, Phone, Mail, Clock, MessageCircle,
  Calendar, AlertTriangle, Send, ExternalLink
} from 'lucide-react'

const clinicInfo = {
  name: 'Centre Medical Danan',
  address: '123 Rue de la Santé, Angré, Abidjan, Côte d\'Ivoire',
  phone: '+225 21 23 45 67 89',
  emergencyPhone: '+225 21 23 45 67 00',
  email: 'contact@centremedicaldanan.ci',
  hours: { weekdays: '8h00 - 18h00', saturday: '9h00 - 13h00', sunday: 'Fermé' },
}

const doctors = [
  { name: 'Dr. Kouassi Martin', specialty: 'Ophtalmologue', phone: '+225 21 23 45 67 80', email: 'dr.martin@centremedicaldanan.ci', days: 'Lun, Mer, Ven' },
  { name: 'Dr. Kouadio Olivier', specialty: 'Ophtalmologue', phone: '+225 21 23 45 67 81', email: 'dr.kouadio@centremedicaldanan.ci', days: 'Mar, Jeu, Sam' },
  { name: 'Dr. Coulibaly Amina', specialty: 'Optométriste', phone: '+225 21 23 45 67 82', email: 'dr.coulibalyamina@centremedicaldanan.ci', days: 'Lun à Ven' },
]

const emergencies = [
  { situation: 'Urgence ophtalmologique', action: 'Contactez immédiatement le centre', phone: '+225 21 23 45 67 00', available: '24h/24, 7j/7' },
  { situation: 'Douleur oculaire sévère', action: 'Urgences + contactez le centre', phone: 'SAMU: 185', available: 'Immédiat' },
  { situation: 'Perte de vision soudaine', action: 'Urgences hospitalières', phone: 'SAMU: 185', available: 'Immédiat' },
]

export default function Contacts() {
  const [form, setForm] = useState({ type: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  const handleSend = () => {
    if (!form.type || !form.subject || !form.message) {
      showToast('Veuillez remplir tous les champs', 'error'); return
    }
    setSending(true)
    // Simulate send
    setTimeout(() => {
      showToast('Message envoyé avec succès !')
      setForm({ type: '', subject: '', message: '' })
      setSending(false)
    }, 1000)
  }

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-elevated text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">Contact & Informations</h1>
        <p className="text-sm text-gray-500 mt-1">Centre Medical Danan — Notre passion, préserver votre vue</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact form */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-5">
            <MessageCircle className="w-5 h-5 text-primary" /> Nous contacter
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de demande</label>
              <select value={form.type} onChange={set('type')} className="input-field">
                <option value="">Sélectionnez...</option>
                <option value="appointment">Demande de rendez-vous</option>
                <option value="question">Question médicale</option>
                <option value="prescription">Renouvellement d'ordonnance</option>
                <option value="results">Résultats d'examens</option>
                <option value="emergency">Urgence</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sujet</label>
              <input value={form.subject} onChange={set('subject')} className="input-field" placeholder="Objet de votre message" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea value={form.message} onChange={set('message')} rows={5}
                className="input-field resize-none" placeholder="Décrivez votre demande..." />
            </div>
            <button onClick={handleSend} disabled={sending} className="btn-primary w-full">
              <Send className="w-4 h-4" />
              {sending ? 'Envoi...' : 'Envoyer le message'}
            </button>
          </div>
        </div>

        {/* Clinic info */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-5">
            <MapPin className="w-5 h-5 text-accent" /> Informations du centre
          </h2>
          <div className="space-y-4">
            {[
              { icon: MapPin, label: 'Adresse', value: clinicInfo.address },
              { icon: Phone, label: 'Téléphone', value: clinicInfo.phone, extra: <p className="text-sm text-red-500 font-medium">Urgences: {clinicInfo.emergencyPhone}</p> },
              { icon: Mail, label: 'Email', value: clinicInfo.email },
            ].map(({ icon: Icon, label, value, extra }) => (
              <div key={label} className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-200 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-sm text-gray-500">{value}</p>
                  {extra}
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-200 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Horaires d'ouverture</p>
                <div className="text-sm text-gray-500 space-y-0.5">
                  <p>Lun - Ven: {clinicInfo.hours.weekdays}</p>
                  <p>Samedi: {clinicInfo.hours.saturday}</p>
                  <p>Dimanche: {clinicInfo.hours.sunday}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical team */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-5">
          <Calendar className="w-5 h-5 text-primary" /> Notre équipe médicale
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {doctors.map((d, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 hover:border-primary-100 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent flex items-center justify-center mb-3">
                <span className="text-white text-sm font-bold">{d.name.split(' ').pop()[0]}</span>
              </div>
              <h4 className="font-medium text-gray-800">{d.name}</h4>
              <span className="badge badge-blue mt-1 mb-3">{d.specialty}</span>
              <div className="space-y-1.5 text-xs text-gray-500">
                <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {d.phone}</p>
                <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {d.email}</p>
                <p className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {d.days}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency */}
      <div className="card p-6 border-red-200 bg-red-50/50">
        <h2 className="font-semibold text-red-700 flex items-center gap-2 mb-5">
          <AlertTriangle className="w-5 h-5" /> Informations d'urgence
        </h2>
        <div className="space-y-3">
          {emergencies.map((e, i) => (
            <div key={i} className="p-4 bg-white rounded-xl border border-red-200">
              <h4 className="font-medium text-red-800">{e.situation}</h4>
              <p className="text-sm text-red-600 mb-2">{e.action}</p>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> <strong>{e.phone}</strong></span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {e.available}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <h4 className="font-medium text-amber-800 mb-1">En cas d'urgence vitale</h4>
          <p className="text-sm text-amber-700 mb-3">
            Appelez immédiatement le SAMU (185) ou les pompiers (180).
          </p>
          <div className="flex gap-2">
            <span className="badge badge-red font-bold">185 — SAMU</span>
            <span className="badge badge-red font-bold">180 — Pompiers</span>
          </div>
        </div>
      </div>
    </div>
  )
}
