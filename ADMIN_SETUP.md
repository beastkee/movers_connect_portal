# Admin Verification System Setup

## 🚀 Instant Registration Now Live!

Mover registration is now **instant** (~2 seconds) regardless of file uploads!

## How It Works

### For Movers:

1. Register with company details
2. Upload credentials (optional, happens in background)
3. **Account created immediately** - can login right away
4. Status: "Pending Verification"
5. Can browse the platform but **cannot send quotes** until verified
6. Once approved by admin, full access is granted

### For Admins:

1. Go to `/admin-dashboard` page (e.g., `https://your-domain.vercel.app/admin-dashboard`)
2. View all movers with their details and credentials
3. Filter by: All | Pending | Approved | Rejected
4. Click "✓ Approve" or "✗ Reject" for each mover
5. Movers get instant access once approved

## Admin Access Setup

**Default Admin Account (Testing):**

- **Email:** `admin@admin.com`
- **Password:** `admin123`
- ✅ **No email verification required**
- ✅ **Auto-approved verification status**
- ✅ **Instant full access**

**Other configured admin emails:**

- `admin@moversconnect.com`
- `beastkee@example.com`

⚠️ **IMPORTANT:** Change the default admin credentials before production deployment!

**To add your email as admin:**

1. Open `pages/admin-dashboard.tsx`
2. Find line ~27: `const adminEmails = [...];`
3. Add your email to the array
4. Commit and push changes

Example:

```typescript
const adminEmails = [
  "admin@moversconnect.com",
  "youremail@example.com", // Add your email here
];
```

## Verification Statuses

| Status       | Description                | Mover Can Do                                |
| ------------ | -------------------------- | ------------------------------------------- |
| **Pending**  | Awaiting admin review      | Browse, view requests, cannot send quotes   |
| **Approved** | Verified by admin          | Full access - send quotes, receive bookings |
| **Rejected** | Admin rejected application | Browse only, contact support                |

## Admin Dashboard Features

- 📊 Overview of all movers with counts
- 🔍 Filter by verification status
- 📄 View uploaded credentials (click to open in new tab)
- ✓ One-click approve/reject
- 📧 Display company name, email, contact, service area
- 📅 Registration date tracking

## Security

- Access restricted to emails in `adminEmails` array
- Non-admin users redirected to homepage
- Verification status stored in Firestore
- All status changes logged with admin email and timestamp

## URL

Access admin dashboard at: `/admin-dashboard`

- Local: `http://localhost:3000/admin-dashboard`
- Production: `https://movers-connect-portal.vercel.app/admin-dashboard`

## Benefits

✅ **Instant registration** - no waiting for file uploads
✅ **Better UX** - movers can explore immediately  
✅ **Security maintained** - admin approval required for transactions
✅ **Swift verification** - admin can bulk-process applications
✅ **Audit trail** - all approvals tracked with timestamps

## 🚀 Quick Setup - Creating Admin Account

### Option 1: Register via UI (Recommended)

1. Go to your app's register page
2. Register as a **Client** (not mover) with:
   - Email: `admin@admin.com`
   - Password: `admin123`
3. Login with these credentials
4. Navigate to `/admin-dashboard` page
5. You now have admin access!

### Option 2: Register as Mover

You can also register as a mover with `admin@admin.com` - the system checks the email, not the account type.

### Accessing Admin Dashboard

1. Login with `admin@admin.com` / `admin123`
2. Go to `/admin-dashboard` URL directly:
   - Local: `http://localhost:3000/admin-dashboard`
   - Production: `https://your-app.vercel.app/admin-dashboard`
3. Start approving/rejecting movers!

---

**Note:** This is a development/testing account. Change credentials before production!
