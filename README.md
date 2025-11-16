# Freelancer Platform

A modern, invite-only platform connecting companies with photography and videography freelancers for gig bookings.

## 🚀 Features

### For Companies
- **Complete Profile Management** - Set up company details, logo, and contact information
- **Job Posting** - Create detailed job postings with dates, budgets, and contract terms
- **Review Applications** - View freelancer profiles, portfolios, and equipment lists
- **Booking Management** - Send booking requests and track acceptance status
- **Payment Tracking** - Mark bookings as paid with amounts and dates

### For Freelancers
- **Professional Profiles** - Showcase skills, equipment, and portfolios
- **Browse Opportunities** - View all active job postings from companies
- **Simple Applications** - Express interest with optional messages
- **Contract Review** - Full contract preview before acceptance
- **Booking Management** - Accept/reject requests with calendar integration

### For Admins
- **Invite System** - Create and manage invitation links with role assignment
- **User Management** - View all users and track onboarding status
- **Platform Metrics** - Comprehensive analytics and statistics
- **Full Oversight** - Monitor jobs, bookings, and platform activity

## 🛠 Tech Stack

- **Framework**: Next.js 16 with App Router and Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Clerk (invite-only mode)
- **Database**: Neon PostgreSQL + Drizzle ORM
- **File Storage**: Vercel Blob
- **Forms**: React Hook Form + Zod validation
- **Hosting**: Vercel
- **State Management**: React Server Components + Server Actions

## 📋 Prerequisites

- Node.js 18+ installed
- Yarn package manager
- Accounts on:
  - [Clerk](https://clerk.com) - Authentication
  - [Neon](https://neon.tech) - Database
  - [Vercel](https://vercel.com) - Hosting

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd freelancer-platform
yarn install
```

### 2. Set Up Environment Variables

Create `.env.local` file:

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

### 3. Set Up Database

```bash
yarn db:push
```

### 4. Run Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- **[Setup Guide](./SETUP.md)** - Detailed setup instructions
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment steps
- **[Database Schema](./lib/db/README.md)** - Schema documentation

## 🏗 Project Structure

```
freelancer-platform/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (admin)/             # Admin dashboard
│   ├── (company)/           # Company portal
│   ├── (freelancer)/        # Freelancer portal
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── admin/               # Admin components
│   ├── company/             # Company components
│   └── freelancer/          # Freelancer components
├── lib/
│   ├── actions/             # Server actions
│   ├── db/                  # Database schema & config
│   └── validations/         # Form validations
└── middleware.ts            # Authentication & routing
```

## 🔐 Authentication Flow

1. **Invite-Only System** - Users can only sign up with admin-created invitation links
2. **Role Assignment** - Each invite has a specific role (admin/company/freelancer)
3. **Onboarding Required** - New users complete profile before accessing features
4. **Role-Based Access** - Middleware enforces route protection by user role

## 💾 Database Schema

The platform uses 8 core tables:

- `users` - User accounts (synced from Clerk)
- `invites` - Invitation links
- `company_profiles` - Company details
- `freelancer_profiles` - Freelancer portfolios
- `job_posts` - Job postings with contract terms
- `job_responses` - Freelancer applications
- `booking_requests` - Booking offers
- `payments` - Payment tracking

## 🎨 UI Components

Built with shadcn/ui for consistency and maintainability:

- Forms with validation
- Dialogs and modals
- Tables and cards
- Badges and buttons
- Toast notifications

## 📱 Responsive Design

The platform is fully responsive and works seamlessly on:
- Desktop (1920px+)
- Laptop (1280px - 1920px)
- Tablet (768px - 1280px)
- Mobile (320px - 768px)

## 🧪 Testing

Run the development server and test critical flows:

1. **Admin Flow**:
   - Create invitation links
   - View user list
   - Check platform metrics

2. **Company Flow**:
   - Complete onboarding
   - Post a job
   - Review freelancer responses
   - Send booking request
   - Mark as paid

3. **Freelancer Flow**:
   - Complete onboarding
   - Browse jobs
   - Apply to jobs
   - Accept booking with contract review
   - Download calendar event

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

Quick deploy to Vercel:

```bash
vercel
```

## 📊 Performance

Built with Next.js 16 features for optimal performance:

- Server Components for reduced JavaScript
- Turbopack for faster builds
- Automatic code splitting
- Image optimization
- Static generation where possible

## 🔧 Scripts

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
yarn db:generate  # Generate database migrations
yarn db:push      # Push schema to database
yarn db:studio    # Open Drizzle Studio
```

## 🤝 Contributing

This is a private project. For authorized contributors:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request

## 📝 License

Private - All rights reserved

## 🐛 Troubleshooting

### Build Errors
- Clear `.next` folder and rebuild
- Verify all dependencies are installed
- Check TypeScript errors

### Authentication Issues
- Verify Clerk API keys
- Check middleware configuration
- Ensure webhooks are configured

### Database Issues
- Verify DATABASE_URL is correct
- Run `yarn db:push` to sync schema
- Check Neon dashboard for errors

## 📧 Support

For issues or questions:
1. Check documentation
2. Review error logs
3. Contact development team

---

Built with ❤️ using Next.js 16, TypeScript, and modern web technologies.
