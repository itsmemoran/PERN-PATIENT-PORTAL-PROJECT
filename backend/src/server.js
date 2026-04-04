import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import session from 'express-session'
import { PrismaClient } from '@prisma/client'
import passport from './config/passport.js'
import authRoutes from './routes/auth.routes.js'
import appointmentRoutes from './routes/appointment.routes.js'
import prescriptionRoutes from './routes/prescription.routes.js'
import testResultRoutes from './routes/testResult.routes.js'
import medicalRecordRoutes from './routes/medicalRecord.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import uploadRoutes from './routes/upload.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import profileRoutes from './routes/profile.routes.js'

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// Session (required by Passport for OAuth flow)
app.use(session({
  secret: process.env.JWT_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 60000 }, // short-lived — only used during OAuth redirect
}))

// Passport
app.use(passport.initialize())
app.use(passport.session())

// Attach prisma to request
app.use((req, res, next) => {
  req.prisma = prisma
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/prescriptions', prescriptionRoutes)
app.use('/api/test-results', testResultRoutes)
app.use('/api/medical-records', medicalRecordRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/profile', profileRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Patient Portal API is running' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
