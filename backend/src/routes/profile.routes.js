import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { authenticate } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'

const router = Router()
router.use(authenticate)

// PUT /api/profile
router.put('/', async (req, res) => {
  try {
    const {
      firstName, lastName, phone, dateOfBirth, address,
      bloodType, heightCm, weightKg, allergies,
      chronicConditions, emergencyContact, emergencyPhone,
    } = req.body

    const data = {}
    if (firstName !== undefined) data.firstName = firstName
    if (lastName !== undefined) data.lastName = lastName
    if (phone !== undefined) data.phone = phone
    if (dateOfBirth !== undefined) data.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null
    if (address !== undefined) data.address = address
    if (bloodType !== undefined) data.bloodType = bloodType
    if (heightCm !== undefined) data.heightCm = heightCm ? parseFloat(heightCm) : null
    if (weightKg !== undefined) data.weightKg = weightKg ? parseFloat(weightKg) : null
    if (allergies !== undefined) data.allergies = typeof allergies === 'string' ? allergies : JSON.stringify(allergies)
    if (chronicConditions !== undefined) data.chronicConditions = typeof chronicConditions === 'string' ? chronicConditions : JSON.stringify(chronicConditions)
    if (emergencyContact !== undefined) data.emergencyContact = emergencyContact
    if (emergencyPhone !== undefined) data.emergencyPhone = emergencyPhone

    const user = await req.prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, dateOfBirth: true, avatarUrl: true, bloodType: true,
        heightCm: true, weightKg: true, allergies: true, chronicConditions: true,
        emergencyContact: true, emergencyPhone: true, address: true,
      },
    })

    return success(res, user, 'Profil mis à jour')
  } catch (err) {
    console.error('Profile update error:', err)
    return error(res, 'Erreur lors de la mise à jour', 500)
  }
})

// PUT /api/profile/password
router.put('/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) return error(res, 'Champs requis manquants')
  if (newPassword.length < 8) return error(res, 'Le nouveau mot de passe doit avoir au moins 8 caractères')

  try {
    const user = await req.prisma.user.findUnique({ where: { id: req.userId } })
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return error(res, 'Mot de passe actuel incorrect', 401)

    const hashed = await bcrypt.hash(newPassword, 12)
    await req.prisma.user.update({
      where: { id: req.userId },
      data: { password: hashed },
    })

    return success(res, null, 'Mot de passe mis à jour')
  } catch (err) {
    return error(res, 'Erreur lors de la mise à jour', 500)
  }
})

export default router
