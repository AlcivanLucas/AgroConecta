'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Navbar } from '@/src/components/layout/navbar'
import { Footer } from '@/src/components/layout/footer'
import { AnnouncementCard, AnnouncementCardSkeleton } from '@/src/components/marketplace'
import { announcementsApi } from '@/src/lib/api'
import { categories, brazilianStates } from '@/src/utils/validations'
import type { Announcement } from '@/src/types'

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '')
  const [showFilters, setShowFilters] = useState(false)

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string> = {}
      if (searchTerm) params.search = searchTerm
      if (selectedCategory) params.category = selectedCategory
      if (selectedState) params.state = selectedState

      const { announcements } = await announcementsApi.list(params)
      setAnnouncements(announcements)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, selectedCategory, selectedState])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL()
    fetchAnnouncements()
  }

  const updateURL = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedState) params.set('state', selectedState)
    router.push(`/marketplace${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedState('')
    router.push('/marketplace')
  }

  const activeFiltersCount = [selectedCategory, selectedState].filter(Boolean).length

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        {/* Search Header */}
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Marketplace</h1>
            
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar serviços, equipamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Buscar</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </form>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex flex-wrap gap-4">
                  <div className="w-full sm:w-auto min-w-[200px]">
                    <label className="text-sm font-medium mb-1 block">Categoria</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas as categorias</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full sm:w-auto min-w-[200px]">
                    <label className="text-sm font-medium mb-1 block">Estado</label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os estados</SelectItem>
                        {brazilianStates.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end gap-2">
                    <Button variant="secondary" onClick={() => { updateURL(); fetchAnnouncements(); }}>
                      Aplicar
                    </Button>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Limpar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Category Quick Filters */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedCategory('')
                  router.push('/marketplace')
                }}
              >
                Todos
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(cat.value)
                    router.push(`/marketplace?category=${cat.value}`)
                  }}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <AnnouncementCardSkeleton key={i} />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum anúncio encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar seus filtros ou buscar por outros termos
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mb-6">
                {announcements.length} anúncio{announcements.length !== 1 ? 's' : ''} encontrado{announcements.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {announcements.map((announcement) => (
                  <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
