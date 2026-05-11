'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  Plus,
  Heart,
  Inbox,
  Send,
  Settings,
  Loader2,
  MapPin,
  BadgeCheck,
  Star,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Navbar } from '@/src/components/layout/navbar'
import { Footer } from '@/src/components/layout/footer'
import { AnnouncementCard, AnnouncementCardSkeleton } from '@/src/components/marketplace'
import { authApi, announcementsApi, requestsApi, usersApi, conversationsApi } from '@/src/lib/api'
import { getAuth, saveAuth, clearAuth } from '@/src/lib/auth'
import { brazilianStates } from '@/src/utils/validations'
import type { User as UserType, Announcement, ServiceRequest, RequestStatus } from '@/src/types'

const statusLabels: Record<RequestStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendente: { label: 'Pendente', variant: 'secondary' },
  aceita: { label: 'Aceita', variant: 'default' },
  recusada: { label: 'Recusada', variant: 'destructive' },
  cancelada: { label: 'Cancelada', variant: 'outline' },
  concluida: { label: 'Concluída', variant: 'default' },
}

export default function PerfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<Omit<UserType, 'passwordHash'> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('anuncios')

  // Data states
  const [myAnnouncements, setMyAnnouncements] = useState<Announcement[]>([])
  const [savedAnnouncements, setSavedAnnouncements] = useState<Announcement[]>([])
  const [receivedRequests, setReceivedRequests] = useState<ServiceRequest[]>([])
  const [sentRequests, setSentRequests] = useState<ServiceRequest[]>([])

  // Loading states
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false)
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [loadingReceived, setLoadingReceived] = useState(false)
  const [loadingSent, setLoadingSent] = useState(false)

  // Edit profile
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    farmName: '',
    city: '',
    state: '',
  })

  // Action states
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { token, user } = getAuth()
      if (!token || !user) {
        toast.error('Faça login para acessar seu perfil')
        router.push('/login')
        return
      }

      try {
        const { user: freshUser } = await authApi.me()
        setUser(freshUser)
        setEditForm({
          name: freshUser.name,
          farmName: freshUser.farmName || '',
          city: freshUser.city,
          state: freshUser.state,
        })
      } catch {
        clearAuth()
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!user) return

    switch (activeTab) {
      case 'anuncios':
        loadMyAnnouncements()
        break
      case 'salvos':
        loadSavedAnnouncements()
        break
      case 'recebidas':
        loadReceivedRequests()
        break
      case 'enviadas':
        loadSentRequests()
        break
    }
  }, [activeTab, user])

  const loadMyAnnouncements = async () => {
    setLoadingAnnouncements(true)
    try {
      const { announcements } = await announcementsApi.getMy()
      setMyAnnouncements(announcements)
    } catch (error) {
      console.error('Error loading announcements:', error)
    } finally {
      setLoadingAnnouncements(false)
    }
  }

  const loadSavedAnnouncements = async () => {
    setLoadingSaved(true)
    try {
      const { announcements } = await announcementsApi.getSaved()
      setSavedAnnouncements(announcements)
    } catch (error) {
      console.error('Error loading saved:', error)
    } finally {
      setLoadingSaved(false)
    }
  }

  const loadReceivedRequests = async () => {
    setLoadingReceived(true)
    try {
      const { requests } = await requestsApi.getReceived()
      setReceivedRequests(requests)
    } catch (error) {
      console.error('Error loading received:', error)
    } finally {
      setLoadingReceived(false)
    }
  }

  const loadSentRequests = async () => {
    setLoadingSent(true)
    try {
      const { requests } = await requestsApi.getSent()
      setSentRequests(requests)
    } catch (error) {
      console.error('Error loading sent:', error)
    } finally {
      setLoadingSent(false)
    }
  }

  const handleStartChatFromRequest = async (recipientId: string, announcementTitle: string) => {
    try {
      const { conversation } = await conversationsApi.create({
        recipientId,
        relatedAnnouncementTitle: announcementTitle,
      })
      router.push(`/mensagens/${conversation.id}`)
    } catch {
      toast.error('Erro ao abrir conversa')
    }
  }

  const handleUpdateRequestStatus = async (requestId: string, status: RequestStatus) => {
    setUpdatingRequestId(requestId)
    try {
      await requestsApi.updateStatus(requestId, status)
      toast.success(`Solicitação ${statusLabels[status].label.toLowerCase()}!`)
      loadReceivedRequests()
      loadSentRequests()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar status')
    } finally {
      setUpdatingRequestId(null)
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este anúncio?')) return

    try {
      await announcementsApi.delete(id)
      toast.success('Anúncio excluído!')
      loadMyAnnouncements()
    } catch (error) {
      toast.error('Erro ao excluir anúncio')
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const { user: updatedUser } = await usersApi.updateMe(editForm)
      setUser(updatedUser)
      const { token } = getAuth()
      if (token) {
        saveAuth(token, updatedUser)
      }
      toast.success('Perfil atualizado!')
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    {user.isVerified && <BadgeCheck className="h-5 w-5 text-primary" />}
                  </div>
                  {user.farmName && (
                    <p className="text-muted-foreground">{user.farmName}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.city}, {user.state}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {user.role === 'produtor' ? 'Produtor Rural' : 'Prestador de Serviços'}
                    </span>
                    {user.avgRating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {user.avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <Button asChild>
                  <Link href="/anuncio/criar">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Anúncio
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="anuncios" className="gap-2">
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Meus Anúncios</span>
              </TabsTrigger>
              <TabsTrigger value="salvos" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Salvos</span>
              </TabsTrigger>
              <TabsTrigger value="recebidas" className="gap-2">
                <Inbox className="h-4 w-4" />
                <span className="hidden sm:inline">Recebidas</span>
              </TabsTrigger>
              <TabsTrigger value="enviadas" className="gap-2">
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Enviadas</span>
              </TabsTrigger>
              <TabsTrigger value="perfil" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Editar Perfil</span>
              </TabsTrigger>
            </TabsList>

            {/* My Announcements */}
            <TabsContent value="anuncios" className="mt-6">
              {loadingAnnouncements ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <AnnouncementCardSkeleton key={i} />
                  ))}
                </div>
              ) : myAnnouncements.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Você ainda não criou nenhum anúncio</p>
                  <Button asChild>
                    <Link href="/anuncio/criar">Criar meu primeiro anúncio</Link>
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="relative group">
                      <AnnouncementCard announcement={announcement} />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault()
                            handleDeleteAnnouncement(announcement.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {!announcement.isActive && (
                        <Badge variant="destructive" className="absolute top-2 left-2">
                          Inativo
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Saved */}
            <TabsContent value="salvos" className="mt-6">
              {loadingSaved ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <AnnouncementCardSkeleton key={i} />
                  ))}
                </div>
              ) : savedAnnouncements.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Você ainda não salvou nenhum anúncio</p>
                  <Button asChild variant="outline">
                    <Link href="/marketplace">Explorar marketplace</Link>
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedAnnouncements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Received Requests */}
            <TabsContent value="recebidas" className="mt-6">
              {loadingReceived ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-5 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : receivedRequests.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Você ainda não recebeu nenhuma solicitação</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {receivedRequests.map((request) => (
                    <Card key={request.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {request.announcementSnapshot.title}
                            </CardTitle>
                            <CardDescription>
                              Solicitado por {request.requesterSnapshot.name} - {request.requesterSnapshot.city}, {request.requesterSnapshot.state}
                            </CardDescription>
                          </div>
                          <Badge variant={statusLabels[request.status].variant}>
                            {statusLabels[request.status].label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{request.message}</p>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(request.createdAt)}
                          </span>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartChatFromRequest(request.requesterId, request.announcementSnapshot.title)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                            {request.status === 'pendente' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateRequestStatus(request.id, 'recusada')}
                                  disabled={updatingRequestId === request.id}
                                >
                                  {updatingRequestId === request.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <X className="h-4 w-4 mr-1" />
                                      Recusar
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateRequestStatus(request.id, 'aceita')}
                                  disabled={updatingRequestId === request.id}
                                >
                                  {updatingRequestId === request.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 mr-1" />
                                      Aceitar
                                    </>
                                  )}
                                </Button>
                              </>
                            )}
                            {request.status === 'aceita' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateRequestStatus(request.id, 'concluida')}
                                disabled={updatingRequestId === request.id}
                              >
                                {updatingRequestId === request.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Marcar como concluída'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Sent Requests */}
            <TabsContent value="enviadas" className="mt-6">
              {loadingSent ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-5 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : sentRequests.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Você ainda não enviou nenhuma solicitação</p>
                  <Button asChild variant="outline">
                    <Link href="/marketplace">Encontrar serviços</Link>
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <Card key={request.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {request.announcementSnapshot.title}
                            </CardTitle>
                            <CardDescription>
                              Prestador: {request.providerSnapshot.name} - {request.providerSnapshot.city}, {request.providerSnapshot.state}
                            </CardDescription>
                          </div>
                          <Badge variant={statusLabels[request.status].variant}>
                            {statusLabels[request.status].label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{request.message}</p>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(request.createdAt)}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartChatFromRequest(request.providerId, request.announcementSnapshot.title)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                            {request.status === 'pendente' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateRequestStatus(request.id, 'cancelada')}
                                disabled={updatingRequestId === request.id}
                              >
                                {updatingRequestId === request.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    Cancelando...
                                  </>
                                ) : (
                                  'Cancelar solicitação'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Edit Profile */}
            <TabsContent value="perfil" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Editar Perfil</CardTitle>
                  <CardDescription>Atualize suas informações pessoais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      disabled={isSaving}
                    />
                  </div>

                  {user.role === 'produtor' && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-farmName">Nome da Fazenda</Label>
                      <Input
                        id="edit-farmName"
                        value={editForm.farmName}
                        onChange={(e) => setEditForm({ ...editForm, farmName: e.target.value })}
                        disabled={isSaving}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-city">Cidade</Label>
                      <Input
                        id="edit-city"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-state">Estado</Label>
                      <Select
                        value={editForm.state}
                        onValueChange={(value) => setEditForm({ ...editForm, state: value })}
                        disabled={isSaving}
                      >
                        <SelectTrigger id="edit-state">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {brazilianStates.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar Alterações'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
