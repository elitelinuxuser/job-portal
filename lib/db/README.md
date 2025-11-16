# Database Schema Documentation

## Tables Overview

### Core Tables

1. **users** - User accounts synced from Clerk
2. **invites** - Admin-created invitation links
3. **company_profiles** - Company information
4. **freelancer_profiles** - Freelancer portfolios and details
5. **job_posts** - Company job postings
6. **job_responses** - Freelancer applications
7. **booking_requests** - Company booking offers to freelancers
8. **payments** - Payment tracking

## Schema Features

### User Roles
- `admin` - Platform administrators
- `company` - Hiring companies
- `freelancer` - Photography/videography freelancers

### Onboarding Status
- `incomplete` - User needs to complete profile
- `complete` - User can access full platform

### Job Response Status
- `interested` - Freelancer wants to work on this job
- `not_interested` - Freelancer declines

### Booking Status
- `pending` - Waiting for freelancer response
- `accepted` - Freelancer accepted booking
- `rejected` - Freelancer declined booking
- `completed` - Job finished and paid

### Verification Status
- `unverified` - No verification submitted
- `pending` - Verification under review
- `verified` - ID verified by admin

## Database Operations

### Push Schema to Database
```bash
yarn db:push
```

### Generate Migrations
```bash
yarn db:generate
```

### Open Database Studio
```bash
yarn db:studio
```

## Querying Examples

### Get user with profile
```typescript
import { db } from '@/lib/db'
import { users, companyProfiles, freelancerProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Get company with profile
const company = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    companyProfile: true,
  },
})

// Get freelancer with profile
const freelancer = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    freelancerProfile: true,
  },
})
```

### Get job posts with responses
```typescript
const jobs = await db.query.jobPosts.findMany({
  where: eq(jobPosts.companyId, companyId),
  with: {
    responses: {
      with: {
        freelancer: {
          with: {
            freelancerProfile: true,
          },
        },
      },
    },
  },
})
```

### Get booking requests
```typescript
const bookings = await db.query.bookingRequests.findMany({
  where: eq(bookingRequests.freelancerId, freelancerId),
  with: {
    job: true,
    company: {
      with: {
        companyProfile: true,
      },
    },
    payments: true,
  },
})
```

## Relations

All tables use proper foreign keys and relations for type-safe joins:

- `users` → `company_profiles` (one-to-one)
- `users` → `freelancer_profiles` (one-to-one)
- `users` → `job_posts` (one-to-many)
- `job_posts` → `job_responses` (one-to-many)
- `job_posts` → `booking_requests` (one-to-many)
- `booking_requests` → `payments` (one-to-many)

## Important Notes

1. User IDs come from Clerk and are synced via webhooks
2. All tables use UUID primary keys (except users which uses Clerk ID)
3. Timestamps are automatically managed with `defaultNow()`
4. JSONB columns are used for arrays (dates, equipment, portfolios)
5. Contract details are stored as JSONB in booking_requests for historical reference

