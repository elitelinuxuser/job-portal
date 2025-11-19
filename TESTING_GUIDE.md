# Testing Guide

This guide outlines how to test the Freelancer Platform to ensure all features work correctly.

## Pre-Testing Setup

1. Ensure development server is running: `yarn dev`
2. Database is set up and accessible
3. Clerk authentication is configured
4. All environment variables are set

## Test Scenarios

### 1. Admin Dashboard Testing

#### Creating Invites
1. Log in as admin
2. Navigate to `/admin/invites`
3. Click "Create Invite"
4. Test each role:
   - Create admin invite
   - Create company invite
   - Create freelancer invite
5. Test expiration dates (optional field)
6. Copy invite link and verify format
7. Test deleting invites

**Expected Results:**
- ✓ Invites created with unique codes
- ✓ Invite links are copyable
- ✓ Status shows as "pending"
- ✓ Can delete invites

#### User Management
1. Navigate to `/admin/users`
2. Verify all users are listed
3. Check onboarding status badges
4. Verify role badges display correctly

**Expected Results:**
- ✓ All users visible
- ✓ Correct roles displayed
- ✓ Onboarding status accurate

#### Platform Metrics
1. Navigate to `/admin/metrics`
2. Check all metric cards display numbers
3. Verify recent activity (last 7 days)
4. Check booking statistics

**Expected Results:**
- ✓ All counters show correct numbers
- ✓ Percentages calculated correctly
- ✓ Charts display properly

### 2. Company Portal Testing

#### Onboarding
1. Use company invite link to sign up
2. Fill onboarding form:
   - Company name (required)
   - Contact person (required)
   - WhatsApp number (required)
   - Location (required)
   - Year started (optional)
   - Logo upload (optional)
3. Submit form

**Expected Results:**
- ✓ Profile created successfully
- ✓ Redirected to company dashboard
- ✓ Onboarding status updated to "complete"

#### Posting Jobs
1. Navigate to `/company/post-job`
2. Fill job form:
   - Title (min 5 chars)
   - Description (min 20 chars)
   - Location
   - Budget
   - Job type
   - Time
   - Add multiple dates
   - Check contract options
   - Add additional contract details
3. Submit job

**Expected Results:**
- ✓ Job created and visible on dashboard
- ✓ Job shows as "Active"
- ✓ All dates saved correctly
- ✓ Contract terms saved

#### Managing Jobs
1. View job on company dashboard
2. Toggle job status (Active/Inactive)
3. View responses count
4. Click "View Responses"

**Expected Results:**
- ✓ Job status toggles correctly
- ✓ Response count accurate
- ✓ Can navigate to responses page

#### Viewing Responses
1. Wait for freelancer to apply
2. Navigate to `/company/responses`
3. View freelancer details:
   - Name and email
   - Location
   - Equipment list
   - Portfolio links
   - Verification status
4. Send booking request

**Expected Results:**
- ✓ All freelancer info visible
- ✓ Portfolio links are clickable
- ✓ Booking request sent successfully

#### Managing Bookings
1. Navigate to `/company/bookings`
2. View different tabs:
   - Pending
   - Accepted
   - Completed
   - Rejected
3. For accepted bookings, mark as paid:
   - Enter amount
   - Add notes (optional)
   - Submit

**Expected Results:**
- ✓ Bookings categorized correctly
- ✓ Payment recorded
- ✓ Status updated to "completed"

### 3. Freelancer Portal Testing

#### Onboarding
1. Use freelancer invite link to sign up
2. Fill onboarding form:
   - Full name (required)
   - Location (required)
   - WhatsApp number (required)
   - Profile photo (optional)
   - Equipment list (at least 1)
   - Portfolio links (up to 3)
   - ID proof (optional)
3. Submit form

**Expected Results:**
- ✓ Profile created successfully
- ✓ Redirected to job board
- ✓ Onboarding status updated

#### Browsing Jobs
1. View job board at `/freelancer`
2. Check job cards display:
   - Title and company name
   - Budget badge
   - Location and job type
   - Number of dates
   - Time
   - Posted date
3. Click "View Details" on a job

**Expected Results:**
- ✓ All active jobs visible
- ✓ Job information accurate
- ✓ Can navigate to job details

#### Job Details & Applying
1. View job detail page
2. Review all information:
   - Full description
   - All dates
   - Contract terms
   - Additional details
3. Add optional message
4. Click "I'm Interested" or "Not Interested"

**Expected Results:**
- ✓ All job details visible
- ✓ Contract terms clearly displayed
- ✓ Response submitted successfully
- ✓ Cannot apply twice to same job

