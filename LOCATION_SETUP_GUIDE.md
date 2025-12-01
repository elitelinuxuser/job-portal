# Google Maps Location Integration - Setup Guide

## Step 1: Install Dependencies

```bash
npm install @googlemaps/js-api-loader
npm install -D @types/google.maps
```

## Step 2: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API (optional, for advanced features)
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Restrict the API key:
   - Application restrictions: HTTP referrers
   - Add your domain: `localhost:3000`, `yourdomain.com/*`
   - API restrictions: Select the 3 APIs above

## Step 3: Add Environment Variable

Create/update `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Step 4: Update Database Schema

Add to `lib/db/schema.ts` in the `jobPosts` table:

```typescript
// Add these new fields
locationFormatted: text("location_formatted").notNull(),
locationCity: text("location_city"),
locationState: text("location_state"),
locationCountry: text("location_country"),
locationLatitude: decimal("location_latitude", { precision: 10, scale: 7 }),
locationLongitude: decimal("location_longitude", { precision: 10, scale: 7 }),
locationPlaceId: text("location_place_id"),
```

## Step 5: Create Migration

```bash
npm run db:generate
npm run db:migrate
```

## Step 6: Update Job Post Form

Replace the location Input in `components/company/job-post-form.tsx`:

```typescript
// Import the component
import { LocationAutocomplete } from '@/components/shared/location-autocomplete'

// Add state for location data
const [locationData, setLocationData] = useState<LocationData | null>(null)

// Replace the Input with LocationAutocomplete
<LocationAutocomplete
  value={locationData?.formatted || ''}
  onChange={setLocationData}
  placeholder="Search for venue or city..."
  className="h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors rounded-xl text-base"
  error={errors.location?.message}
/>

// Update onSubmit to include location data
const result = await createJobPost({
  ...data,
  location: locationData?.formatted || '',
  locationCity: locationData?.city,
  locationState: locationData?.state,
  locationCountry: locationData?.country,
  locationLatitude: locationData?.latitude?.toString(),
  locationLongitude: locationData?.longitude?.toString(),
  locationPlaceId: locationData?.placeId,
  // ... rest of the data
})
```

## Step 7: Update Server Action

Update `lib/actions/jobs.ts` to accept new location fields:

```typescript
export async function createJobPost(data: {
  // ... existing fields
  location: string;
  locationCity?: string | null;
  locationState?: string | null;
  locationCountry?: string | null;
  locationLatitude?: string | null;
  locationLongitude?: string | null;
  locationPlaceId?: string | null;
}) {
  // ... existing code

  await db.insert(jobPosts).values({
    // ... existing fields
    location: data.location,
    locationFormatted: data.location,
    locationCity: data.locationCity,
    locationState: data.locationState,
    locationCountry: data.locationCountry,
    locationLatitude: data.locationLatitude,
    locationLongitude: data.locationLongitude,
    locationPlaceId: data.locationPlaceId,
  });
}
```

## Step 8: Update Filters for City Search

Option A: Simple City Filter (Immediate)

```typescript
// In job-filters.tsx, replace location filter with city filter
const allCities = Array.from(
  new Set(
    jobs
      .map((job) => job.locationCity)
      .filter((city): city is string => city !== null && city !== "")
  )
);

// Display as checkboxes
{
  allCities.map((city) => (
    <Checkbox
      checked={filters.cities.includes(city)}
      onCheckedChange={() => handleCityToggle(city)}
    >
      {city}
    </Checkbox>
  ));
}
```

Option B: City Search with Autocomplete (Better UX)

```typescript
// Add a separate LocationAutocomplete for city search
<LocationAutocomplete
  value={searchCity}
  onChange={(location) => {
    if (location.city) {
      setFilters((prev) => ({
        ...prev,
        searchCity: location.city,
      }));
    }
  }}
  placeholder="Search by city..."
/>;

// Filter logic
if (filters.searchCity) {
  filtered = filtered.filter(
    (job) =>
      job.locationCity?.toLowerCase() === filters.searchCity.toLowerCase()
  );
}
```

## Step 9: Testing

1. Start dev server: `npm run dev`
2. Go to job posting page
3. Start typing a location
4. Select from autocomplete
5. Verify location data is saved
6. Test filtering by city

## Cost Management

To stay within Google's free tier ($200/month):

- Enable billing alerts at $100 and $150
- Set quotas: 10,000 requests/day for Places API
- Monitor usage in Google Cloud Console

## Future Enhancements

1. **Map View**: Show jobs on an interactive map
2. **Radius Search**: "Jobs within 50km of Mumbai"
3. **Current Location**: "Jobs near me" feature
4. **Saved Locations**: Save favorite cities for quick filtering
5. **Location Analytics**: Popular cities for jobs

## Troubleshooting

**API Key not working:**

- Check if APIs are enabled
- Verify domain restrictions
- Check browser console for errors
- Ensure billing is enabled

**Autocomplete not showing:**

- Check internet connection
- Verify API key in .env.local
- Check browser console for errors
- Try clearing cache

**TypeScript errors:**

- Ensure `@types/google.maps` is installed
- Restart TypeScript server
- Add to tsconfig.json if needed
