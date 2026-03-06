import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { User } from '@/src/types'

const JWT_SECRET = process.env.JWT_SECRET || 'agroconecta-super-secret-jwt-2026'
const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

// Client-side auth helpers
export function saveAuth(token: string, user: Omit<User, 'passwordHash'>): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('agroconecta_token', token)
    localStorage.setItem('agroconecta_user', JSON.stringify(user))
  }
}

export function getAuth(): { token: string | null; user: Omit<User, 'passwordHash'> | null } {
  if (typeof window === 'undefined') {
    return { token: null, user: null }
  }
  const token = localStorage.getItem('agroconecta_token')
  const userStr = localStorage.getItem('agroconecta_user')
  const user = userStr ? JSON.parse(userStr) : null
  return { token, user }
}

export function clearAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('agroconecta_token')
    localStorage.removeItem('agroconecta_user')
  }
}

export function isAuthenticated(): boolean {
  const { token } = getAuth()
  return !!token
}
