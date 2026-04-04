import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'

const router = Router()
router.use(authenticate)

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await req.prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    return success(res, notifications)
  } catch (err) {
    return error(res, 'Erreur lors du chargement', 500)
  }
})

// GET /api/notifications/unread-count
router.get('/unread-count', async (req, res) => {
  try {
    const count = await req.prisma.notification.count({
      where: { userId: req.userId, read: false },
    })
    return success(res, { count })
  } catch (err) {
    return error(res, 'Erreur', 500)
  }
})

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    await req.prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    })
    return success(res, null, 'Notification lue')
  } catch (err) {
    return error(res, 'Erreur', 500)
  }
})

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res) => {
  try {
    await req.prisma.notification.updateMany({
      where: { userId: req.userId, read: false },
      data: { read: true },
    })
    return success(res, null, 'Toutes les notifications marquées comme lues')
  } catch (err) {
    return error(res, 'Erreur', 500)
  }
})

export default router
