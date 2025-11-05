# Admin Login Guide

## Accessing the Admin Dashboard

### Separate Admin Login Page
The admin dashboard now has its own dedicated login page to avoid conflicts with regular user authentication.

**Admin Login URL:** `/adminlogin`

### Admin Credentials
Use these pre-configured admin emails:
- `admin@admin.com`
- `admin@moversconnect.com`
- `beastkee@example.com`

Password: Whatever you set for the admin account

### How It Works

1. **Admin Login** (`/adminlogin`)
   - Dedicated login page for administrators only
   - Validates that the email is in the admin list
   - Redirects to `/admin` dashboard after successful login

2. **Regular Login** (`/login`)
   - For clients and movers only
   - No admin logic or redirects
   - Requires email verification (except during testing)

3. **Admin Dashboard** (`/admin`)
   - Protected route - redirects to `/adminlogin` if not authenticated
   - Only accessible to whitelisted admin emails
   - Manage movers, clients, approvals, and notes

### Benefits of Separate Login

✅ **No Redirect Conflicts** - Admin and user logins are completely separate
✅ **Cleaner Code** - No admin logic in regular login components
✅ **Better Security** - Clear separation between admin and user authentication
✅ **Easier Maintenance** - Changes to one don't affect the other

### Accessing Admin Panel

**Development:**
```
http://localhost:3000/adminlogin
```

**Production:**
```
https://your-domain.com/adminlogin
```

### Creating a New Admin Account

Since admin accounts are validated by email, you need to:

1. Add the email to the `adminEmails` array in `/pages/admin.tsx`
2. Create the account through Firebase Console or add signup logic
3. Login at `/adminlogin` with the new credentials

### Security Note

The admin email whitelist is defined in:
- `/pages/admin.tsx` - Line ~43-47
- `/pages/adminlogin.tsx` - Line ~19

Make sure these lists match to ensure consistent admin access control.
