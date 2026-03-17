import { NextRequest, NextResponse } from 'next/server'
import { announcementsCollection, usersCollection } from '@/src/lib/firebase-admin'
import { verifyToken, getTokenFromHeader } from '@/src/lib/auth'
import { announcementSchema } from '@/src/utils/validations'
import type { Announcement, User, UserSnapshot } from '@/src/types'

// GET /api/announcements - List announcements with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const search = searchParams.get('search')

    let query = announcementsCollection.where('isActive', '==', true)

    if (category) {
      query = query.where('category', '==', category)
    }
    if (city) {
      query = query.where('city', '==', city)
    }
    if (state) {
      query = query.where('state', '==', state)
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get()

    let announcements = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as Announcement[]

    // Filter by search term (client-side for simplicity with Firestore)
    if (search) {
      const searchLower = search.toLowerCase()
      announcements = announcements.filter(
        a =>
          a.title.toLowerCase().includes(searchLower) ||
          a.description.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({ announcements })
  } catch (error) {
    console.error('[API] List announcements error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao listar anúncios' },
      { status: 500 }
    )
  }
}

// POST /api/announcements - Create announcement
export async function POST(request: NextRequest) {
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
    const validation = announcementSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', message: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    // Get user data for snapshot
    const userDoc = await usersCollection.doc(payload.userId).get()
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Não encontrado', message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const userData = userDoc.data() as User
    const userSnapshot: UserSnapshot = {
      name: userData.name,
      farmName: userData.farmName,
      avgRating: userData.avgRating,
      isVerified: userData.isVerified,
      city: userData.city,
      state: userData.state,
      role: userData.role,
    }

    const announcementRef = announcementsCollection.doc()
    const now = new Date()

    const announcementData: Announcement = {
      id: announcementRef.id,
      ...validation.data,
      imageUrls: validation.data.imageUrls || [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      userId: payload.userId,
      userSnapshot,
    }

    await announcementRef.set(announcementData)

    return NextResponse.json({ announcement: announcementData }, { status: 201 })
  } catch (error) {
    console.error('[API] Create announcement error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao criar anúncio' },
      { status: 500 }
    )
  }
}
