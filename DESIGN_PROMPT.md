# Design Prompt: Freelancer Booking Platform

## Product Overview

Invite-only marketplace connecting photography/videography companies with verified freelancers. Streamlines booking from job posting to payment completion.

## User Personas

**Admin**: Platform manager - access control, monitoring, invite management, analytics
**Company**: Hiring managers - post jobs, review applications, send bookings, track payments
**Freelancer**: Professionals - discover jobs, apply, accept bookings, manage schedule

## Core Features

### Authentication & Onboarding

- Invite-only signup with role-specific codes (admin/company/freelancer)
- Company onboarding: Name, contact person, WhatsApp, location, year, logo upload
- Freelancer onboarding: Name, location, WhatsApp, photo, equipment list, portfolio links (max 3), ID proof, verification status

### Job Management

- **Posting**: Title, description, multiple dates, location, budget, job type, time. Contract terms: 5 checkboxes (Content Posting, Advance Payment, Payment After Shot, Content Ownership, SD Card) + custom field. Active/inactive toggle.
- **Discovery**: Grid/list view with job cards showing company, dates, budget, location, time. Detail view with full description and contract overview.

### Application & Booking Flow

- Freelancers apply with optional message or mark "not interested" (no duplicates)
- Companies view responses with freelancer profiles (photo, portfolio, equipment, verification)
- **Three-step booking acceptance**: 1) Overview (job details, dates, budget, WhatsApp link), 2) Contract (full terms display), 3) Success (confirmation + .ics calendar download)
- Decline with confirmation warning
- Booking management: Status filters (pending/accepted/rejected/completed), mark as paid (amount + date), payment history

### Admin Dashboard

- Invite management (create, list, share, delete)
- User management (view all, filter by role, onboarding status)
- Analytics (user counts, job stats, booking metrics, acceptance rates, 7-day activity)

## Design Principles

1. Trust First: Transparency, verification badges, clear contracts
2. Clarity Over Speed: Three-step booking ensures understanding
3. Mobile-First: Responsive, touch-friendly, WhatsApp integration
4. Simplicity: Complex flows in digestible steps
5. Professional: Clean, modern B2B marketplace UI

## UI/UX Requirements

**Visual Hierarchy**: Clear CTAs (Apply, Send Booking, Accept, Mark Paid). Status badges with colors (green=accepted, yellow=pending, red=rejected). Verification badges. Progress indicators.

**Information Architecture**: Role-based navigation. Dashboard overviews. Detail views. Modal dialogs for confirmations.

**Key Interactions**: File uploads (drag-drop + click). Multi-date picker. Checkbox groups. Status filters (tabs/dropdowns). Calendar download button.

**Responsive**: Mobile (320-768px) for browsing/quick actions. Tablet (768-1280px). Desktop (1280px+) for posting/detailed review.

**Accessibility**: Keyboard navigation, screen reader support, high contrast, clear error states.

## Design System

**Colors**: Professional palette + status colors
**Typography**: Clear hierarchy, readable fonts
**Components**: Cards (jobs/profiles), tables (lists), forms (validation), modals (confirmations)
**Icons**: Status indicators, actions (WhatsApp, calendar, upload)
**Spacing**: Generous whitespace, consistent padding/margins

## Key Screens

Admin: Invite form, User table, Analytics dashboard
Company: Onboarding, Job posting, Application review, Booking management
Freelancer: Onboarding, Job browse, Job detail, Booking flow (3 steps)
Shared: Sign-in/up (invite code), Profiles, Payment tracking

## Success Criteria

- Onboarding completed without confusion
- Efficient job posting
- Easy job discovery and application
- Secure, transparent booking flow
- Mobile matches desktop functionality
- Clear feedback for all actions
