# 🕐 Automated TV Subscription Expiry Monitoring

This guide explains the automated cron job system for monitoring TV subscriptions and sending timely notifications to users and administrators.

---

## 📋 Overview

The cron job system automatically:

- **Checks all active TV subscriptions daily**
- **Sends 24-hour expiry warnings** to customers
- **Marks expired subscriptions** and notifies customers
- **Sends daily summaries** to administrators with statistics
- **Prevents duplicate notifications** with smart tracking

---

## ⚙️ How It Works

### Daily Automated Process

```
┌─────────────────────────────────────────────────────────┐
│              Daily at 9:00 AM UTC                       │
│  (Vercel Cron or GitHub Actions triggers the API)      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  /api/tv/check-expiry  │
        │   (POST endpoint)       │
        └────────┬───────────────┘
                 │
                 ├─► Check Authentication
                 │   (Requires CRON_SECRET)
                 │
                 ├─► Query Active Subscriptions
                 │   (from Firebase)
                 │
                 ├─► For Each Subscription:
                 │   │
                 │   ├─► If EXPIRED (expiresAt <= now):
                 │   │   ├─► Update status to "expired"
                 │   │   └─► Send customer expiry email
                 │   │
                 │   └─► If EXPIRING SOON (within 24h):
                 │       ├─► Send 24h warning email
                 │       └─► Mark as "expiryReminderSent"
                 │
                 └─► Send Admin Summary Email
                     (with counts and errors)
```

---

## 🚀 Setup Instructions

### Option 1: Vercel Cron Jobs (Recommended)

**✅ Best for**: Projects deployed on Vercel

**Configuration**: Already set up in `vercel.json`

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

**Required Environment Variables**:

```env
# Add to your Vercel project environment variables
CRON_SECRET=your_random_secret_key_here
ADMIN_EMAIL=admin@yourdomain.com
EMAIL_FROM=noreply@yourdomain.com
EMAIL_APP_PASSWORD=your_gmail_app_password
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

**Steps**:

1. **Deploy to Vercel** - Push your code or deploy via Vercel dashboard
2. **Add Environment Variables** - Go to Project Settings → Environment Variables
3. **Generate CRON_SECRET** - Use a strong random string:
   ```bash
   # Generate a secure secret (run in terminal)
   openssl rand -base64 32
   ```
4. **Verify Cron Setup** - Check Vercel dashboard → Cron Jobs tab
5. **Test Manually** - Trigger from Vercel dashboard or wait for scheduled run

### Option 2: GitHub Actions

**✅ Best for**: Non-Vercel deployments or additional redundancy

**Configuration**: Already set up in `.github/workflows/check-expiry.yml`

**Required GitHub Secrets**:

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret Name   | Value                         | Description                       |
| ------------- | ----------------------------- | --------------------------------- |
| `CRON_SECRET` | `your_random_secret_key_here` | Authentication token for cron job |
| `APP_URL`     | `https://yourdomain.com`      | Your deployed application URL     |

**Steps**:

1. **Add GitHub Secrets** - Navigate to repository settings
2. **Enable GitHub Actions** - Workflows are enabled by default
3. **Test Manually**:
   - Go to Actions tab
   - Select "TV Subscription Expiry Check"
   - Click "Run workflow"
4. **Monitor Runs** - Check Actions tab for execution history

**Manual Trigger**:

```bash
# Trigger via GitHub CLI
gh workflow run check-expiry.yml
```

### Option 3: External Cron Service

**✅ Best for**: Any hosting platform

Use services like:

