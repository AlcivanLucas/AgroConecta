'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Tractor, Loader2, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { authApi } from '@/src/lib/api'
import { saveAuth } from '@/src/lib/auth'
import { brazilianStates } from '@/src/utils/validations'
import type { UserRole } from '@/src/types'

const steps = [
  { id: 1, title: 'Perfil', description: 'Escolha seu tipo de conta' },
  { id: 2, title: 'Dados', description: 'Informações pessoais' },
  { id: 3, title: 'Localização', description: 'Sua localização' },
]

export default function CadastroPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
    farmName: '',
    city: '',
    state: '',
    cnpj: '',
    crea: '',
  })

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.role !== ''
      case 2:
        return (
          formData.name.length >= 3 &&
          formData.email.includes('@') &&
          formData.password.length >= 6 &&
          formData.password === formData.confirmPassword
        )
      case 3:
        return formData.city.length >= 2 && formData.state.length === 2
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canProceed()) return

    setIsLoading(true)
    try {
      const { token, user } = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        farmName: formData.farmName || undefined,
        city: formData.city,
        state: formData.state,
        cnpj: formData.cnpj || undefined,
        crea: formData.crea || undefined,
      })
      saveAuth(token, user)
      toast.success('Cadastro realizado com sucesso!')
      router.push('/marketplace')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Tractor className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">AgroConecta</span>
          </Link>

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
                      className={`h-1 w-12 sm:w-20 mx-2 rounded ${
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
              <CardTitle className="text-2xl">
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>
                {steps[currentStep - 1].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Step 1 - Profile */}
                {currentStep === 1 && (
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                    className="grid gap-4"
                  >
                    <Label
                      htmlFor="produtor"
                      className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.role === 'produtor' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                    >
                      <RadioGroupItem value="produtor" id="produtor" className="mt-1" />
                      <div>
                        <div className="font-medium">Produtor Rural</div>
                        <div className="text-sm text-muted-foreground">
                          Busco serviços para minha fazenda ou propriedade rural
                        </div>
                      </div>
                    </Label>
                    <Label
                      htmlFor="prestador"
                      className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.role === 'prestador' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                    >
                      <RadioGroupItem value="prestador" id="prestador" className="mt-1" />
                      <div>
                        <div className="font-medium">Prestador de Serviços</div>
                        <div className="text-sm text-muted-foreground">
                          Ofereço serviços especializados para o setor agropecuário
                        </div>
                      </div>
                    </Label>
                  </RadioGroup>
                )}

                {/* Step 2 - Personal Data */}
                {currentStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        placeholder="Seu nome completo"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 6 caracteres"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repita a senha"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-sm text-destructive">As senhas não coincidem</p>
                      )}
                    </div>

                    {formData.role === 'produtor' && (
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Nome da fazenda (opcional)</Label>
                        <Input
                          id="farmName"
                          placeholder="Ex: Fazenda Santa Maria"
                          value={formData.farmName}
                          onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                        />
                      </div>
                    )}

                    {formData.role === 'prestador' && (
                      <div className="space-y-2">
                        <Label htmlFor="crea">CREA / Registro profissional (opcional)</Label>
                        <Input
                          id="crea"
                          placeholder="Ex: CREA-SP 123456"
                          value={formData.crea}
                          onChange={(e) => setFormData({ ...formData, crea: e.target.value })}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Step 3 - Location */}
                {currentStep === 3 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        placeholder="Sua cidade"
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

                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                      <Input
                        id="cnpj"
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      />
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
                  {currentStep < 3 ? (
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
                          Criando conta...
                        </>
                      ) : (
                        'Criar conta'
                      )}
                    </Button>
                  )}
                </div>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Já tem uma conta? </span>
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Faça login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Image/Background */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-lg text-primary-foreground">
          <h2 className="text-3xl font-bold">Junte-se ao AgroConecta</h2>
          <p className="mt-4 text-lg opacity-90">
            Crie sua conta gratuitamente e comece a conectar-se com milhares de produtores e prestadores de serviços em todo o Brasil.
          </p>
          <ul className="mt-8 space-y-4">
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5" />
              <span>Cadastro 100% gratuito</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5" />
              <span>Anuncie seus serviços</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5" />
              <span>Encontre profissionais qualificados</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5" />
              <span>Gerencie suas solicitações</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
