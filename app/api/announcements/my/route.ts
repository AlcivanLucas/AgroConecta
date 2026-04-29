import { NextRequest, NextResponse } from 'next/server'
import { announcementsCollection } from '@/src/lib/firebase-admin'
import { verifyToken, getTokenFromHeader } from '@/src/lib/auth'
import type { Announcement } from '@/src/types'

// GET /api/announcements/my - Get user's own announcements
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

    const snapshot = await announcementsCollection
      .where('userId', '==', payload.userId)
      .orderBy('createdAt', 'desc')
      .get()

    const announcements = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as Announcement[]

    return NextResponse.json({ announcements })
  } catch (error) {
    console.error('[API] Get my announcements error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao buscar seus anúncios' },
      { status: 500 }
    )
  }
}
