'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  MapPin, 
  Star, 
  BadgeCheck, 
  Heart, 
  Share2, 
  ArrowLeft,
  Loader2,
  MessageSquare,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Navbar } from '@/src/components/layout/navbar'
import { Footer } from '@/src/components/layout/footer'
import { announcementsApi, requestsApi } from '@/src/lib/api'
import { getAuth } from '@/src/lib/auth'
import { categories, chargeTypes } from '@/src/utils/validations'
import type { Announcement } from '@/src/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AnuncioPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const { token, user } = getAuth()
  const isOwner = user?.id === announcement?.userId

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const { announcement } = await announcementsApi.get(id)
        setAnnouncement(announcement)
      } catch (error) {
        console.error('Error fetching announcement:', error)
        toast.error('Erro ao carregar anúncio')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncement()
  }, [id])

  const handleSave = async () => {
    if (!token) {
      toast.error('Faça login para salvar anúncios')
      router.push('/login')
      return
    }

    setIsSaving(true)
    try {
      const { saved } = await announcementsApi.save(id)
      setIsSaved(saved)
      toast.success(saved ? 'Anúncio salvo!' : 'Anúncio removido dos salvos')
    } catch (error) {
      toast.error('Erro ao salvar anúncio')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRequest = async () => {
    if (!token) {
      toast.error('Faça login para solicitar serviços')
      router.push('/login')
      return
    }

    if (requestMessage.length < 10) {
      toast.error('Mensagem deve ter no mínimo 10 caracteres')
      return
    }

    setIsSubmitting(true)
    try {
      await requestsApi.create({
        announcementId: id,
        message: requestMessage,
      })
      toast.success('Solicitação enviada com sucesso!')
      setIsRequestOpen(false)
      setRequestMessage('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar solicitação')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
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

  if (!announcement) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Anúncio não encontrado</h1>
            <p className="text-muted-foreground mb-4">Este anúncio pode ter sido removido ou não existe.</p>
            <Button asChild>
              <Link href="/marketplace">Voltar ao Marketplace</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const category = categories.find(c => c.value === announcement.category)
  const chargeType = chargeTypes.find(c => c.value === announcement.chargeType)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          {/* Back button */}
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/marketplace">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Marketplace
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card className="overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  {announcement.imageUrls.length > 0 ? (
                    <>
                      <img
                        src={announcement.imageUrls[currentImageIndex]}
                        alt={announcement.title}
                        className="w-full h-full object-cover"
                      />
                      {announcement.imageUrls.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {announcement.imageUrls.map((_, index) => (
                            <button
                              key={index}
                              className={`h-2 w-2 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl text-muted-foreground/30">
                        {category?.icon === 'Tractor' && '🚜'}
                        {category?.icon === 'ClipboardList' && '📋'}
                        {category?.icon === 'Stethoscope' && '🩺'}
                        {category?.icon === 'Leaf' && '🌱'}
                        {category?.icon === 'Truck' && '🚚'}
                        {category?.icon === 'Wrench' && '🔧'}
                      </span>
                    </div>
                  )}
                </div>
                {announcement.imageUrls.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {announcement.imageUrls.map((url, index) => (
                      <button
                        key={index}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex ? 'border-primary' : 'border-transparent'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {/* Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {category?.label}
                      </Badge>
                      <CardTitle className="text-2xl">{announcement.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={handleSave} disabled={isSaving}>
                        <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Descrição</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {announcement.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {announcement.city}, {announcement.state}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Publicado em {formatDate(announcement.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(announcement.price)}
                  </div>
                  <div className="text-muted-foreground">
                    {chargeType?.label}
                  </div>

                  {!isOwner && (
                    <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full mt-4" size="lg">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Solicitar Serviço
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Solicitar Serviço</DialogTitle>
                          <DialogDescription>
                            Envie uma mensagem para o prestador explicando sua necessidade.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="message">Mensagem</Label>
                            <Textarea
                              id="message"
                              placeholder="Descreva sua necessidade, local, data desejada..."
                              value={requestMessage}
                              onChange={(e) => setRequestMessage(e.target.value)}
                              rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                              Mínimo 10 caracteres
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsRequestOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleRequest} disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              'Enviar Solicitação'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {isOwner && (
                    <Button className="w-full mt-4" variant="outline" asChild>
                      <Link href="/perfil">Gerenciar Anúncio</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Provider Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Anunciante</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {announcement.userSnapshot.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold flex items-center gap-1">
                        {announcement.userSnapshot.name}
                        {announcement.userSnapshot.isVerified && (
                          <BadgeCheck className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      {announcement.userSnapshot.farmName && (
                        <div className="text-sm text-muted-foreground">
                          {announcement.userSnapshot.farmName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{announcement.userSnapshot.city}, {announcement.userSnapshot.state}</span>
                    </div>
                    {announcement.userSnapshot.avgRating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{announcement.userSnapshot.avgRating.toFixed(1)} de avaliação</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
