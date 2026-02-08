# Email Notifications System - Testing Guide

## Overview

Comprehensive email notification system for Lodge Internet device codes and TV Unlimited subscriptions.

## Email Templates Added

### 1. Device Code Purchase (3 & 5 Devices)

**When**: User completes payment for device plan  
**Recipients**: Customer  
**Template**: `getDeviceCodeEmail()`  
**Subject**: `Your Lodge Internet Access Code - [Plan Name]`  
**Content**:

- Access code prominently displayed
- Plan details (name, devices, duration, price)
- Usage instructions
- Important notes

### 2. TV Subscription Created

**When**: User completes payment for TV plan  
**Recipients**: Customer + Admin  
**Templates**:

- Customer: `getTVSubscriptionCreatedEmail()`
- Admin: `getTVSubscriptionAdminNotification()`  
  **Subject**:
- Customer: `TV Unlimited Subscription Created - [Plan Name]`
- Admin: `New TV Subscription - [Plan Name] - [Customer Name]`  
  **Content**:
- Customer: Subscription details, pending activation status, link to dashboard
- Admin: Customer info, MAC address, subscription details, activation required notice

### 3. TV Subscription Activated

**When**: Admin activates subscription  
**Recipients**: Customer  
**Template**: `getTVSubscriptionActivatedEmail()`  
**Subject**: `Your TV Subscription is Now Active! - [Plan Name]`  
**Content**:

- Active status confirmation
- Subscription details
- Expiry date
- Link to dashboard

### 4. TV Subscription Expiring Soon

**When**: 24 hours before expiry (automated check)  
**Recipients**: Customer  
**Template**: `getTVSubscriptionExpiringSoonEmail()`  
**Subject**: `Your TV Subscription Expires Soon - [Plan Name]`  
**Content**:

- Expiry warning
- Time remaining
- Renewal link
- Encouragement to renew

### 5. TV Subscription Expired

**When**: Subscription expires (automated check)  
**Recipients**: Customer  
**Template**: `getTVSubscriptionExpiredEmail()`  
**Subject**: `Your TV Subscription Has Expired`  
**Content**:

- Expired status notification
- Service inactive notice
- Renewal benefits
- Renewal link

## API Routes Modified

### 1. `/api/data-codes/claim` (Device Codes)

**Added**: Email notification after code is claimed  
**Sends**: Device code email to customer

### 2. `/api/tv/purchase` (TV Subscriptions)

**Added**: Dual email notifications after purchase  
**Sends**:

- Creation email to customer
- Admin notification to ADMIN_EMAIL

### 3. `/api/tv/activate` (TV Subscriptions)

**Added**: Activation confirmation email  
**Sends**: Activation email to customer

### 4. `/api/tv/check-expiry` (NEW - TV Subscriptions)

**Purpose**: Check for expiring/expired subscriptions  
**Triggers**: Manual (via admin panel) or scheduled (cron job)  
**Sends**:

- Expiring soon emails (24h before expiry)
- Expired emails (when status changes to expired)

## Configuration

### Environment Variables

```env
# Email Configuration
EMAIL_FROM=adebayoayobamidavid@gmail.com
EMAIL_APP_PASSWORD=kqqa pfbf rnqp lijq
ADMIN_EMAIL=adebayoayobamidavid@gmail.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Email Service

- Provider: Gmail SMTP
- Library: Nodemailer
- Templates: HTML with inline CSS (Apple-inspired design)

## Testing Procedures

### Test 1: Device Code Purchase Email

1. Go to `/internet` page
2. Select a 3 or 5 device plan
3. Enter email address
4. Complete payment with test Paystack key
5. **Expected**: Email received with access code

### Test 2: TV Subscription Creation Emails

1. Go to `/internet` page
2. Select TV Unlimited plan
3. Enter email (new user)
4. Enter name and MAC address
5. Complete payment
6. Create password
7. **Expected**:
   - Customer receives creation email
   - Admin receives notification email

### Test 3: TV Subscription Activation Email

1. Login to admin panel at `/admin/tv-users`
2. Navigate to "Pending Activation" tab
3. Click "Activate" button on a subscription
4. **Expected**: Customer receives activation email

### Test 4: Manual Expiry Check

1. Login to admin panel at `/admin/tv-users`
2. Click "Check for Expiring Subscriptions" button
3. **Expected**:
   - System checks all active subscriptions
   - Sends expiring soon emails (if within 24h)
   - Sends expired emails and updates status
   - Shows summary alert

### Test 5: Automated Expiry Check (Cron)

**Setup**: Configure a cron job to hit `/api/tv/check-expiry` daily

```bash
# Example: Daily at 9 AM
0 9 * * * curl -X POST http://localhost:3000/api/tv/check-expiry
```

## Email Design Features

### Consistent Branding

- Gradient headers: Purple to blue (`#667eea` to `#764ba2`)
- Apple-style design system
- Rounded corners (8px border-radius)
- Responsive layout (max-width: 600px)
- Professional color scheme

