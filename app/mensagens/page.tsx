'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/src/components/layout/navbar'
import { Footer } from '@/src/components/layout/footer'
import { conversationsApi } from '@/src/lib/api'
import { getAuth } from '@/src/lib/auth'
import type { Conversation } from '@/src/types'

export default function MensagensPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = getAuth()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    conversationsApi.list()
      .then(({ conversations }) => setConversations(conversations))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const getOtherParticipant = (conv: Conversation) => {
    const otherId = conv.participantIds.find(id => id !== user?.id)
    return otherId ? conv.participants[otherId] : null
  }

  const formatDate = (date: any) => {
    const ts = date?._seconds ? date._seconds * 1000 : new Date(date).getTime()
    const d = new Date(ts)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diffDays === 0) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return d.toLocaleDateString('pt-BR', { weekday: 'short' })
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Mensagens</h1>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="font-semibold text-lg mb-1">Nenhuma conversa ainda</h3>
                <p className="text-muted-foreground text-sm">
                  Inicie uma negociação a partir de um anúncio no marketplace.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {conversations.map(conv => {
                const other = getOtherParticipant(conv)
                return (
                  <Card
                    key={conv.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/mensagens/${conv.id}`)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {other?.name?.charAt(0).toUpperCase() ?? '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">{other?.name ?? 'Usuário'}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatDate(conv.lastMessageAt)}
                          </span>
                        </div>
                        {conv.relatedAnnouncementTitle && (
                          <Badge variant="outline" className="text-xs mb-1">
                            {conv.relatedAnnouncementTitle}
                          </Badge>
                        )}
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage || 'Conversa iniciada'}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
