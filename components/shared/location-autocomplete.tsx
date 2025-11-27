'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Loader2, MapPin } from 'lucide-react'

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google?: typeof google
  }
}

export interface LocationData {
  formatted: string
  city: string | null
  state: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  placeId: string | null
}

interface LocationAutocompleteProps {
  value: string
  onChange: (location: LocationData) => void
  placeholder?: string
  className?: string
  error?: string
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Search for a location...",
  className = "",
  error
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = async () => {
      if (typeof window === 'undefined' || window.google?.maps) {
        setIsLoaded(true)
        return
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.error('Google Maps API key not found')
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setIsLoaded(true)
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return

    // Initialize autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'in' }, // Restrict to India
      fields: ['formatted_address', 'address_components', 'geometry', 'place_id']
    })

    // Listen for place selection
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace()
      
      if (!place || !place.geometry) {
        return
      }

      // Extract location components
      let city: string | null = null
      let state: string | null = null
      let country: string | null = null

      place.address_components?.forEach((component: google.maps.GeocoderAddressComponent) => {
        if (component.types.includes('locality')) {
          city = component.long_name
        } else if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name
        } else if (component.types.includes('country')) {
          country = component.long_name
        }
      })

      const locationData: LocationData = {
        formatted: place.formatted_address || '',
        city,
        state,
        country,
        latitude: place.geometry.location?.lat() || null,
        longitude: place.geometry.location?.lng() || null,
        placeId: place.place_id || null
      }

      onChange(locationData)
    })

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, onChange])

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        {!isLoaded ? (
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        ) : (
          <MapPin className="w-5 h-5 text-gray-400" />
        )}
      </div>
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        defaultValue={value}
        className={`pl-11 ${className}`}
        disabled={!isLoaded}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  )
}
