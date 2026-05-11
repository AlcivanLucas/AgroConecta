import { NextRequest, NextResponse } from 'next/server'
import { savedAnnouncementsCollection } from '@/src/lib/firebase-admin'
import { verifyToken, getTokenFromHeader } from '@/src/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/announcements/:id/save - Toggle save announcement
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const { id: announcementId } = await params

    // Check if already saved (query by userId only to avoid composite index requirement)
    const existingSnapshot = await savedAnnouncementsCollection
      .where('userId', '==', payload.userId)
      .get()

    const existingDoc = existingSnapshot.docs.find(
      doc => doc.data().announcementId === announcementId
    )

    if (existingDoc) {
      await savedAnnouncementsCollection.doc(existingDoc.id).delete()
      return NextResponse.json({ saved: false })
    }

    // Add save
    const saveRef = savedAnnouncementsCollection.doc()
    await saveRef.set({
      id: saveRef.id,
      userId: payload.userId,
      announcementId,
      createdAt: new Date(),
    })

    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error('[API] Save announcement error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao salvar anúncio' },
      { status: 500 }
    )
  }
}
