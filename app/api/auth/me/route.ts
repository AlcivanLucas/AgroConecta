import { NextRequest, NextResponse } from 'next/server'
import { usersCollection } from '@/src/lib/firebase-admin'
import { verifyToken, getTokenFromHeader } from '@/src/lib/auth'
import type { User } from '@/src/types'

export async function GET(request: NextRequest) {
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

    // Get user from database
    const userDoc = await usersCollection.doc(payload.userId).get()
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Não encontrado', message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const userData = userDoc.data() as User
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = userData

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('[API] Me error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao buscar usuário' },
      { status: 500 }
    )
  }
}
