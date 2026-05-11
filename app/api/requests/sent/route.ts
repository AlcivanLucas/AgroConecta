import { NextRequest, NextResponse } from 'next/server'
import { serviceRequestsCollection } from '@/src/lib/firebase-admin'
import { verifyToken, getTokenFromHeader } from '@/src/lib/auth'
import type { ServiceRequest } from '@/src/types'

// GET /api/requests/sent - Get requests sent by user (as requester)
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

    const snapshot = await serviceRequestsCollection
      .where('requesterId', '==', payload.userId)
      .get()

    const requests = snapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id }) as ServiceRequest)
      .sort((a, b) => {
        const aTime = (a.createdAt as any)?._seconds ?? new Date(a.createdAt).getTime() / 1000
        const bTime = (b.createdAt as any)?._seconds ?? new Date(b.createdAt).getTime() / 1000
        return bTime - aTime
      })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('[API] Get sent requests error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao buscar solicitações enviadas' },
      { status: 500 }
    )
  }
}
