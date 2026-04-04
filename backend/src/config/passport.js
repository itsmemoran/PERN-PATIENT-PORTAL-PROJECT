import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        if (!email) {
          return done(new Error('Aucun email trouvé dans le profil Google'), null)
        }

        const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'Utilisateur'
        const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || ''
        const avatarUrl = profile.photos?.[0]?.value || null

        // Check if user exists by googleId or email
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { googleId: profile.id },
              { email },
            ],
          },
        })

        if (user) {
          // Link Google account if not already linked
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: profile.id,
                avatarUrl: user.avatarUrl || avatarUrl,
              },
            })
          }
        } else {
          // Create new user from Google profile
          user = await prisma.user.create({
            data: {
              email,
              googleId: profile.id,
              firstName,
              lastName,
              avatarUrl,
              password: null, // Google users don't have a password
            },
          })

          // Welcome notification
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: 'Bienvenue !',
              message: `Bienvenue ${firstName} sur le portail patient du Centre Medical Danan.`,
              type: 'info',
              link: '/',
            },
          })
        }

        return done(null, user)
      } catch (err) {
        console.error('Google OAuth error:', err)
        return done(err, null)
      }
    }
  )
)

// Serialize/deserialize for session support (needed by Passport even if we use JWT)
passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})

export default passport
