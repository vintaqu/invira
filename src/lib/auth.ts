import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const providers: any[] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials, req) {
      if (!credentials?.email || !credentials?.password) return null

      // Rate limit: 10 login attempts per email per 15 minutes
      const { checkRateLimit } = await import('@/lib/rateLimit')
      const email = credentials.email.toLowerCase().trim()
      if (!checkRateLimit(`login:${email}`, 10, 15 * 60_000)) {
        throw new Error('Demasiados intentos. Espera 15 minutos.')
      }

      const user = await prisma.user.findUnique({ where: { email } })
      // Always run bcrypt to prevent timing attacks (even if user not found)
      const dummyHash = '$2a$12$dummy.hash.to.prevent.timing.attacks.padding'
      const valid = user?.passwordHash
        ? await bcrypt.compare(credentials.password, user.passwordHash)
        : await bcrypt.compare(credentials.password, dummyHash).then(() => false)

      if (!user || !user.passwordHash || !valid) return null
      if (user.isBlocked) throw new Error('Cuenta suspendida. Contacta con soporte.')

      return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role }
    },
  }),
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const { default: GoogleProvider } = require('next-auth/providers/google')
  providers.unshift(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }))
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: { signIn: '/', error: '/' },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as unknown as { role: string }).role ?? 'USER'
      }
      // Always refresh role from DB (in case it changed)
      if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string }, select: { role: true } })
        if (dbUser) token.role = dbUser.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        ;session.user.id   = token.id as string
        ;session.user.role = token.role as string
      }
      return session
    },
  },
}
