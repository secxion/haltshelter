# SendGrid Email Setup Guide

## Why SendGrid Instead of SMTP?

Render (and many cloud platforms) block outbound SMTP connections on ports 25, 587, and sometimes 465 to prevent spam. SendGrid uses HTTPS API calls instead of SMTP, which works reliably on all cloud platforms.

**Free Tier**: 100 emails/day (perfect for donation receipts)

---

## Setup Steps

### 1. Create SendGrid Account
1. Go to https://signup.sendgrid.com/
2. Sign up with your haltshelter email
3. Complete verification

### 2. Create API Key
1. Log into SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name: `haltshelter-render-production`
5. Permissions: **Full Access** (or at minimum **Mail Send**)
6. Click **Create & View**
7. **COPY THE API KEY** (you can only see it once!)

### 3. Verify Sender Identity
SendGrid requires you to verify your email address or domain:

**Option A: Single Sender Verification (Quick)**
1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Enter `contact@haltshelter.org`
4. Fill out the form
5. Check your email and click verification link

**Option B: Domain Authentication (Professional)**
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow steps to add DNS records to your domain
4. This allows sending from any @haltshelter.org address

### 4. Configure Render Environment Variables

In your Render dashboard for haltshelter service:

1. Add new environment variable:
   - Key: `SENDGRID_API_KEY`
   - Value: `[paste your API key from step 2]`

2. Add another variable:
   - Key: `SENDGRID_FROM_EMAIL`
   - Value: `contact@haltshelter.org`

3. Prefer SendGrid immediately (skip waiting for SMTP timeout):
   - Key: `USE_SENDGRID_FIRST`
   - Value: `true`

4. Click **Save Changes** (this will redeploy your service)

---

## Installation

The SendGrid npm package needs to be installed:

```bash
npm install @sendgrid/mail
```

Then commit and push to trigger Render deployment.

---

## Code Changes Required

The `server/routes/donations-webhook.js` file needs to switch to SendGrid when `USE_SENDGRID=true`.

I can make this change for you automatically - just let me know!

---

## Testing

After setup, test with:
```
https://haltshelter.onrender.com/api/test/send-test-email?email=YOUR_EMAIL
```

You should receive a test email within seconds.

If you enabled `USE_SENDGRID_FIRST=true`, the email is sent via SendGrid immediately without attempting SMTP first.

---

## Troubleshooting

### "Forbidden" Error
- Your sender email (contact@haltshelter.org) is not verified
- Go to SendGrid → Sender Authentication and verify it

### "Unauthorized" Error  
- Wrong API key
- Check the API key in Render environment variables

### No Email Received
- Check spam folder
- Check SendGrid dashboard → Activity Feed for delivery status

---

## Cost

- **Free tier**: 100 emails/day forever
- **Essentials plan**: $19.95/month for 50,000 emails/month
- **Pro plan**: $89.95/month for 100,000 emails/month

For a donation platform, free tier should be sufficient unless you get 100+ donations per day.

---

## Next Steps

1. Create SendGrid account
2. Get API key
3. Verify sender email
4. Add environment variables to Render
5. Install @sendgrid/mail package
6. Let me know when ready - I'll update the code to use SendGrid
