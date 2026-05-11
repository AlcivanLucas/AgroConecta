import { NextRequest, NextResponse } from 'next/server'
import { 
  serviceRequestsCollection, 
  announcementsCollection, 
  usersCollection 
} from '@/src/lib/firebase-admin'
import { verifyToken, getTokenFromHeader } from '@/src/lib/auth'
import { serviceRequestSchema } from '@/src/utils/validations'
import type { ServiceRequest, Announcement, User } from '@/src/types'

// POST /api/requests - Create service request
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
    const validation = serviceRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', message: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { announcementId, message } = validation.data

    // Get announcement
    const announcementDoc = await announcementsCollection.doc(announcementId).get()
    if (!announcementDoc.exists) {
      return NextResponse.json(
        { error: 'Não encontrado', message: 'Anúncio não encontrado' },
        { status: 404 }
      )
    }

    const announcement = announcementDoc.data() as Announcement

    // Can't request your own service
    if (announcement.userId === payload.userId) {
      return NextResponse.json(
        { error: 'Proibido', message: 'Você não pode solicitar seu próprio serviço' },
        { status: 403 }
      )
    }

    // Check for existing pending request (query by requesterId only to avoid composite index)
    const existingRequestSnapshot = await serviceRequestsCollection
      .where('requesterId', '==', payload.userId)
      .get()

    const alreadyPending = existingRequestSnapshot.docs.some(doc => {
      const data = doc.data()
      return data.announcementId === announcementId && data.status === 'pendente'
    })

    if (alreadyPending) {
      return NextResponse.json(
        { error: 'Conflito', message: 'Você já tem uma solicitação pendente para este anúncio' },
        { status: 409 }
      )
    }

    // Get requester data
    const requesterDoc = await usersCollection.doc(payload.userId).get()
    if (!requesterDoc.exists) {
      return NextResponse.json(
        { error: 'Não encontrado', message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }
    const requester = requesterDoc.data() as User

    // Get provider data
    const providerDoc = await usersCollection.doc(announcement.userId).get()
    const provider = providerDoc.data() as User

    const requestRef = serviceRequestsCollection.doc()
    const now = new Date()

    const requestData: ServiceRequest = {
      id: requestRef.id,
      message,
      status: 'pendente',
      createdAt: now,
      updatedAt: now,
      requesterId: payload.userId,
      providerId: announcement.userId,
      announcementId,
      requesterSnapshot: {
        name: requester.name,
        ...(requester.farmName && { farmName: requester.farmName }),
        city: requester.city,
        state: requester.state,
        role: requester.role,
      },
      providerSnapshot: {
        name: provider.name,
        ...(provider.farmName && { farmName: provider.farmName }),
        city: provider.city,
        state: provider.state,
        role: provider.role,
      },
      announcementSnapshot: {
        title: announcement.title,
        category: announcement.category,
      },
    }

    await requestRef.set(requestData)

    return NextResponse.json({ request: requestData }, { status: 201 })
  } catch (error) {
    console.error('[API] Create request error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao criar solicitação' },
      { status: 500 }
    )
  }
}
