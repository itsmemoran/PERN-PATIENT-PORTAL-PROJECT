import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { authenticate } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'

const router = Router()
router.use(authenticate)

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('Type de fichier non autorisé'))
  },
})

// POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return error(res, 'Aucun fichier fourni')

  try {
    const record = await req.prisma.medicalRecord.create({
      data: {
        userId: req.userId,
        recordType: req.body.type || 'Document',
        doctor: req.body.doctor || null,
        date: new Date(),
        notes: req.body.notes || null,
        filePath: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        fileType: path.extname(req.file.originalname).replace('.', '').toUpperCase(),
        fileSize: (req.file.size / 1024).toFixed(0) + ' KB',
      },
    })
    return success(res, record, 'Fichier uploadé', 201)
  } catch (err) {
    return error(res, 'Erreur lors de l\'upload', 500)
  }
})

// POST /api/upload/avatar
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  if (!req.file) return error(res, 'Aucun fichier fourni')

  try {
    const avatarUrl = `/uploads/${req.file.filename}`
    await req.prisma.user.update({
      where: { id: req.userId },
      data: { avatarUrl },
    })
    return success(res, { avatarUrl }, 'Avatar mis à jour')
  } catch (err) {
    return error(res, 'Erreur lors de la mise à jour', 500)
  }
})

export default router
