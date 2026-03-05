import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  role: z.enum(['produtor', 'prestador'], { required_error: 'Selecione um perfil' }),
  farmName: z.string().optional(),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  cnpj: z.string().optional(),
  crea: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

export const announcementSchema = z.object({
  title: z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  description: z.string().min(20, 'Descrição deve ter no mínimo 20 caracteres'),
  price: z.number().positive('Preço deve ser maior que zero'),
  chargeType: z.enum(['hora', 'dia', 'servico', 'hectare'], { required_error: 'Selecione o tipo de cobrança' }),
  category: z.enum(['mecanizacao', 'consultoria', 'veterinaria', 'agronomia', 'transporte', 'manutencao'], {
    required_error: 'Selecione uma categoria',
  }),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  imageUrls: z.array(z.string().url()).optional().default([]),
})

export const serviceRequestSchema = z.object({
  message: z.string().min(10, 'Mensagem deve ter no mínimo 10 caracteres'),
  announcementId: z.string().min(1, 'Anúncio é obrigatório'),
})

export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  farmName: z.string().optional(),
  city: z.string().min(2, 'Cidade é obrigatória').optional(),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  cnpj: z.string().optional(),
  crea: z.string().optional(),
})

// Brazilian states
export const brazilianStates = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

// Categories
export const categories = [
  { value: 'mecanizacao', label: 'Mecanização', icon: 'Tractor' },
  { value: 'consultoria', label: 'Consultoria', icon: 'ClipboardList' },
  { value: 'veterinaria', label: 'Veterinária', icon: 'Stethoscope' },
  { value: 'agronomia', label: 'Agronomia', icon: 'Leaf' },
  { value: 'transporte', label: 'Transporte', icon: 'Truck' },
  { value: 'manutencao', label: 'Manutenção', icon: 'Wrench' },
]

// Charge types
export const chargeTypes = [
  { value: 'hora', label: 'Por hora' },
  { value: 'dia', label: 'Por dia' },
  { value: 'servico', label: 'Por serviço' },
  { value: 'hectare', label: 'Por hectare' },
]
