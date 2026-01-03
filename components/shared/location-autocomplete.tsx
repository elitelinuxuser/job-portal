'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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

type Suggestion = google.maps.places.AutocompleteSuggestion

interface PlaceAddressComponent {
  longText: string
  shortText: string
  types: string[]
}

interface PlaceLocation {
  lat: () => number
  lng: () => number
}

interface PlaceDetails {
  displayName?: string
  formattedAddress?: string
  location?: PlaceLocation
  addressComponents?: PlaceAddressComponent[]
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
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState(value)
  const [isLoaded, setIsLoaded] = useState(() => {
    // Initialize with loaded state if already available
    return typeof window !== 'undefined' && Boolean(window.google?.maps?.places)
  })
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

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

  // Initialize session token when component loads
  useEffect(() => {
    if (isLoaded && !sessionTokenRef.current) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
    }
  }, [isLoaded])

  // Fetch autocomplete suggestions using new Autocomplete Data API
  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input || input.length < 2 || !isLoaded) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    try {
      const request: google.maps.places.AutocompleteRequest = {
        input,
        includedPrimaryTypes: restrictToCities ? ['locality'] : undefined,
        includedRegionCodes: ['in'],
        sessionToken: sessionTokenRef.current!
      }

      const { suggestions: results } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
      
      setSuggestions(results || [])
      setShowDropdown(results.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
      setShowDropdown(false)
    }
  }, [isLoaded, restrictToCities])

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 300)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: Suggestion) => {
    try {
      if (!suggestion.placePrediction) return
      
      const place = suggestion.placePrediction.toPlace()
      
      // Fetch place details
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'addressComponents']
      })

      // Extract location components
      let city: string | null = null
      let state: string | null = null
      let country: string | null = null

      const placeData = place as unknown as PlaceDetails
      const components = placeData.addressComponents || []
      components.forEach((component: PlaceAddressComponent) => {
        const types = component.types || []
        if (types.includes('locality')) {
          city = component.longText
        } else if (types.includes('administrative_area_level_1')) {
          state = component.longText
        } else if (types.includes('country')) {
          country = component.longText
        }
      })

      // Combine displayName with formattedAddress for better location display
      // This ensures the venue name is included with the full address
      const displayName = placeData.displayName || ''
      const formattedAddress = placeData.formattedAddress || ''
      
      // If displayName exists and is not already part of formattedAddress, combine them
      let fullAddress = formattedAddress
      if (displayName && !formattedAddress.toLowerCase().startsWith(displayName.toLowerCase())) {
        fullAddress = displayName + ', ' + formattedAddress
      }

      const locationData: LocationData = {
        formatted: fullAddress,
        city,
        state,
        country,
        latitude: placeData.location?.lat() || null,
        longitude: placeData.location?.lng() || null,
        placeId: suggestion.placePrediction.placeId
      }

      // Update input value
      const displayValue = restrictToCities ? (city || suggestion.placePrediction.text.text) : suggestion.placePrediction.text.text
      setInputValue(displayValue)
      
      // Close dropdown
      setShowDropdown(false)
      setSuggestions([])
      
      // Create new session token for next search
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
      
      onChange(locationData)
    } catch (error) {
      console.error('Error fetching place details:', error)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
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
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowDropdown(true)
          }
        }}
        className={`pl-11 ${className}`}
        disabled={!isLoaded}
        autoComplete="off"
      />
      
      {/* Autocomplete dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-[99999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => {
            if (!suggestion.placePrediction) return null
            return (
              <button
                key={suggestion.placePrediction.placeId}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                  index === selectedIndex ? 'bg-indigo-50' : ''
                }`}
              >
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700">
                  {suggestion.placePrediction.text.text}
                </span>
              </button>
            )
          })}
          <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100 flex items-center justify-end gap-1">
            <span>Powered by</span>
            <span className="font-semibold">Google</span>
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  )
}
