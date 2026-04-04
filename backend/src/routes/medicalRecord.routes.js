import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'

const router = Router()
router.use(authenticate)

// GET /api/medical-records
router.get('/', async (req, res) => {
  try {
    const records = await req.prisma.medicalRecord.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    })
    return success(res, records)
  } catch (err) {
    return error(res, 'Erreur lors du chargement', 500)
  }
})

// GET /api/medical-records/vaccinations
router.get('/vaccinations', async (req, res) => {
  try {
    const records = await req.prisma.medicalRecord.findMany({
      where: { userId: req.userId, recordType: 'Vaccination' },
      orderBy: { date: 'desc' },
    })
    // Transform to match frontend expected shape
    const vaccinations = records.map(r => ({
      id: r.id,
      vaccine_name: r.treatment || r.diagnosis || 'Vaccination',
      date: r.date,
      administered_by: r.doctor,
      next_due: null,
    }))
    return success(res, vaccinations)
  } catch (err) {
    return error(res, 'Erreur lors du chargement', 500)
  }
})

// GET /api/medical-records/documents
router.get('/documents', async (req, res) => {
  try {
    const documents = await req.prisma.medicalRecord.findMany({
      where: { userId: req.userId, filePath: { not: null } },
      orderBy: { date: 'desc' },
      select: {
        id: true, fileName: true, fileType: true, fileSize: true,
        filePath: true, date: true, recordType: true,
      },
    })
    const docs = documents.map(d => ({
      id: d.id,
      name: d.fileName || d.recordType,
      file_type: d.fileType,
      file_size: d.fileSize,
      file_path: d.filePath,
      date: d.date,
    }))
    return success(res, docs)
  } catch (err) {
    return error(res, 'Erreur lors du chargement', 500)
  }
})

export default router