### Status Indicators

- **Pending**: Orange/amber colors
- **Active**: Green colors
- **Expired**: Red colors
- **Info**: Blue colors

### Interactive Elements

- Gradient buttons matching site design
- Links to dashboard, admin panel, renewal page
- Email preference management links

### Accessibility

- Plain text fallback
- High contrast ratios
- Clear hierarchy
- Readable font sizes

## Firestore Indexes Required

### Added Indexes

```json
{
  "collectionGroup": "tvSubscriptions",
  "fields": [
    { "fieldPath": "subscriptionStatus", "order": "ASCENDING" },
    { "fieldPath": "expiryReminderSent", "order": "ASCENDING" },
    { "fieldPath": "expiresAt", "order": "ASCENDING" }
  ]
}
```

### Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

## Type Updates

### TVSubscription Interface

Added field:

```typescript
expiryReminderSent?: boolean; // Flag to track if expiry reminder was sent
```

## Admin Features

### TV Users Admin Panel

- **New Button**: "Check for Expiring Subscriptions"
- **Location**: Top right, next to page title
- **Functionality**: Manually triggers expiry check
- **Feedback**: Shows results in alert dialog

## Error Handling

### Email Failures

- **Strategy**: Logged but doesn't fail the request
- **Logging**: Console errors with email recipient
- **User Impact**: Minimal - transaction still completes

### API Errors

- **Invalid data**: Returns 400 with error message
- **Server errors**: Returns 500 with error message
- **Missing config**: Logs warning, continues operation

## Production Recommendations

### 1. Set Up Cron Job

Use a service like Vercel Cron, GitHub Actions, or external cron service to hit `/api/tv/check-expiry` daily.

**Example Vercel Cron** (`vercel.json`):

```json
{
  "crons": [
    {
      "path": "/api/tv/check-expiry",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### 2. Monitor Email Delivery

- Check Gmail "Sent" folder
- Monitor bounce rates
- Set up email delivery notifications

### 3. Update Admin Email

Change `ADMIN_EMAIL` in production environment to appropriate admin address.

### 4. Test Email Templates

- Send test emails to multiple email providers (Gmail, Outlook, Yahoo)
- Verify rendering across email clients
- Check spam folder placement

### 5. Rate Limiting

Consider implementing rate limits on email sending to avoid hitting Gmail's sending limits.

## Troubleshooting

### Emails Not Sending

1. Check `EMAIL_FROM` and `EMAIL_APP_PASSWORD` in `.env.local`
2. Verify Gmail App Password is correct
3. Check console logs for errors
4. Ensure "Less secure app access" is enabled (or use App Password)

### Wrong Email Content

1. Verify correct template is being used
2. Check data being passed to template functions
3. Review template HTML in browser

### Expiry Check Not Working

1. Verify cron job is running
2. Check Firestore indexes are deployed
3. Review API logs for errors
4. Manually trigger from admin panel to test

## Next Steps

1. ✅ Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
2. ✅ Test all email flows in development
3. ✅ Set up production cron job for expiry checks
4. ✅ Update admin email in production environment
5. ✅ Monitor email delivery rates
6. ✅ Consider adding email preferences for customers
