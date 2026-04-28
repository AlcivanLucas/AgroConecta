import { NextRequest, NextResponse } from 'next/server'
import { usersCollection } from '@/src/lib/firebase-admin'
import { generateToken, comparePassword } from '@/src/lib/auth'
import { loginSchema } from '@/src/utils/validations'
import type { User } from '@/src/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', message: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Find user by email
    const userSnapshot = await usersCollection.where('email', '==', email).limit(1).get()
    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: 'Não autorizado', message: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    const userDoc = userSnapshot.docs[0]
    const userData = userDoc.data() as User

    // Verify password
    const isValidPassword = await comparePassword(password, userData.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Não autorizado', message: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken(userData)

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = userData

    return NextResponse.json({ token, user: userWithoutPassword })
  } catch (error) {
    console.error('[API] Login error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
