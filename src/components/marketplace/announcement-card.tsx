import Link from 'next/link'
import { MapPin, Star, BadgeCheck, Clock } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Announcement } from '@/src/types'
import { categories, chargeTypes } from '@/src/utils/validations'

interface AnnouncementCardProps {
  announcement: Announcement
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const category = categories.find(c => c.value === announcement.category)
  const chargeType = chargeTypes.find(c => c.value === announcement.chargeType)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  return (
    <Link href={`/anuncio/${announcement.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
        {/* Image */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {announcement.imageUrls.length > 0 ? (
            <img
              src={announcement.imageUrls[0]}
              alt={announcement.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <span className="text-4xl text-primary/30">
                {category?.icon === 'Tractor' && '🚜'}
                {category?.icon === 'ClipboardList' && '📋'}
                {category?.icon === 'Stethoscope' && '🩺'}
                {category?.icon === 'Leaf' && '🌱'}
                {category?.icon === 'Truck' && '🚚'}
                {category?.icon === 'Wrench' && '🔧'}
              </span>
            </div>
          )}
          <Badge className="absolute top-2 left-2" variant="secondary">
            {category?.label}
          </Badge>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {announcement.title}
          </h3>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-primary">
              {formatPrice(announcement.price)}
            </span>
            <span className="text-sm text-muted-foreground">
              / {chargeType?.label.toLowerCase().replace('por ', '')}
            </span>
          </div>

          {/* Location */}
          <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{announcement.city}, {announcement.state}</span>
          </div>
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0">
          {/* Provider info */}
          <div className="w-full flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {announcement.userSnapshot.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium flex items-center gap-1">
                  {announcement.userSnapshot.name.split(' ')[0]}
                  {announcement.userSnapshot.isVerified && (
                    <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                  )}
                </span>
                {announcement.userSnapshot.avgRating > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {announcement.userSnapshot.avgRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {(() => {
                  const raw = announcement.createdAt as any
                  const ms = raw?._seconds ? raw._seconds * 1000 : new Date(raw).getTime()
                  return new Date(ms).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                })()}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
