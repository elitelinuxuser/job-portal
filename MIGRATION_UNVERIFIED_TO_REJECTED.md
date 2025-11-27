# Migration: Remove "unverified" Status

This migration removes the "unverified" status from the verification_status enum and replaces it with "rejected".

## Steps to Run:

### 1. Run the data migration script

This will update all existing records from 'unverified' to 'rejected':

```bash
npx tsx scripts/migrate-unverified-to-rejected.ts
```

### 2. Update the database enum

After the data is migrated, you need to remove the 'unverified' value from the enum in PostgreSQL.

**Important:** PostgreSQL doesn't allow removing enum values directly. You need to:

#### Option A: Recreate the enum (Recommended for development)

```bash
# Connect to your database and run:
# This will drop and recreate the enum with the correct values
npx drizzle-kit push
```

#### Option B: Manual SQL (If Option A doesn't work)

If the above doesn't work, you may need to manually alter the enum in your database:

```sql
-- This is complex in PostgreSQL. You typically need to:
-- 1. Create a new enum type
CREATE TYPE verification_status_new AS ENUM ('pending', 'verified', 'rejected');

-- 2. Alter the columns to use the new type
ALTER TABLE company_profiles
  ALTER COLUMN verification_status TYPE verification_status_new
  USING verification_status::text::verification_status_new;

ALTER TABLE freelancer_profiles
  ALTER COLUMN verification_status TYPE verification_status_new
  USING verification_status::text::verification_status_new;

-- 3. Drop the old type
DROP TYPE verification_status;

-- 4. Rename the new type
ALTER TYPE verification_status_new RENAME TO verification_status;
```

## What Changed:

### 1. Schema (`lib/db/schema.ts`)

- ❌ Removed: `"unverified"` from `verificationStatusEnum`
- ✅ Now only has: `"pending"`, `"verified"`, `"rejected"`

### 2. Admin Actions (`lib/actions/admin.ts`)

- ✅ Updated `rejectProfile()` to set status to `'rejected'` instead of `'unverified'`

### 3. Database Records

- ✅ All existing records with `verification_status = 'unverified'` are updated to `'rejected'`

## Verification:

After migration, verify that:

1. No records have `verification_status = 'unverified'`
2. The enum only contains: pending, verified, rejected
3. Rejecting a profile in the admin panel sets status to 'rejected'
4. Rejected profiles appear in the "Rejected" tab in admin approvals

```sql
-- Check for any remaining 'unverified' records
SELECT COUNT(*) FROM company_profiles WHERE verification_status = 'unverified';
SELECT COUNT(*) FROM freelancer_profiles WHERE verification_status = 'unverified';

-- Both should return 0
```
