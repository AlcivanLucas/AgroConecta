import { NextRequest, NextResponse } from 'next/server'
import { conversationsCollection, messagesCollection } from '@/src/lib/firebase-admin'
import { verifyToken, getTokenFromHeader } from '@/src/lib/auth'
import type { Message, Conversation } from '@/src/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/conversations/:id/messages
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = getTokenFromHeader(authHeader)
    if (!token) return NextResponse.json({ error: 'Não autorizado', message: 'Token não fornecido' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Não autorizado', message: 'Token inválido' }, { status: 401 })

    const { id: conversationId } = await params

    // Verify user is participant
    const convDoc = await conversationsCollection.doc(conversationId).get()
    if (!convDoc.exists) {
      return NextResponse.json({ error: 'Não encontrado', message: 'Conversa não encontrada' }, { status: 404 })
    }

    const conv = convDoc.data() as Conversation
    if (!conv.participantIds.includes(payload.userId)) {
      return NextResponse.json({ error: 'Proibido', message: 'Acesso negado' }, { status: 403 })
    }

    const snapshot = await messagesCollection
      .where('conversationId', '==', conversationId)
      .get()

    const messages = snapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id }) as Message)
      .sort((a, b) => {
        const aTime = (a.createdAt as any)?._seconds ?? new Date(a.createdAt).getTime() / 1000
        const bTime = (b.createdAt as any)?._seconds ?? new Date(b.createdAt).getTime() / 1000
        return aTime - bTime
      })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[API] Get messages error:', error)
    return NextResponse.json({ error: 'Erro interno', message: 'Erro ao buscar mensagens' }, { status: 500 })
  }
}

// POST /api/conversations/:id/messages
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = getTokenFromHeader(authHeader)
    if (!token) return NextResponse.json({ error: 'Não autorizado', message: 'Token não fornecido' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Não autorizado', message: 'Token inválido' }, { status: 401 })

    const { id: conversationId } = await params
    const body = await request.json()
    const { text } = body as { text: string }

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Dados inválidos', message: 'Mensagem não pode ser vazia' }, { status: 400 })
    }

    // Verify user is participant
    const convDoc = await conversationsCollection.doc(conversationId).get()
    if (!convDoc.exists) {
      return NextResponse.json({ error: 'Não encontrado', message: 'Conversa não encontrada' }, { status: 404 })
    }

    const conv = convDoc.data() as Conversation
    if (!conv.participantIds.includes(payload.userId)) {
      return NextResponse.json({ error: 'Proibido', message: 'Acesso negado' }, { status: 403 })
    }

    const senderName = conv.participants[payload.userId]?.name ?? 'Usuário'
    const now = new Date()

    const msgRef = messagesCollection.doc()
    const messageData: Message = {
      id: msgRef.id,
      conversationId,
      senderId: payload.userId,
      senderName,
      text: text.trim(),
      createdAt: now,
    }

    await Promise.all([
      msgRef.set(messageData),
      conversationsCollection.doc(conversationId).update({
        lastMessage: text.trim().slice(0, 100),
        lastMessageAt: now,
      }),
    ])

    return NextResponse.json({ message: messageData }, { status: 201 })
  } catch (error) {
    console.error('[API] Send message error:', error)
    return NextResponse.json({ error: 'Erro interno', message: 'Erro ao enviar mensagem' }, { status: 500 })
  }
}
