import { NextRequest, NextResponse } from 'next/server'
import { usersCollection } from '@/src/lib/firebase-admin'
import { verifyToken, getTokenFromHeader } from '@/src/lib/auth'
import { updateProfileSchema } from '@/src/utils/validations'
import type { User } from '@/src/types'

// PUT /api/users/me - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Não autorizado', message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Não autorizado', message: 'Token inválido' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = updateProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', message: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const updateData = {
      ...Object.fromEntries(
        Object.entries(validation.data).filter(([, v]) => v !== undefined)
      ),
      updatedAt: new Date(),
    }

    await usersCollection.doc(payload.userId).update(updateData)

    const updatedDoc = await usersCollection.doc(payload.userId).get()
    const userData = updatedDoc.data() as User
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = userData

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('[API] Update user error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
}
