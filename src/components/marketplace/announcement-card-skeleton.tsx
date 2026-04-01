import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

export function AnnouncementCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="aspect-video w-full" />

      <CardContent className="p-4">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-1/2 mt-1" />

        {/* Price */}
        <Skeleton className="h-7 w-32 mt-3" />

        {/* Location */}
        <Skeleton className="h-4 w-40 mt-3" />
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0">
        <div className="w-full flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
