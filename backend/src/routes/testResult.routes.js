import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'

const router = Router()
router.use(authenticate)

// GET /api/test-results
router.get('/', async (req, res) => {
  try {
    const results = await req.prisma.testResult.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    })
    return success(res, results)
  } catch (err) {
    return error(res, 'Erreur lors du chargement', 500)
  }
})

// GET /api/test-results/summary
router.get('/summary', async (req, res) => {
  try {
    const results = await req.prisma.testResult.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    })
    const normal = results.filter(r => r.status === 'normal').length
    const attention = results.filter(r => r.status === 'attention').length
    const lastVisit = results.length > 0 ? results[0].date : null

    return success(res, { total: results.length, normal, attention, lastVisit })
  } catch (err) {
    return error(res, 'Erreur lors du chargement', 500)
  }
})

// GET /api/test-results/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await req.prisma.testResult.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })
    if (!result) return error(res, 'Résultat non trouvé', 404)
    return success(res, result)
  } catch (err) {
    return error(res, 'Erreur lors du chargement', 500)
  }
})

export default router
