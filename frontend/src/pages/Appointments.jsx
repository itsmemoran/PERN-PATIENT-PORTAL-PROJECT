import { useState, useEffect, useMemo } from 'react'
import api from '@/lib/api'
import {
  Calendar, Clock, MapPin, User, Plus, X, ChevronLeft, ChevronRight
} from 'lucide-react'

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  const [showDialog, setShowDialog] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentType, setAppointmentType] = useState('')
  const [booking, setBooking] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    Promise.all([api.get('/appointments'), api.get('/appointments/doctors')])
      .then(([apptRes, docRes]) => {
        setAppointments(apptRes.data.data)
        setDoctors(docRes.data.data)
      })
      .catch(() => showToast('Erreur de chargement', 'error'))
      .finally(() => setLoading(false))
  }, [])

  // Load slots when doctor or date changes
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) { setSlots([]); return }
    api.get(`/appointments/slots?doctorId=${selectedDoctor}&date=${selectedDate}`)
      .then(({ data }) => setSlots(data.data))
      .catch(() => setSlots([]))
  }, [selectedDoctor, selectedDate])

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d
  }, [])

  const upcoming = appointments.filter(a =>
    new Date(a.date) >= today && ['confirmed', 'pending'].includes(a.status)
  )
  const past = appointments.filter(a =>
    new Date(a.date) < today || a.status === 'completed' || a.status === 'cancelled'
  )

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      showToast('Sélectionnez médecin, date et horaire', 'error'); return
    }
    setBooking(true)
    try {
      const { data } = await api.post('/appointments', {
        doctorId: selectedDoctor, date: selectedDate,
        time: selectedTime, type: appointmentType || 'Consultation',
      })
      setAppointments(prev => [data.data, ...prev])
      showToast('Rendez-vous pris avec succès !')
      setShowDialog(false)
      setSelectedTime(''); setAppointmentType('')
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error')
    } finally { setBooking(false) }
  }

  const handleCancel = async (id) => {
    if (!confirm('Annuler ce rendez-vous ?')) return
    try {
      await api.delete(`/appointments/${id}`)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
      showToast('Rendez-vous annulé')
    } catch { showToast('Erreur lors de l\'annulation', 'error') }
  }

  const statusStyles = {
    confirmed: 'badge-green', pending: 'badge-yellow',
    completed: 'badge-blue', cancelled: 'badge-red',
  }
  const statusLabels = {
    confirmed: 'Confirmé', pending: 'En attente',
    completed: 'Terminé', cancelled: 'Annulé',
  }

  const types = ['Contrôle de routine', 'Examen de la vue', 'Consultation', 'Urgence', 'Suivi']

  const AppointmentCard = ({ appt }) => (
    <div className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-primary-100 transition-colors">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-800">{appt.type || 'Consultation'}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> {appt.doctor}
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {new Date(appt.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
            {' à '}{appt.time?.slice(0, 5)}
          </p>
          {appt.location && (
            <p className="text-sm text-gray-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {appt.location}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={`badge ${statusStyles[appt.status] || 'badge-gray'}`}>
          {statusLabels[appt.status] || appt.status}
        </span>
        {['confirmed', 'pending'].includes(appt.status) && (
          <button onClick={() => handleCancel(appt.id)}
            className="text-xs text-red-500 hover:text-red-700 hover:underline">
            Annuler
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-elevated text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Mes Rendez-vous</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez et planifiez vos consultations</p>
        </div>
        <button onClick={() => setShowDialog(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Prendre un RDV
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin-slow" />
        </div>
      ) : (
        <>
          {/* Upcoming */}
          <div className="card">
            <div className="px-6 pt-5 pb-3">
              <h2 className="text-base font-semibold font-display text-gray-800">
                À venir ({upcoming.length})
              </h2>
            </div>
            <div className="px-6 pb-5 space-y-3">
              {upcoming.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Aucun rendez-vous à venir</p>
              ) : upcoming.map(a => <AppointmentCard key={a.id} appt={a} />)}
            </div>
          </div>

          {/* Past */}
          <div className="card">
            <div className="px-6 pt-5 pb-3">
              <h2 className="text-base font-semibold font-display text-gray-800 text-gray-500">
                Historique ({past.length})
              </h2>
            </div>
            <div className="px-6 pb-5 space-y-3">
              {past.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Aucun historique</p>
              ) : past.map(a => <AppointmentCard key={a.id} appt={a} />)}
            </div>
          </div>
        </>
      )}

      {/* Booking dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-elevated w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold font-display text-gray-900">Prendre un rendez-vous</h3>
              <button onClick={() => setShowDialog(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Doctor select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Médecin</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => { setSelectedDoctor(e.target.value); setSelectedTime('') }}
                  className="input-field"
                >
                  <option value="">Sélectionner un médecin</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime('') }}
                  className="input-field"
                />
              </div>

              {/* Slots */}
              {slots.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horaires disponibles</label>
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map(s => (
                      <button key={s} onClick={() => setSelectedTime(s)}
                        className={`py-2 px-3 text-sm rounded-lg border transition-colors
                          ${selectedTime === s
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-200 hover:border-primary-200 hover:bg-primary-50'
                          }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : selectedDoctor && selectedDate ? (
                <p className="text-sm text-gray-400">Aucun créneau disponible pour cette date.</p>
              ) : null}

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type (optionnel)</label>
                <select value={appointmentType} onChange={(e) => setAppointmentType(e.target.value)} className="input-field">
                  <option value="">Type de consultation</option>
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <button onClick={handleBook} disabled={booking} className="btn-primary w-full">
                {booking ? 'Réservation...' : 'Confirmer le rendez-vous'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
