// User types
export type UserRole = 'produtor' | 'prestador'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole
  farmName?: string
  city: string
  state: string
  cnpj?: string
  crea?: string
  isVerified: boolean
  avgRating: number
  totalRatings: number
  totalDeals: number
  createdAt: Date
  updatedAt: Date
}

export interface UserSnapshot {
  name: string
  farmName?: string
  avgRating: number
  isVerified: boolean
  city: string
  state: string
  role: UserRole
}

// Announcement types
export type ChargeType = 'hora' | 'dia' | 'servico' | 'hectare'

export type AnnouncementCategory =
  | 'mecanizacao'
  | 'consultoria'
  | 'veterinaria'
  | 'agronomia'
  | 'transporte'
  | 'manutencao'

export interface Announcement {
  id: string
  title: string
  description: string
  price: number
  chargeType: ChargeType
  category: AnnouncementCategory
  city: string
  state: string
  imageUrls: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
  userSnapshot: UserSnapshot
}

export interface AnnouncementSnapshot {
  title: string
  category: AnnouncementCategory
}

// Service Request types
export type RequestStatus = 'pendente' | 'aceita' | 'recusada' | 'cancelada' | 'concluida'

export interface ServiceRequest {
  id: string
  message: string
  status: RequestStatus
  createdAt: Date
  updatedAt: Date
  requesterId: string
  providerId: string
  announcementId: string
  requesterSnapshot: Omit<UserSnapshot, 'avgRating' | 'isVerified'>
  providerSnapshot: Omit<UserSnapshot, 'avgRating' | 'isVerified'>
  announcementSnapshot: AnnouncementSnapshot
}

// Saved Announcement
export interface SavedAnnouncement {
  id: string
  userId: string
  announcementId: string
  createdAt: Date
}

// API types
export interface AuthResponse {
  token: string
  user: Omit<User, 'passwordHash'>
}

export interface ApiError {
  error: string
  message: string
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  farmName?: string
  city: string
  state: string
  cnpj?: string
  crea?: string
}

export interface AnnouncementForm {
  title: string
  description: string
  price: number
  chargeType: ChargeType
  category: AnnouncementCategory
  city: string
  state: string
  imageUrls: string[]
}

export interface ServiceRequestForm {
  message: string
  announcementId: string
}

// Messaging types
export interface ConversationParticipant {
  name: string
  role: UserRole
  farmName?: string
}

export interface Conversation {
  id: string
  participantIds: string[]
  participants: Record<string, ConversationParticipant>
  lastMessage: string
  lastMessageAt: Date
  createdAt: Date
  relatedAnnouncementId?: string
  relatedAnnouncementTitle?: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  text: string
  createdAt: Date
}

// Filter types
export interface AnnouncementFilters {
  search?: string
  category?: AnnouncementCategory
  city?: string
  state?: string
}
