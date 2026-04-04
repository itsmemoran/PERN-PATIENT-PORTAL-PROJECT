import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'

const router = Router()
router.use(authenticate)

// GET /api/prescriptions
router.get('/', async (req, res) => {
  try {
    const prescriptions = await req.prisma.prescription.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    })
    return success(res, prescriptions)
  } catch (err) {
    return error(res, 'Erreur lors du chargement', 500)
  }
})

// GET /api/prescriptions/renewals
router.get('/renewals', async (req, res) => {
  try {
    const renewals = await req.prisma.prescriptionRenewal.findMany({
      where: { prescription: { userId: req.userId } },
      orderBy: { requestDate: 'desc' },
    })
    return success(res, renewals)
  } catch (err) {
    return error(res, 'Erreur lors du chargement', 500)
  }
})

// POST /api/prescriptions/:id/renew
router.post('/:id/renew', async (req, res) => {
  try {
    const presc = await req.prisma.prescription.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })
    if (!presc) return error(res, 'Ordonnance non trouvée', 404)

    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + 3)

    const renewal = await req.prisma.prescriptionRenewal.create({
      data: {
        prescriptionId: presc.id,
        medication: presc.medication,
        status: 'pending',
        estimatedApproval: estimatedDate,
      },
    })

    await req.prisma.notification.create({
      data: {
        userId: req.userId,
        title: 'Demande de renouvellement',
        message: `Votre demande de renouvellement pour ${presc.medication} a été envoyée.`,
        type: 'prescription',
        link: '/prescriptions',
      },
    })

    return success(res, renewal, 'Demande envoyée', 201)
  } catch (err) {
    return error(res, 'Erreur lors de la demande', 500)
  }
})

export default router
