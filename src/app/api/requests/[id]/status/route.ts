import { NextRequest, NextResponse } from 'next/server'
import { serviceRequestsCollection } from '@/src/lib/firebase-admin'
import { verifyToken, getTokenFromHeader } from '@/src/lib/auth'
import type { ServiceRequest, RequestStatus } from '@/src/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

const validStatuses: RequestStatus[] = ['aceita', 'recusada', 'cancelada', 'concluida']

// PUT /api/requests/:id/status - Update request status
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params
    const body = await request.json()
    const { status } = body as { status: RequestStatus }

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Dados inválidos', message: 'Status inválido' },
        { status: 400 }
      )
    }

    const requestDoc = await serviceRequestsCollection.doc(id).get()
    if (!requestDoc.exists) {
      return NextResponse.json(
        { error: 'Não encontrado', message: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    const requestData = requestDoc.data() as ServiceRequest

    // Check permissions
    const isProvider = requestData.providerId === payload.userId
    const isRequester = requestData.requesterId === payload.userId

    // Requester can only cancel
    if (isRequester && status !== 'cancelada') {
      return NextResponse.json(
        { error: 'Proibido', message: 'Você só pode cancelar suas solicitações' },
        { status: 403 }
      )
    }

    // Provider can accept, reject, or complete
    if (isProvider && !['aceita', 'recusada', 'concluida'].includes(status)) {
      return NextResponse.json(
        { error: 'Proibido', message: 'Ação não permitida' },
        { status: 403 }
      )
    }

    // Neither provider nor requester
    if (!isProvider && !isRequester) {
      return NextResponse.json(
        { error: 'Proibido', message: 'Você não tem permissão para alterar esta solicitação' },
        { status: 403 }
      )
    }

    // Check if status transition is valid
    if (requestData.status !== 'pendente' && requestData.status !== 'aceita') {
      return NextResponse.json(
        { error: 'Proibido', message: 'Esta solicitação não pode mais ser alterada' },
        { status: 403 }
      )
    }

    await serviceRequestsCollection.doc(id).update({
      status,
      updatedAt: new Date(),
    })

    const updatedDoc = await serviceRequestsCollection.doc(id).get()
    const updatedRequest = { ...updatedDoc.data(), id: updatedDoc.id } as ServiceRequest

    return NextResponse.json({ request: updatedRequest })
  } catch (error) {
    console.error('[API] Update request status error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao atualizar status' },
      { status: 500 }
    )
  }
}
