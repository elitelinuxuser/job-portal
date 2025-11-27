# Configure Required Name Fields in Clerk

To make first name and last name mandatory during signup, you need to configure this in your Clerk Dashboard.

## Steps to Configure

### 1. Go to Clerk Dashboard

Visit: https://dashboard.clerk.com/

### 2. Select Your Application

- Click on your application (freelancer-platform)

### 3. Navigate to User & Authentication Settings

- In the left sidebar, click **"User & Authentication"**
- Click **"Email, phone, username"**

### 4. Enable and Require Name Fields

Under the **"Personal information"** section:

1. Find **"Name"** field
2. Toggle it **ON** (if not already enabled)
3. Click on the **"Name"** field to expand options
4. Check the box for **"Require name field"**
5. Check **"Require first name"**
6. Check **"Require last name"**

### 5. Save Changes

- Click **"Save"** at the bottom of the page

### 6. Test the Changes

- Go to `/sign-up` on your application
- You should now see:
  - First Name field (required)
  - Last Name field (required)
  - Email field (required)
  - Password field (required)

## Alternative: Configure via Code (Advanced)

If you want more control, you can also configure this in your middleware or through Clerk's API, but the Dashboard method is recommended and simpler.

### Current Sign-Up Configuration

The sign-up page is configured at:

```
/app/(auth)/sign-up/[[...sign-up]]/page.tsx
```

Currently using:

- **Routing**: Path-based (`/sign-up`)
- **Redirect**: `/role-selection` (after signup)
- **Appearance**: Custom shadow styling

## What Happens After Configuration

### User Flow:

1. User visits `/sign-up`
2. Clerk form shows:
   - ✅ First Name (required)
   - ✅ Last Name (required)
   - ✅ Email (required)
   - ✅ Password (required)
3. User completes signup
4. Redirects to `/role-selection`
5. User chooses Company or Freelancer
6. Redirects to appropriate onboarding

### Data Storage:

- First Name and Last Name are stored in **Clerk's user object**
- Accessible via `user.firstName` and `user.lastName`
- Available in your application through Clerk's hooks and APIs

## Accessing Name Data in Your App

### In Server Components:

```typescript
import { auth, currentUser } from "@clerk/nextjs/server";

const user = await currentUser();
const firstName = user?.firstName;
const lastName = user?.lastName;
const fullName = `${firstName} ${lastName}`;
```

### In Client Components:

```typescript
"use client";
import { useUser } from "@clerk/nextjs";

export function UserProfile() {
  const { user } = useUser();

  return (
    <div>
      <p>
        Hello, {user?.firstName} {user?.lastName}!
      </p>
    </div>
  );
}
```

### In API Routes:

```typescript
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  return Response.json({
    firstName: user.firstName,
    lastName: user.lastName,
  });
}
```

## Additional Configuration Options

You can also configure:

- **Phone number** (optional or required)
- **Username** (optional or required)
- **Profile picture**
- **Additional custom fields**

All these can be configured in the Clerk Dashboard under **User & Authentication**.

## Verification

After configuring, test by:

1. ✅ Trying to sign up without first name (should show error)
2. ✅ Trying to sign up without last name (should show error)
3. ✅ Completing signup with all fields (should succeed)
4. ✅ Checking that name appears in user object
5. ✅ Verifying name displays correctly in your app

## Troubleshooting

**Names not showing as required?**

- Clear browser cache
- Restart your dev server
- Check Clerk Dashboard settings are saved

**Names not accessible in code?**

- Make sure you're using latest Clerk SDK
- Check that user is authenticated
- Verify Clerk configuration is correct

---

**Status**: Configuration needed in Clerk Dashboard  
**Estimated time**: 2-3 minutes  
**Difficulty**: Easy
