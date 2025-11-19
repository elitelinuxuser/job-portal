# Freelancer Platform Setup Guide

## Prerequisites

- Node.js 18+ installed
- Yarn installed (`npm install -g yarn`)
- Accounts created:
  - [Clerk](https://clerk.com) - Authentication
  - [Neon](https://neon.tech) - PostgreSQL Database
  - [Vercel](https://vercel.com) - Hosting & Blob Storage

## Step 1: Clone and Install

```bash
cd freelancer-platform
yarn install
```

## Step 2: Set Up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Go to **API Keys** and copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### Enable Invite-Only Mode

1. In Clerk Dashboard, go to **User & Authentication** → **Restrictions**
2. Enable "Restrict sign-ups to invitations only"
3. Configure allowed email domains if needed

### Set Up User Metadata

1. Go to **Users** → **Metadata**
2. Add custom fields:
   - `role` (string) - Values: "admin", "company", "freelancer"
   - `onboardingStatus` (string) - Values: "incomplete", "complete"

### Configure Webhooks

1. In Clerk Dashboard, go to **Webhooks** → **Add Endpoint**
2. Set endpoint URL: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the **Signing Secret** and add to `.env.local` as `CLERK_WEBHOOK_SECRET`

## Step 3: Set Up Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to `.env.local` as `DATABASE_URL`

## Step 4: Set Up Vercel Blob Storage

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel link`
3. Go to Vercel Dashboard → Your Project → Storage → Create Database → Blob
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Add to `.env.local`

## Step 5: Configure Environment Variables

Create `.env.local` file in the root directory:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Database
DATABASE_URL=postgresql://user:password@host/db

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
```

## Step 6: Push Database Schema

```bash
yarn db:push
```

This creates all tables in your Neon database.

## Step 7: Create First Admin User

1. Temporarily disable "invite-only" mode in Clerk
2. Sign up with your admin email
3. In Clerk Dashboard, go to **Users** → Select your user
4. Add metadata:
   - `role`: `admin`
   - `onboardingStatus`: `complete`
5. Re-enable "invite-only" mode

## Step 8: Run Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 9: Test Invite System

1. Log in as admin
2. Go to `/admin` dashboard
3. Create invite links for companies and freelancers
4. Share invite links to onboard users

## Database Commands

- `yarn db:generate` - Generate migrations
- `yarn db:push` - Push schema changes to database
- `yarn db:studio` - Open Drizzle Studio (database GUI)

## Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel Dashboard
4. Update Clerk webhook URL to production domain
5. Deploy!

## Troubleshooting

### Webhook Issues
- Ensure webhook URL is publicly accessible
- Check signing secret matches `.env.local`
- View webhook logs in Clerk Dashboard

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure Neon project is active
- Check IP allowlisting in Neon settings

### Authentication Issues
- Clear browser cache and cookies
- Verify all Clerk environment variables
- Check Clerk Dashboard for error logs



