'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Loader2, MapPin } from 'lucide-react'

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google?: typeof google
    __googleMapsLoading?: boolean
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
  restrictToCities?: boolean // New prop to restrict to cities only
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Search for a location...",
  className = "",
  error,
  restrictToCities = false
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState(value)
  const [isLoaded, setIsLoaded] = useState(() => {
    // Initialize with loaded state if already available
    return typeof window !== 'undefined' && Boolean(window.google?.maps?.places)
  })
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // If already loaded, nothing to do
    if (window.google?.maps?.places) {
      return
    }

    // If currently loading, wait for it
    if (window.__googleMapsLoading) {
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          setIsLoaded(true)
          clearInterval(checkInterval)
        }
      }, 100)
      return () => clearInterval(checkInterval)
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      window.__googleMapsLoading = true
      existingScript.addEventListener('load', () => {
        window.__googleMapsLoading = false
        setIsLoaded(true)
      })
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('Google Maps API key not found')
      return
    }

    // Mark as loading
    window.__googleMapsLoading = true

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      window.__googleMapsLoading = false
      setIsLoaded(true)
    }
    script.onerror = () => {
      window.__googleMapsLoading = false
      console.error('Failed to load Google Maps API')
    }
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return

    const inputElement = inputRef.current

    // Initialize autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputElement, {
      types: restrictToCities ? ['(cities)'] : ['establishment', 'geocode'], // Conditionally restrict to cities
      componentRestrictions: { country: 'in' }, // Restrict to India
      fields: ['formatted_address', 'address_components', 'geometry', 'place_id']
    })

    // Fix z-index for autocomplete dropdown to appear above modals
    // Google Maps creates the dropdown with class 'pac-container'
    const fixZIndex = () => {
      const pacContainers = document.querySelectorAll('.pac-container')
      pacContainers.forEach((container) => {
        (container as HTMLElement).style.zIndex = '99999'
      })
    }
    
    // Fix immediately
    setTimeout(fixZIndex, 100)
    
    // Also fix when user focuses the input (dropdown appears)
    inputElement.addEventListener('focus', fixZIndex)
    
    // Set up observer to watch for dropdown creation
    const observer = new MutationObserver(fixZIndex)
    observer.observe(document.body, { childList: true, subtree: true })

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

      // Update the input value to show the selected location
      const displayValue = restrictToCities ? (city || place.formatted_address || '') : (place.formatted_address || '')
      setInputValue(displayValue)
      
      onChange(locationData)
    })

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
      observer.disconnect()
      inputElement.removeEventListener('focus', fixZIndex)
    }
  }, [isLoaded, onChange, restrictToCities])

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
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
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
