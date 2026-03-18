import { NextRequest, NextResponse } from 'next/server'
import { announcementsCollection } from '@/src/lib/firebase-admin'
import { verifyToken, getTokenFromHeader } from '@/src/lib/auth'
import { announcementSchema } from '@/src/utils/validations'
import type { Announcement } from '@/src/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/announcements/:id - Get single announcement
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const doc = await announcementsCollection.doc(id).get()

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Não encontrado', message: 'Anúncio não encontrado' },
        { status: 404 }
      )
    }

    const announcement = { ...doc.data(), id: doc.id } as Announcement

    return NextResponse.json({ announcement })
  } catch (error) {
    console.error('[API] Get announcement error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao buscar anúncio' },
      { status: 500 }
    )
  }
}

// PUT /api/announcements/:id - Update announcement
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
    const doc = await announcementsCollection.doc(id).get()

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Não encontrado', message: 'Anúncio não encontrado' },
        { status: 404 }
      )
    }

    const existingAnnouncement = doc.data() as Announcement
    if (existingAnnouncement.userId !== payload.userId) {
      return NextResponse.json(
        { error: 'Proibido', message: 'Você não pode editar este anúncio' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = announcementSchema.partial().safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', message: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const updateData = {
      ...validation.data,
      updatedAt: new Date(),
    }

    await announcementsCollection.doc(id).update(updateData)

    const updatedDoc = await announcementsCollection.doc(id).get()
    const announcement = { ...updatedDoc.data(), id: updatedDoc.id } as Announcement

    return NextResponse.json({ announcement })
  } catch (error) {
    console.error('[API] Update announcement error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao atualizar anúncio' },
      { status: 500 }
    )
  }
}

// DELETE /api/announcements/:id - Delete announcement
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const doc = await announcementsCollection.doc(id).get()

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Não encontrado', message: 'Anúncio não encontrado' },
        { status: 404 }
      )
    }

    const existingAnnouncement = doc.data() as Announcement
    if (existingAnnouncement.userId !== payload.userId) {
      return NextResponse.json(
        { error: 'Proibido', message: 'Você não pode excluir este anúncio' },
        { status: 403 }
      )
    }

    // Soft delete - mark as inactive
    await announcementsCollection.doc(id).update({
      isActive: false,
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Delete announcement error:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: 'Erro ao excluir anúncio' },
      { status: 500 }
    )
  }
}
