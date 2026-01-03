'use client'

import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LocationLinkProps {
  location: string
  latitude?: string | number | null
  longitude?: string | number | null
  placeId?: string | null
  className?: string
  showIcon?: boolean
}

export function LocationLink({
  location,
  latitude,
  longitude,
  placeId,
  className,
  showIcon = true
}: LocationLinkProps) {
  // Generate Google Maps URL
  const getGoogleMapsUrl = () => {
    // If we have coordinates, use them for precise location
    if (latitude && longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    }
    // If we have a place ID, use it for better accuracy
    if (placeId) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}&query_place_id=${placeId}`
    }
    // Fallback to address search
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
  }

  return (
    <a
      href={getGoogleMapsUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 hover:text-blue-600 hover:underline transition-colors cursor-pointer",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="wrap-break-word">{location}</span>
      {showIcon && <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />}
    </a>
  )
}
