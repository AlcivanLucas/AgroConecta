import { NextRequest, NextResponse } from 'next/server'
import { usersCollection } from '@/src/lib/firebase-admin'
import { generateToken, hashPassword } from '@/src/lib/auth'
import { registerSchema } from '@/src/utils/validations'
import type { User } from '@/src/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', message: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, role, farmName, city, state, cnpj, crea } = validation.data

    // Check if user already exists
    const existingUser = await usersCollection.where('email', '==', email).limit(1).get()
    if (!existingUser.empty) {
      return NextResponse.json(
        { error: 'Conflito', message: 'Email já cadastrado' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user document
    const userRef = usersCollection.doc()
    const now = new Date()
    
    const userData: User = {
      id: userRef.id,
      name,
      email,
      passwordHash,
      role,
      ...(farmName && { farmName }),
      city,
      state,
      ...(cnpj && { cnpj }),
      ...(crea && { crea }),
      isVerified: false,
      avgRating: 0,
      totalRatings: 0,
      totalDeals: 0,
      createdAt: now,
      updatedAt: now,
    }

    await userRef.set(userData)

    // Generate token
    const token = generateToken(userData)

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = userData

    return NextResponse.json(
      { token, user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API] Register error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}
