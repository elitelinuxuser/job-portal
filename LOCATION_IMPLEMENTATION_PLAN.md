# Location & Google Maps Integration Plan

## Overview

Implement Google Places Autocomplete for location selection and enable city-based filtering.

## 1. Database Schema Changes

### Update `jobPosts` table to include structured location:

```typescript
// Add these new fields to jobPosts table
locationFormatted: text("location_formatted").notNull(), // Full formatted address
locationCity: text("location_city"), // Extracted city name
locationState: text("location_state"), // Extracted state
locationCountry: text("location_country"), // Extracted country
locationLatitude: decimal("location_latitude", { precision: 10, scale: 7 }),
locationLongitude: decimal("location_longitude", { precision: 10, scale: 7 }),
locationPlaceId: text("location_place_id"), // Google Place ID for reference
```

### Migration Strategy:

1. Add new columns to database
2. Keep existing `location` field for backward compatibility during migration
3. Gradually migrate old data by parsing existing locations
4. Eventually remove old `location` field

## 2. Google Maps Integration

### Required Setup:

1. **Get Google Maps API Key**

   - Go to Google Cloud Console
   - Enable: Maps JavaScript API, Places API, Geocoding API
   - Create API key with restrictions

2. **Environment Variables**

   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. **Install Dependencies**
   ```bash
   npm install @googlemaps/js-api-loader
   ```

## 3. Implementation Components

### A. Location Autocomplete Component

Create a reusable component that:

- Uses Google Places Autocomplete
- Extracts city, state, country from the selected place
- Stores structured data
- Shows formatted address in UI

### B. Update Job Post Form

- Replace simple text input with Location Autocomplete
- Capture all location fields when place is selected
- Submit structured location data

### C. Update Filter Component

- Add city-based search/filter
- Use autocomplete for city selection
- Filter jobs by matching city field

## 4. Filter Enhancement Options

### Option 1: City Dropdown (Simple)

- Extract unique cities from all jobs
- Display as checkboxes/dropdown
- Filter by exact city match

### Option 2: City Search with Autocomplete (Better UX)

- Google Places Autocomplete for city search
- Type to search cities
- Filter jobs in that city and nearby areas

### Option 3: Radius-based Search (Advanced)

- "Jobs within X km of [City]"
- Use lat/long for distance calculations
- Better for finding jobs in nearby cities

## 5. Benefits

✅ **Better UX**: Easy venue selection with autocomplete
✅ **Structured Data**: Clean, normalized location data
✅ **Better Filtering**: Search by specific cities
✅ **Map Integration**: Can show jobs on a map later
✅ **Distance Calculations**: Enable "nearby jobs" feature
✅ **Consistency**: Avoid spelling variations (Mumbai vs Bombay)

## 6. Implementation Priority

1. **Phase 1** (Essential):

   - Add location fields to database
   - Implement Google Places Autocomplete component
   - Update job post form
   - Basic city filtering

2. **Phase 2** (Enhancement):

   - Migrate existing data
   - Advanced radius-based search
   - Map view of jobs

3. **Phase 3** (Nice to have):
   - Save favorite locations
   - Location-based notifications
   - Distance from user's location

## 7. Cost Considerations

Google Maps API pricing:

- Places Autocomplete: $2.83 per 1000 requests (with autocomplete discount)
- Geocoding: $5 per 1000 requests
- First $200/month is FREE (covers ~70,000 autocomplete requests)

For a startup, staying within free tier is very feasible.
