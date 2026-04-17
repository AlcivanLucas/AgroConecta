'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Loader2,
  ImagePlus,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Navbar } from '@/src/components/layout/navbar'
import { Footer } from '@/src/components/layout/footer'
import { announcementsApi } from '@/src/lib/api'
import { getAuth } from '@/src/lib/auth'
import { categories, chargeTypes, brazilianStates } from '@/src/utils/validations'
import type { AnnouncementCategory, ChargeType } from '@/src/types'

const steps = [
  { id: 1, title: 'Categoria', description: 'Selecione a categoria' },
  { id: 2, title: 'Detalhes', description: 'Informações do serviço' },
  { id: 3, title: 'Preço', description: 'Defina o valor' },
  { id: 4, title: 'Localização', description: 'Onde você atende' },
]

export default function CriarAnuncioPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    chargeType: '' as ChargeType | '',
    category: '' as AnnouncementCategory | '',
    city: '',
    state: '',
    imageUrls: [] as string[],
  })

  // Check auth on mount
  useEffect(() => {
    const { token } = getAuth()
    if (!token) {
      toast.error('Faça login para criar um anúncio')
      router.push('/login')
    }
  }, [router])

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.category !== ''
      case 2:
        return formData.title.length >= 5 && formData.description.length >= 20
      case 3:
        return parseFloat(formData.price) > 0 && formData.chargeType !== ''
      case 4:
        return formData.city.length >= 2 && formData.state.length === 2
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAddImageUrl = () => {
    const url = prompt('Digite a URL da imagem:')
    if (url && url.startsWith('http')) {
      setFormData({
        ...formData,
        imageUrls: [...formData.imageUrls, url],
      })
    } else if (url) {
      toast.error('URL inválida. A URL deve começar com http:// ou https://')
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canProceed()) return

    setIsLoading(true)
    try {
      await announcementsApi.create({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        chargeType: formData.chargeType,
        category: formData.category,
        city: formData.city,
        state: formData.state,
        imageUrls: formData.imageUrls,
      })
      toast.success('Anúncio criado com sucesso!')
      router.push('/perfil')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar anúncio')
    } finally {
      setIsLoading(false)
    }
  }

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

          <div className="max-w-2xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          currentStep > step.id
                            ? 'bg-primary text-primary-foreground'
                            : currentStep === step.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                      </div>
                      <span className="mt-2 text-xs text-muted-foreground hidden sm:block">
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 w-8 sm:w-16 mx-2 rounded ${
                          currentStep > step.id ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>{steps[currentStep - 1].description}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1 - Category */}
                  {currentStep === 1 && (
                    <RadioGroup
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as AnnouncementCategory })}
                      className="grid gap-4 md:grid-cols-2"
                    >
                      {categories.map((cat) => (
                        <Label
                          key={cat.value}
                          htmlFor={cat.value}
                          className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                            formData.category === cat.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                          }`}
                        >
                          <RadioGroupItem value={cat.value} id={cat.value} className="mt-1" />
                          <div>
                            <div className="font-medium">{cat.label}</div>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  )}

                  {/* Step 2 - Details */}
                  {currentStep === 2 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="title">Título do anúncio</Label>
                        <Input
                          id="title"
                          placeholder="Ex: Aluguel de colheitadeira com operador"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Mínimo 5 caracteres</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          placeholder="Descreva detalhadamente seu serviço, equipamentos disponíveis, experiência..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={5}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.description.length}/20 caracteres mínimos
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Imagens (opcional)</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {formData.imageUrls.map((url, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          {formData.imageUrls.length < 4 && (
                            <button
                              type="button"
                              className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center hover:bg-muted/50 transition-colors"
                              onClick={handleAddImageUrl}
                            >
                              <ImagePlus className="h-6 w-6 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Adicione URLs de imagens (máximo 4)
                        </p>
                      </div>
                    </>
                  )}

                  {/* Step 3 - Price */}
                  {currentStep === 3 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="price">Valor</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            R$
                          </span>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            className="pl-10"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Tipo de cobrança</Label>
                        <RadioGroup
                          value={formData.chargeType}
                          onValueChange={(value) => setFormData({ ...formData, chargeType: value as ChargeType })}
                          className="grid gap-3 md:grid-cols-2"
                        >
                          {chargeTypes.map((type) => (
                            <Label
                              key={type.value}
                              htmlFor={type.value}
                              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                formData.chargeType === type.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                              }`}
                            >
                              <RadioGroupItem value={type.value} id={type.value} />
                              <span>{type.label}</span>
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>
                    </>
                  )}

                  {/* Step 4 - Location */}
                  {currentStep === 4 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          placeholder="Cidade onde você atende"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Select
                          value={formData.state}
                          onValueChange={(value) => setFormData({ ...formData, state: value })}
                        >
                          <SelectTrigger id="state">
                            <SelectValue placeholder="Selecione o estado" />
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
                    </>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-4">
                    {currentStep > 1 && (
                      <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Voltar
                      </Button>
                    )}
                    {currentStep < 4 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="flex-1"
                      >
                        Próximo
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isLoading || !canProceed()} className="flex-1">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          'Criar Anúncio'
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
