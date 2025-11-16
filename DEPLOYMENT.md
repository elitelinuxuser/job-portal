# Deployment Guide

This guide will help you deploy the Freelancer Platform to production on Vercel.

## Pre-Deployment Checklist

### 1. Database Setup
- [ ] Create Neon PostgreSQL database (production instance)
- [ ] Copy connection string
- [ ] Run `yarn db:push` to create tables in production database

### 2. Clerk Configuration
- [ ] Create production Clerk application
- [ ] Configure invite-only mode in restrictions
- [ ] Set up user metadata fields (role, onboardingStatus)
- [ ] Configure webhook endpoint
- [ ] Copy production API keys

### 3. Vercel Blob Storage
- [ ] Create Vercel account
- [ ] Link project to Vercel
- [ ] Create Blob storage in Vercel dashboard
- [ ] Copy BLOB_READ_WRITE_TOKEN

## Step-by-Step Deployment

### Step 1: Push Code to GitHub

```bash
cd /Users/ramanandsirvi/Documents/freelancing/neeraj/freelancer-platform
git add .
git commit -m "Initial deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `yarn build`
   - **Output Directory**: `.next`

### Step 3: Add Environment Variables

In Vercel Project Settings → Environment Variables, add:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
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

### Step 4: Configure Clerk Webhook

1. In Clerk Dashboard → Webhooks
2. Update endpoint URL to: `https://your-domain.vercel.app/api/webhooks/clerk`
3. Verify webhook is receiving events

### Step 5: Deploy

Click "Deploy" in Vercel. Your app will be live at `https://your-project.vercel.app`

### Step 6: Create First Admin User

1. Temporarily disable invite-only in Clerk
2. Sign up with your admin email at your production URL
3. In Clerk Dashboard, add metadata:
   - `role`: `admin`
   - `onboardingStatus`: `complete`
4. Re-enable invite-only mode
5. Log in and access `/admin` dashboard

## Post-Deployment

### Custom Domain (Optional)

1. In Vercel Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Clerk settings with new domain

### Monitoring

- Enable Vercel Analytics for traffic monitoring
- Check Clerk Dashboard for authentication logs
- Monitor webhook delivery status

### Database Management

Use Drizzle Studio to manage production data:

```bash
yarn db:studio
```

Or directly query via Neon console.

## Troubleshooting

### Deployment Fails

- Check build logs in Vercel
- Verify all environment variables are set
- Ensure DATABASE_URL is accessible from Vercel

### Authentication Issues

- Verify Clerk API keys are production keys
- Check webhook is pointing to production URL
- Ensure invite-only mode is configured

### Database Connection Errors

- Verify DATABASE_URL format
- Check Neon database is active
- Ensure connection pooling is enabled

### File Upload Issues

- Verify BLOB_READ_WRITE_TOKEN is set
- Check Blob storage is created in Vercel
- Ensure upload route is accessible

## Maintenance

### Database Migrations

When schema changes:

```bash
yarn db:generate
yarn db:push
```

### Monitoring

- Check Vercel deployment logs
- Monitor Clerk webhook delivery
- Review database query performance in Neon

### Backups

- Neon provides automatic backups
- Export data regularly via Drizzle Studio
- Keep local copy of environment variables

## Scaling Considerations

### Free Tier Limits

- Clerk: 10,000 MAU
- Neon: 0.5GB storage
- Vercel: 100GB bandwidth/month
- Vercel Blob: 500MB storage

### When to Upgrade

- Approaching MAU limit → Upgrade Clerk plan
- Database size growing → Upgrade Neon plan
- High traffic → Upgrade Vercel plan
- More file storage needed → Upgrade Blob storage

## Security

- Use environment variables for all secrets
- Enable Vercel's DDoS protection
- Set up rate limiting if needed
- Regular security updates via `yarn upgrade`

## Support

For issues:
1. Check Vercel deployment logs
2. Review Clerk dashboard for auth errors
3. Check Neon for database issues
4. Verify webhook delivery status

