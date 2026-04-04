import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'

const router = Router()
router.use(authenticate)

// GET /api/appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await req.prisma.appointment.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    })
    return success(res, appointments)
  } catch (err) {
    return error(res, 'Erreur lors du chargement', 500)
  }
})

// GET /api/appointments/doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await req.prisma.doctor.findMany()
    return success(res, doctors)
  } catch (err) {
    return error(res, 'Erreur lors du chargement des médecins', 500)
  }
})

// GET /api/appointments/slots
router.get('/slots', async (req, res) => {
  const { doctorId, date } = req.query
  if (!doctorId || !date) return error(res, 'doctorId et date requis')

  try {
    const doctor = await req.prisma.doctor.findUnique({ where: { id: doctorId } })
    if (!doctor) return error(res, 'Médecin non trouvé', 404)

    const allSlots = JSON.parse(doctor.availableSlots || '[]')

    // Remove slots already booked for that date
    const booked = await req.prisma.appointment.findMany({
      where: {
        doctor: doctor.name,
        date: { gte: new Date(date), lt: new Date(new Date(date).getTime() + 86400000) },
        status: { in: ['confirmed', 'pending'] },
      },
      select: { time: true },
    })
    const bookedTimes = new Set(booked.map(b => b.time))
    const available = allSlots.filter(s => !bookedTimes.has(s))

    return success(res, available)
  } catch (err) {
    return error(res, 'Erreur lors du chargement des créneaux', 500)
  }
})

// POST /api/appointments
router.post('/', async (req, res) => {
  const { doctorId, date, time, type } = req.body
  if (!doctorId || !date || !time) return error(res, 'Champs requis manquants')

  try {
    const doctor = await req.prisma.doctor.findUnique({ where: { id: doctorId } })
    if (!doctor) return error(res, 'Médecin non trouvé', 404)

    const appointment = await req.prisma.appointment.create({
      data: {
        userId: req.userId,
        doctor: doctor.name,
        specialty: doctor.specialty,
        type: type || 'Consultation',
        date: new Date(date),
        time,
        location: 'Centre Medical Danan',
        status: 'pending',
      },
    })

    // Create notification
    await req.prisma.notification.create({
      data: {
        userId: req.userId,
        title: 'Nouveau rendez-vous',
        message: `Rendez-vous avec ${doctor.name} le ${new Date(date).toLocaleDateString('fr-FR')} à ${time}.`,
        type: 'appointment',
        link: '/appointments',
      },
    })

    return success(res, appointment, 'Rendez-vous créé', 201)
  } catch (err) {
    return error(res, 'Erreur lors de la création', 500)
  }
})

// DELETE /api/appointments/:id
router.delete('/:id', async (req, res) => {
  try {
    const appt = await req.prisma.appointment.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })
    if (!appt) return error(res, 'Rendez-vous non trouvé', 404)

    await req.prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: 'cancelled' },
    })
    return success(res, null, 'Rendez-vous annulé')
  } catch (err) {
    return error(res, 'Erreur lors de l\'annulation', 500)
  }
})

export default router
