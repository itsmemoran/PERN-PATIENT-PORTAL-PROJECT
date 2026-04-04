import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { authenticate, generateTokens } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'
import passport from '../config/passport.js'

const router = Router()

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('firstName').notEmpty().withMessage('Le prénom est requis'),
    body('lastName').notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit avoir au moins 8 caractères'),
    body('phone').optional(),
    body('dateOfBirth').optional().isISO8601().withMessage('Date de naissance invalide'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return error(res, 'Validation échouée', 422, errors.array().map(e => ({ field: e.path, message: e.msg })))
    }

    try {
      const { firstName, lastName, email, password, phone, dateOfBirth } = req.body
      const existing = await req.prisma.user.findUnique({ where: { email } })
      if (existing) return error(res, 'Un compte existe déjà avec cet email', 409)

      const hashed = await bcrypt.hash(password, 12)
      const user = await req.prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashed,
          phone: phone || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, dateOfBirth: true, createdAt: true },
      })

      // Create welcome notification
      await req.prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Bienvenue !',
          message: `Bienvenue ${firstName} sur le portail patient du Centre Medical Danan.`,
          type: 'info',
          link: '/',
        },
      })

      const tokens = generateTokens(user.id)
      return success(res, { user, ...tokens }, 'Inscription réussie', 201)
    } catch (err) {
      console.error('Signup error:', err)
      return error(res, 'Erreur lors de l\'inscription', 500)
    }
  }
)

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return error(res, 'Validation échouée', 422)
    }

    try {
      const { email, password } = req.body
      const user = await req.prisma.user.findUnique({ where: { email } })
      if (!user) return error(res, 'Identifiants invalides', 401)

      // Google-only user trying to log in with password
      if (!user.password) {
        return error(res, 'Ce compte utilise Google. Connectez-vous avec Google.', 401)
      }

      const valid = await bcrypt.compare(password, user.password)
      if (!valid) return error(res, 'Identifiants invalides', 401)

      const tokens = generateTokens(user.id)
      const { password: _, ...safeUser } = user
      return success(res, { user: safeUser, ...tokens })
    } catch (err) {
      console.error('Login error:', err)
      return error(res, 'Erreur de connexion', 500)
    }
  }
)

// ─── Google OAuth ─────────────────────────────────────────────────────────────

// GET /api/auth/google — Redirect to Google consent screen
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account', // Always let user pick which Google account
}))

// GET /api/auth/google/callback — Google redirects here after consent
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed', session: false }),
  (req, res) => {
    // req.user is set by Passport's Google strategy
    const tokens = generateTokens(req.user.id)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    // Redirect to frontend callback page with tokens in URL
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
    )
  }
)

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) return error(res, 'Refresh token manquant', 401)

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const tokens = generateTokens(decoded.userId)
    return success(res, tokens)
  } catch {
    return error(res, 'Refresh token invalide', 401)
  }
})

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, dateOfBirth: true, avatarUrl: true, bloodType: true,
        heightCm: true, weightKg: true, allergies: true, chronicConditions: true,
        emergencyContact: true, emergencyPhone: true, address: true, createdAt: true,
      },
    })
    if (!user) return error(res, 'Utilisateur non trouvé', 404)
    return success(res, user)
  } catch (err) {
    console.error('Me error:', err)
    return error(res, 'Erreur serveur', 500)
  }
})

export default router
