'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut, Tractor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getAuth, clearAuth } from '@/src/lib/auth'
import type { User as UserType } from '@/src/types'

export function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<Omit<UserType, 'passwordHash'> | null>(null)

  useEffect(() => {
    const { user } = getAuth()
    setUser(user)
  }, [pathname])

  const handleLogout = () => {
    clearAuth()
    setUser(null)
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/marketplace', label: 'Marketplace' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Tractor className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">AgroConecta</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === href ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  {user.name.split(' ')[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/perfil" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/anuncio/criar" className="cursor-pointer">
                    <Tractor className="mr-2 h-4 w-4" />
                    Criar Anúncio
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/cadastro">Cadastrar</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-card">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <hr className="my-2" />
            {user ? (
              <>
                <Link
                  href="/perfil"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Meu Perfil
                </Link>
                <Link
                  href="/anuncio/criar"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Criar Anúncio
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 text-left"
                >
                  Sair
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/cadastro">Cadastrar</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
