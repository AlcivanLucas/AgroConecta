import { NextRequest, NextResponse } from 'next/server'
import { announcementsCollection, savedAnnouncementsCollection } from '@/src/lib/firebase-admin'
import { verifyToken, getTokenFromHeader } from '@/src/lib/auth'
import type { Announcement, SavedAnnouncement } from '@/src/types'

// GET /api/announcements/saved - Get saved announcements
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

    const savedSnapshot = await savedAnnouncementsCollection
      .where('userId', '==', payload.userId)
      .get()

    const savedItems = savedSnapshot.docs
      .map(doc => doc.data() as SavedAnnouncement)
      .sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)._seconds * 1000
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)._seconds * 1000
        return bTime - aTime
      })

    // Get announcement details
    const announcements: Announcement[] = []
    for (const saved of savedItems) {
      const announcementDoc = await announcementsCollection.doc(saved.announcementId).get()
      if (announcementDoc.exists) {
        const announcement = announcementDoc.data() as Announcement
        if (announcement.isActive) {
          announcements.push({ ...announcement, id: announcementDoc.id })
        }
      }
    }

    return NextResponse.json({ announcements })
  } catch (error) {
    console.error('[API] Get saved announcements error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao buscar anúncios salvos' },
      { status: 500 }
    )
  }
}
