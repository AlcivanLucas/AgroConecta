import { getAuth } from './auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

interface FetchOptions extends RequestInit {
  authenticated?: boolean
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { authenticated = false, ...fetchOptions } = options
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  if (authenticated) {
    const { token } = getAuth()
    if (token) {
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
    throw new Error(error.message || `Erro ${response.status}`)
  }

  return response.json()
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: any) =>
    apiFetch<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () =>
    apiFetch<{ user: any }>('/auth/me', {
      authenticated: true,
    }),
}

// Announcements API
export const announcementsApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return apiFetch<{ announcements: any[] }>(`/announcements${query}`)
  },

  get: (id: string) =>
    apiFetch<{ announcement: any }>(`/announcements/${id}`),

  create: (data: any) =>
    apiFetch<{ announcement: any }>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
      authenticated: true,
    }),

  update: (id: string, data: any) =>
    apiFetch<{ announcement: any }>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      authenticated: true,
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/announcements/${id}`, {
      method: 'DELETE',
      authenticated: true,
    }),

  save: (id: string) =>
    apiFetch<{ saved: boolean }>(`/announcements/${id}/save`, {
      method: 'POST',
      authenticated: true,
    }),

  getSaved: () =>
    apiFetch<{ announcements: any[] }>('/announcements/saved', {
      authenticated: true,
    }),

  getMy: () =>
    apiFetch<{ announcements: any[] }>('/announcements/my', {
      authenticated: true,
    }),
}

// Requests API
export const requestsApi = {
  create: (data: { announcementId: string; message: string }) =>
    apiFetch<{ request: any }>('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
      authenticated: true,
    }),

  getReceived: () =>
    apiFetch<{ requests: any[] }>('/requests/received', {
      authenticated: true,
    }),

  getSent: () =>
    apiFetch<{ requests: any[] }>('/requests/sent', {
      authenticated: true,
    }),

  updateStatus: (id: string, status: string) =>
    apiFetch<{ request: any }>(`/requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      authenticated: true,
    }),
}

// Conversations API
export const conversationsApi = {
  list: () =>
    apiFetch<{ conversations: any[] }>('/conversations', { authenticated: true }),

  create: (data: { recipientId: string; relatedAnnouncementId?: string; relatedAnnouncementTitle?: string }) =>
    apiFetch<{ conversation: any }>('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
      authenticated: true,
    }),

  getMessages: (conversationId: string) =>
    apiFetch<{ messages: any[] }>(`/conversations/${conversationId}/messages`, { authenticated: true }),

  sendMessage: (conversationId: string, text: string) =>
    apiFetch<{ message: any }>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
      authenticated: true,
    }),
}

// Users API
export const usersApi = {
  updateMe: (data: any) =>
    apiFetch<{ user: any }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
      authenticated: true,
    }),
}
