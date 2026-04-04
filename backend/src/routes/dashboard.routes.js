import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'

const router = Router()
router.use(authenticate)

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const [upcomingAppointments, recentResults, activePrescriptions, unreadNotifications] = await Promise.all([
      req.prisma.appointment.findMany({
        where: {
          userId: req.userId,
          date: { gte: now },
          status: { in: ['confirmed', 'pending'] },
        },
        orderBy: { date: 'asc' },
        take: 5,
      }),
      req.prisma.testResult.findMany({
        where: { userId: req.userId },
        orderBy: { date: 'desc' },
        take: 5,
        select: { id: true, testName: true, doctor: true, date: true, status: true },
      }),
      req.prisma.prescription.findMany({
        where: { userId: req.userId, status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, medication: true, dosage: true, expiryDate: true },
      }),
      req.prisma.notification.count({
        where: { userId: req.userId, read: false },
      }),
    ])

    // Map field names to match frontend expectations
    const data = {
      upcomingAppointments: upcomingAppointments.map(a => ({
        id: a.id, type: a.type, doctor: a.doctor, date: a.date,
        time: a.time, status: a.status, location: a.location,
      })),
      recentResults: recentResults.map(r => ({
        id: r.id, test_name: r.testName, doctor: r.doctor,
        date: r.date, status: r.status,
      })),
      activePrescriptions: activePrescriptions.map(p => ({
        id: p.id, medication: p.medication, dosage: p.dosage,
        expiry_date: p.expiryDate,
      })),
      unreadNotifications,
    }

    return success(res, data)
  } catch (err) {
    console.error('Dashboard error:', err)
    return error(res, 'Erreur lors du chargement du tableau de bord', 500)
  }
})

export default router
