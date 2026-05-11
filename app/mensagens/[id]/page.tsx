'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/src/components/layout/navbar'
import { Footer } from '@/src/components/layout/footer'
import { conversationsApi } from '@/src/lib/api'
import { getAuth } from '@/src/lib/auth'
import type { Conversation, Message } from '@/src/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ConversaPage({ params }: PageProps) {
  const { id: conversationId } = use(params)
  const router = useRouter()
  const { user } = getAuth()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    loadAll()
  }, [conversationId])

  useEffect(() => {
    // Poll for new messages every 4 seconds
    pollRef.current = setInterval(() => {
      conversationsApi.getMessages(conversationId)
        .then(({ messages: msgs }) => setMessages(msgs))
        .catch(() => {})
    }, 4000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadAll = async () => {
    try {
      const [convList, { messages: msgs }] = await Promise.all([
        conversationsApi.list(),
        conversationsApi.getMessages(conversationId),
      ])
      const conv = convList.conversations.find((c: Conversation) => c.id === conversationId)
      setConversation(conv ?? null)
      setMessages(msgs)
    } catch {
      router.push('/mensagens')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!text.trim() || isSending) return
    const msg = text.trim()
    setText('')
    setIsSending(true)
    try {
      const { message } = await conversationsApi.sendMessage(conversationId, msg)
      setMessages(prev => [...prev, message])
    } catch {
      setText(msg)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const formatTime = (date: any) => {
    const ts = date?._seconds ? date._seconds * 1000 : new Date(date).getTime()
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDateLabel = (date: any) => {
    const ts = date?._seconds ? date._seconds * 1000 : new Date(date).getTime()
    return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const getOtherParticipant = () => {
    if (!conversation || !user) return null
    const otherId = conversation.participantIds.find(id => id !== user.id)
    return otherId ? conversation.participants[otherId] : null
  }

  // Group messages by date for date separators
  const messageGroups: { date: string; messages: Message[] }[] = []
  for (const msg of messages) {
    const label = formatDateLabel(msg.createdAt)
    const last = messageGroups[messageGroups.length - 1]
    if (last?.date === label) last.messages.push(msg)
    else messageGroups.push({ date: label, messages: [msg] })
  }

  const other = getOtherParticipant()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30 flex flex-col">
        <div className="container mx-auto px-4 max-w-2xl flex flex-col flex-1 py-4 gap-0">

          {/* Header */}
          <div className="flex items-center gap-3 bg-card border rounded-t-lg px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/mensagens')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary">
                {other?.name?.charAt(0).toUpperCase() ?? '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{other?.name ?? 'Carregando...'}</p>
              {conversation?.relatedAnnouncementTitle && (
                <Badge variant="outline" className="text-xs">
                  {conversation.relatedAnnouncementTitle}
                </Badge>
              )}
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 bg-card border-x overflow-y-auto p-4 space-y-1 min-h-[400px] max-h-[60vh]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">Nenhuma mensagem ainda. Diga olá!</p>
              </div>
            ) : (
              messageGroups.map(group => (
                <div key={group.date}>
                  <div className="flex items-center gap-2 my-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">{group.date}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  {group.messages.map(msg => {
                    const isOwn = msg.senderId === user?.id
                    return (
                      <div key={msg.id} className={`flex mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                            isOwn
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-medium mb-0.5 opacity-70">{msg.senderName}</p>
                          )}
                          <p className="break-words">{msg.text}</p>
                          <p className={`text-xs mt-0.5 text-right ${isOwn ? 'opacity-70' : 'text-muted-foreground'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="bg-card border border-t-0 rounded-b-lg px-4 py-3 flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!text.trim() || isSending} size="icon">
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