- [EasyCron](https://www.easycron.com/)
- [cron-job.org](https://cron-job.org/)
- [Cronitor](https://cronitor.io/)

**Configuration**:

1. **Endpoint**: `https://yourdomain.com/api/tv/check-expiry`
2. **Method**: POST
3. **Headers**:
   ```
   Authorization: Bearer YOUR_CRON_SECRET
   Content-Type: application/json
   ```
4. **Schedule**: `0 9 * * *` (Daily at 9 AM UTC)

---

## 🔐 Security

### CRON_SECRET Authentication

The API endpoint is protected with Bearer token authentication:

```typescript
// Check in /app/(main)/api/tv/check-expiry/route.ts
const authHeader = request.headers.get("authorization");
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Best Practices**:

- ✅ Use a strong random secret (32+ characters)
- ✅ Never commit secrets to version control
- ✅ Rotate secrets periodically
- ✅ Store in environment variables only

**Generate Secure Secret**:

```bash
# macOS/Linux
openssl rand -base64 32

# Or Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or online: https://www.random.org/strings/
```

---

## 📧 Email Notifications

### Customer Emails

**24-Hour Expiry Warning** (Sent once per subscription):

```
Subject: Your TV Subscription Expires Soon - [Plan Name]
To: customer@example.com

- Friendly reminder with countdown
- Expiry date prominently displayed
- One-click renewal link
- Support contact information
```

**Subscription Expired**:

```
Subject: Your TV Subscription Has Expired - [Plan Name]
To: customer@example.com

- Service inactive notification
- Benefits of renewing
- Direct renewal link
- Support options
```

### Admin Summary Email

**Daily Report** (Sent only if there are updates):

```
Subject: TV Subscription Expiry Summary - X expiring, Y expired
To: admin@yourdomain.com

📊 Statistics:
- Number of expiring subscriptions (24h warnings sent)
- Number of expired subscriptions
- Any errors encountered

🔗 Quick Actions:
- Direct link to TV Users admin panel
- Timestamp of check
```

---

## ⏰ Schedule Customization

### Modify Schedule

**Vercel (vercel.json)**:

```json
{
  "crons": [
    {
      "path": "/api/tv/check-expiry",
      "schedule": "0 9,21 * * *" // 9 AM and 9 PM UTC
    }
  ]
}
```

**GitHub Actions (.github/workflows/check-expiry.yml)**:

```yaml
on:
  schedule:
    - cron: "0 9,21 * * *" # 9 AM and 9 PM UTC
```

### Cron Syntax Reference

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └────── Month (1-12)
│ │ └───────── Day of month (1-31)
│ └──────────── Hour (0-23)
└───────────────── Minute (0-59)
```

**Common Examples**:

- `0 9 * * *` - Every day at 9:00 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 9,21 * * *` - Daily at 9 AM and 9 PM UTC
- `0 9 * * 1` - Every Monday at 9 AM UTC
- `0 0 1 * *` - First day of every month at midnight UTC

**⚠️ Timezone Note**: Cron jobs typically run in UTC. Convert your local time:

- Nigeria (WAT/UTC+1): 9 AM UTC = 10 AM WAT
- US Eastern (EST/UTC-5): 9 AM UTC = 4 AM EST
- Adjust schedule accordingly!

---

## 🧪 Testing

### Manual API Test

**Using cURL**:

```bash
# Replace with your actual URL and CRON_SECRET
curl -X POST https://yourdomain.com/api/tv/check-expiry \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Expiry check completed",
  "results": {
    "expiringSoonNotifications": 2,
    "expiredNotifications": 1,
    "errors": []
  }
}
```

**Error Response (Invalid Auth)**:

```json
{
  "error": "Unauthorized"
}
```

### Test from Admin Panel

You can trigger the cron job manually from your admin dashboard:

1. Navigate to `/admin/tv-users`
2. Look for "Check Expiry Now" button (if implemented)
3. Or use browser console:
   ```javascript
   fetch("/api/tv/check-expiry", {
     method: "POST",
     headers: {
       Authorization: "Bearer YOUR_CRON_SECRET",
       "Content-Type": "application/json",
     },
   })
     .then((r) => r.json())
     .then(console.log);
   ```

### Verify Emails

**Check Email Delivery**:

1. Create a test subscription expiring in < 24 hours
2. Run the cron job manually
3. Check customer and admin inboxes
4. Verify email content and formatting

**Gmail App Password Issues**:

- Ensure 2-factor authentication is enabled
- Generate fresh App Password from Google Account settings
- Use the 16-character password without spaces

---

## 📊 Monitoring & Logs

### Vercel Logs

View cron execution logs:

1. Go to Vercel dashboard
2. Navigate to your project
3. Click "Logs" tab
4. Filter by cron job executions

### GitHub Actions Logs

View workflow runs:

1. Go to repository Actions tab
2. Select "TV Subscription Expiry Check"
3. Click on any run to see detailed logs
4. Check for success/failure status

### Application Logs

The API route logs important events:

```javascript
console.log(`Expired notification sent to ${email}`);
console.log(`Expiry reminder sent to ${email}`);
console.error(`Error processing subscription:`, error);
```

View logs in your hosting platform's logging dashboard.

---

## 🔧 Troubleshooting

### Common Issues

**1. Cron Job Not Running**

**Vercel**:

- ✅ Verify `vercel.json` is in project root
- ✅ Check Vercel dashboard → Cron Jobs tab
- ✅ Ensure project is deployed (crons don't work locally)
- ✅ Check deployment logs for errors

**GitHub Actions**:

- ✅ Verify `.github/workflows/check-expiry.yml` exists
- ✅ Check Actions tab for workflow runs
- ✅ Ensure repository has Actions enabled
- ✅ Verify GitHub Secrets are set correctly

**2. Unauthorized Error (401)**

```
❌ Problem: API returns "Unauthorized"
✅ Solution:
   - Verify CRON_SECRET matches in both:
     - Environment variables
     - Cron job configuration
   - Ensure no extra spaces or quotes
   - Regenerate secret if needed
```

**3. Emails Not Sending**

```
❌ Problem: Notifications not received
✅ Solutions:
   - Check EMAIL_APP_PASSWORD is correct
   - Verify EMAIL_FROM and ADMIN_EMAIL are set
   - Check Gmail "Less secure app access" is OFF (use App Password)
   - Look for errors in application logs
   - Test email service with a simple API call
```

**4. Duplicate Notifications**

```
❌ Problem: Users receive multiple expiry warnings
✅ Solution:
   - Check expiryReminderSent flag is being set correctly
   - Ensure cron job isn't running too frequently
   - Review Firebase update logic in check-expiry route
```

**5. Missing Subscriptions**

```
❌ Problem: Some subscriptions not checked
✅ Solutions:
   - Verify Firebase query filters active subscriptions only
   - Check subscription data has valid expiresAt timestamp
   - Ensure subscriptionStatus field exists and is correct
```

---

## 🎯 Best Practices

### Frequency Recommendations

**⚠️ Don't run too frequently!**

- ✅ Once daily is sufficient (9 AM UTC recommended)
- ✅ Twice daily if you need faster response (9 AM, 9 PM)
- ❌ Avoid hourly checks (unnecessary email spam)
- ❌ Don't run more than 2-3 times per day

### Email Best Practices

**Customer Notifications**:

- ✅ Send 24-hour warning once only
- ✅ Use friendly, helpful tone
- ✅ Include clear renewal call-to-action
- ✅ Provide support contact information
- ❌ Don't spam with too many reminders

**Admin Notifications**:

- ✅ Send daily summaries, not individual alerts
- ✅ Include actionable statistics
- ✅ Only send when there are updates
- ✅ Provide direct links to admin panel

### Performance Optimization

**For Large User Bases**:

- Consider batching email sends
- Implement rate limiting
- Use queuing system (Bull, BullMQ)
- Monitor Firebase read/write operations
- Set up error alerting (Sentry, etc.)

---

## 📈 Scaling Considerations

### When You Have 100+ Subscriptions

**Optimize Queries**:

```typescript
// Add indexes in firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "tvSubscriptions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "subscriptionStatus", "order": "ASCENDING" },
        { "fieldPath": "expiresAt", "order": "ASCENDING" }
      ]
    }
  ]
}
```

**Email Queue**:
Consider implementing a queue:

- [BullMQ](https://docs.bullmq.io/) with Redis
- [Agenda](https://github.com/agenda/agenda) with MongoDB
- [AWS SQS](https://aws.amazon.com/sqs/) for serverless

**Monitoring**:

- Set up [Sentry](https://sentry.io/) for error tracking
- Use [LogDNA](https://www.mezmo.com/) or [Papertrail](https://www.papertrail.com/) for log aggregation
- Implement [Cronitor](https://cronitor.io/) for cron monitoring

---

## 🔄 Manual Admin Trigger

### Add Admin Button (Optional)

You can add a manual trigger button in your admin panel:

**In `/app/(main)/admin/tv-users/page.tsx`**:

```typescript
const handleCheckExpiry = async () => {
  try {
    const response = await fetch('/api/tv/check-expiry', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log('Expiry check results:', data);
    alert(`Check complete!\nExpiring: ${data.results.expiringSoonNotifications}\nExpired: ${data.results.expiredNotifications}`);
  } catch (error) {
    console.error('Error checking expiry:', error);
    alert('Failed to check expiry. See console for details.');
  }
};

// Add button to UI
<button onClick={handleCheckExpiry}>
  Check Expiry Now
</button>
```

**⚠️ Note**: This requires `NEXT_PUBLIC_CRON_SECRET` in environment variables.

---

## 📚 Related Documentation

- **[EMAIL_NOTIFICATIONS_GUIDE.md](./EMAIL_NOTIFICATIONS_GUIDE.md)** - Complete email system documentation
- **[QUICK_START.md](./QUICK_START.md)** - Quick setup guide
- **[README.md](./README.md)** - Main project documentation

---

## 🆘 Support

### Need Help?

1. **Check Logs First**: Review Vercel/GitHub Actions logs
2. **Test Authentication**: Verify CRON_SECRET is correct
3. **Test Email Service**: Send a test email via API
4. **Check Firebase Rules**: Ensure API can read/write subscriptions
5. **Review Environment Variables**: All required variables set?

### Environment Variables Checklist

```env
# Required for Cron Job
✅ CRON_SECRET=your_random_secret
✅ ADMIN_EMAIL=your_admin@email.com
✅ EMAIL_FROM=noreply@yourdomain.com
✅ EMAIL_APP_PASSWORD=your_gmail_app_password
✅ NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Firebase (also required)
✅ NEXT_PUBLIC_FIREBASE_API_KEY=...
✅ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] `vercel.json` or `.github/workflows/check-expiry.yml` configured
- [ ] `CRON_SECRET` environment variable set
- [ ] `ADMIN_EMAIL` environment variable set
- [ ] Email service working (test email sent successfully)
- [ ] Manual API test successful (returns 200 with results)
- [ ] Create test subscription expiring soon
- [ ] Verify customer receives 24h warning email
- [ ] Verify subscription marked as expired after expiry
- [ ] Verify admin receives daily summary email
- [ ] Check no duplicate notifications sent
- [ ] Monitor first few automated runs in production

---

**🎉 Your automated TV subscription monitoring is now set up!**

Users will receive timely notifications, and you'll stay informed with daily summaries.
