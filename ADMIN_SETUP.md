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
1. Go to `/admin` page (e.g., `https://your-domain.vercel.app/admin`)
2. View all movers with their details and credentials
3. Filter by: All | Pending | Approved | Rejected
4. Click "✓ Approve" or "✗ Reject" for each mover
5. Movers get instant access once approved

## Admin Access Setup

**Currently configured admin emails:**
- `admin@moversconnect.com`
- `beastkee@example.com`

**To add your email as admin:**
1. Open `pages/admin.tsx`
2. Find line ~27: `const adminEmails = [...];`
3. Add your email to the array
4. Commit and push changes

Example:
```typescript
const adminEmails = [
  "admin@moversconnect.com",
  "youremail@example.com",  // Add your email here
];
```

## Verification Statuses

| Status | Description | Mover Can Do |
|--------|-------------|--------------|
| **Pending** | Awaiting admin review | Browse, view requests, cannot send quotes |
| **Approved** | Verified by admin | Full access - send quotes, receive bookings |
| **Rejected** | Admin rejected application | Browse only, contact support |

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

Access admin dashboard at: `/admin`
- Local: `http://localhost:3000/admin`
- Production: `https://movers-connect-portal.vercel.app/admin`

## Benefits

✅ **Instant registration** - no waiting for file uploads
✅ **Better UX** - movers can explore immediately  
✅ **Security maintained** - admin approval required for transactions
✅ **Swift verification** - admin can bulk-process applications
✅ **Audit trail** - all approvals tracked with timestamps
