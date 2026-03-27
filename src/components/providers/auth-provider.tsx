'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getAuth, saveAuth, clearAuth } from '@/src/lib/auth'
import type { User } from '@/src/types'

interface AuthContextType {
  user: Omit<User, 'passwordHash'> | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: Omit<User, 'passwordHash'>) => void
  logout: () => void
  updateUser: (user: Omit<User, 'passwordHash'>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'passwordHash'> | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { token, user } = getAuth()
    setToken(token)
    setUser(user)
    setIsLoading(false)
  }, [])

  const login = (newToken: string, newUser: Omit<User, 'passwordHash'>) => {
    saveAuth(newToken, newUser)
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    clearAuth()
    setToken(null)
    setUser(null)
  }

  const updateUser = (updatedUser: Omit<User, 'passwordHash'>) => {
    if (token) {
      saveAuth(token, updatedUser)
    }
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