#### Managing Bookings
1. Navigate to `/freelancer/bookings`
2. View pending booking requests
3. Click "Accept Booking"
4. Step 1: Review overview
   - Check dates, location, budget
   - View company contact
   - Click "View Contract"
5. Step 2: Review contract
   - Read all contract terms
   - Check additional details
   - Click "I Accept"
6. Step 3: Success screen
   - Download calendar event
   - Close dialog

**Expected Results:**
- ✓ Booking request details accurate
- ✓ Contract terms clear
- ✓ Can download .ics file
- ✓ Booking status updated to "accepted"

#### Declining Bookings
1. Click "Decline" on a booking
2. Confirm in warning dialog

**Expected Results:**
- ✓ Warning dialog appears
- ✓ Booking marked as rejected
- ✓ Company notified

### 4. Authentication & Middleware Testing

#### Route Protection
1. Try accessing protected routes without login
2. Try accessing admin routes as company
3. Try accessing company routes as freelancer
4. Try accessing routes without completed onboarding

**Expected Results:**
- ✓ Redirected to sign-in when not authenticated
- ✓ Redirected to home when accessing unauthorized routes
- ✓ Redirected to onboarding when incomplete

#### Invite-Only System
1. Try signing up without invite code
2. Use expired invite
3. Use already-used invite

**Expected Results:**
- ✓ Cannot sign up without valid invite
- ✓ Expired invites show error
- ✓ Used invites cannot be reused

### 5. File Upload Testing

#### Company Logo Upload
1. During onboarding, upload logo
2. Verify upload progress
3. Check logo appears in profile

**Expected Results:**
- ✓ Upload succeeds
- ✓ Logo visible on company profile
- ✓ Image loads correctly

#### Freelancer Photo & ID Upload
1. Upload profile photo
2. Upload ID proof
3. Verify both uploads

**Expected Results:**
- ✓ Both files upload successfully
- ✓ Images accessible via URL
- ✓ No upload errors

### 6. Form Validation Testing

Test validation on all forms:

#### Required Fields
- Submit forms with empty required fields
- Verify error messages appear

#### Field Formats
- Test invalid email formats
- Test invalid phone numbers
- Test short inputs (below minimum length)
- Test long inputs (above maximum length)

**Expected Results:**
- ✓ Validation errors display
- ✓ Form cannot submit with errors
- ✓ Error messages are clear

### 7. Responsive Design Testing

Test on different screen sizes:

#### Desktop (1920px)
- Verify layouts don't break
- Check sidebars appear correctly
- Test all interactions

#### Tablet (768px - 1280px)
- Check responsive layouts
- Verify touch interactions
- Test navigation menus

#### Mobile (320px - 768px)
- Test mobile-optimized layouts
- Verify all content is readable
- Check touch targets are large enough

**Expected Results:**
- ✓ No horizontal scrolling
- ✓ All text readable
- ✓ Buttons easily tappable
- ✓ Forms usable on all devices

### 8. Error Handling Testing

#### Network Errors
1. Disconnect internet
2. Try submitting forms
3. Verify error messages

#### Database Errors
1. Use invalid DATABASE_URL
2. Check error handling
3. Verify user sees friendly message

#### Authentication Errors
1. Use invalid Clerk keys
2. Try accessing protected routes
3. Check error displays

**Expected Results:**
- ✓ Clear error messages
- ✓ No app crashes
- ✓ User can recover from errors

## Performance Testing

### Page Load Times
- Homepage should load < 2s
- Dashboard pages should load < 3s
- Job listings should load < 2s

### Database Queries
- Check query performance in Drizzle Studio
- Verify no N+1 query problems
- Test with 100+ records

### Image Loading
- Test with large images
- Verify lazy loading works
- Check optimization

## Automated Testing Checklist

- [ ] All admin features work
- [ ] Company can post jobs
- [ ] Company can manage bookings
- [ ] Freelancers can browse jobs
- [ ] Freelancers can apply
- [ ] Booking acceptance flow works
- [ ] File uploads work
- [ ] Authentication protects routes
- [ ] Forms validate correctly
- [ ] Responsive on all devices
- [ ] Error handling works
- [ ] Performance is acceptable

## Bug Reporting

When you find a bug, record:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots if applicable
5. Browser and device info
6. Console errors

## Post-Testing

After testing:
1. Document any issues found
2. Fix critical bugs
3. Re-test fixed issues
4. Update documentation if needed
5. Mark platform as ready for deployment



