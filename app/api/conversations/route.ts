import { NextRequest, NextResponse } from 'next/server'
import { conversationsCollection, usersCollection } from '@/src/lib/firebase-admin'
import { verifyToken, getTokenFromHeader } from '@/src/lib/auth'
import type { Conversation, User } from '@/src/types'

// GET /api/conversations - List user's conversations
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = getTokenFromHeader(authHeader)
    if (!token) return NextResponse.json({ error: 'Não autorizado', message: 'Token não fornecido' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Não autorizado', message: 'Token inválido' }, { status: 401 })

    const snapshot = await conversationsCollection
      .where('participantIds', 'array-contains', payload.userId)
      .get()

    const conversations = snapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id }) as Conversation)
      .sort((a, b) => {
        const aTime = (a.lastMessageAt as any)?._seconds ?? new Date(a.lastMessageAt).getTime() / 1000
        const bTime = (b.lastMessageAt as any)?._seconds ?? new Date(b.lastMessageAt).getTime() / 1000
        return bTime - aTime
      })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('[API] List conversations error:', error)
    return NextResponse.json({ error: 'Erro interno', message: 'Erro ao listar conversas' }, { status: 500 })
  }
}

// POST /api/conversations - Create or get existing conversation
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = getTokenFromHeader(authHeader)
    if (!token) return NextResponse.json({ error: 'Não autorizado', message: 'Token não fornecido' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Não autorizado', message: 'Token inválido' }, { status: 401 })

    const body = await request.json()
    const { recipientId, relatedAnnouncementId, relatedAnnouncementTitle } = body as {
      recipientId: string
      relatedAnnouncementId?: string
      relatedAnnouncementTitle?: string
    }

    if (!recipientId) {
      return NextResponse.json({ error: 'Dados inválidos', message: 'recipientId é obrigatório' }, { status: 400 })
    }

    if (recipientId === payload.userId) {
      return NextResponse.json({ error: 'Inválido', message: 'Não é possível conversar consigo mesmo' }, { status: 400 })
    }

    // Check if conversation already exists between these two users
    const existing = await conversationsCollection
      .where('participantIds', 'array-contains', payload.userId)
      .get()

    const existingConv = existing.docs.find(doc => {
      const data = doc.data()
      return (
        data.participantIds.includes(recipientId) &&
        (!relatedAnnouncementId || data.relatedAnnouncementId === relatedAnnouncementId)
      )
    })

    if (existingConv) {
      return NextResponse.json({ conversation: { ...existingConv.data(), id: existingConv.id } })
    }

    // Get both user profiles
    const [senderDoc, recipientDoc] = await Promise.all([
      usersCollection.doc(payload.userId).get(),
      usersCollection.doc(recipientId).get(),
    ])

    if (!recipientDoc.exists) {
      return NextResponse.json({ error: 'Não encontrado', message: 'Destinatário não encontrado' }, { status: 404 })
    }

    const sender = senderDoc.data() as User
    const recipient = recipientDoc.data() as User

    const convRef = conversationsCollection.doc()
    const now = new Date()

    const conversationData: Conversation = {
      id: convRef.id,
      participantIds: [payload.userId, recipientId],
      participants: {
        [payload.userId]: { name: sender.name, role: sender.role, farmName: sender.farmName },
        [recipientId]: { name: recipient.name, role: recipient.role, farmName: recipient.farmName },
      },
      lastMessage: '',
      lastMessageAt: now,
      createdAt: now,
      ...(relatedAnnouncementId && { relatedAnnouncementId }),
      ...(relatedAnnouncementTitle && { relatedAnnouncementTitle }),
    }

    await convRef.set(conversationData)

    return NextResponse.json({ conversation: conversationData }, { status: 201 })
  } catch (error) {
    console.error('[API] Create conversation error:', error)
    return NextResponse.json({ error: 'Erro interno', message: 'Erro ao criar conversa' }, { status: 500 })
  }
}
