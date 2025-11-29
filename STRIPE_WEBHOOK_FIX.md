# Stripe Webhook Configuration - Production Fix

## Problem
Donation receipts not being sent because Stripe webhook is not triggering the `/api/donations/webhook` endpoint.

## Root Cause
Webhook endpoint not configured in Stripe Dashboard for your live/test environment.

---

## Solution Steps

### 1. Configure Webhook in Stripe Dashboard

**Go to Stripe Dashboard:**
- Live mode: https://dashboard.stripe.com/webhooks
- Test mode: https://dashboard.stripe.com/test/webhooks

**Add Endpoint:**
1. Click "+ Add endpoint"
2. **Endpoint URL**: `https://haltshelter.onrender.com/api/donations/webhook`
3. **Description**: "Haltshelter Donation Receipts"
4. **Events to send**:
   - Click "Select events"
   - Search for and select:
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
   - Click "Add events"
5. Click "Add endpoint"

### 2. Copy Signing Secret

After creating the endpoint:
1. Click on your new endpoint in the list
2. Click "Reveal" next to "Signing secret"
3. Copy the secret (starts with `whsec_...`)

### 3. Update Render Environment Variable

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your `haltshelter` service
3. Go to "Environment" tab
4. Find `STRIPE_WEBHOOK_SECRET`
5. Click "Edit" and paste the signing secret from step 2
6. Click "Save Changes" (this will trigger a redeploy)

---

## Verification

### Test the Webhook

After updating the environment variable and redeployment:

1. **Make a test donation** on your site
2. **Check Stripe Dashboard** → Webhooks → Your endpoint → "Events & logs" tab
   - You should see the `payment_intent.succeeded` event
   - Status should be `200` (success)
   - If it shows an error, click to see details

3. **Check Render Logs** (https://dashboard.render.com/):
   - Look for: `[WEBHOOK] Received event id=evt_... type=payment_intent.succeeded`
   - Then: `[RECEIPT] Sending receipt to bellahipismo@gmail.com`
   - Finally: `[EMAIL] ✅ Email sent successfully via SendGrid`

4. **Check your email** for the donation receipt

### Common Issues

**Webhook shows 401/403 error:**
- Signing secret doesn't match
- Regenerate secret and update `STRIPE_WEBHOOK_SECRET` on Render

**Webhook shows 404 error:**
- Check endpoint URL is exactly: `https://haltshelter.onrender.com/api/donations/webhook`
- No trailing slash

**Webhook shows 500 error:**
- Check Render logs for the actual error
- Likely a code issue in `server/routes/donations-webhook.js`

**No webhook events appearing:**
- Make sure you're in the same mode (test vs live) in both:
  - Stripe Dashboard where webhook is configured
  - Frontend where you're using the publishable key
  - Check `REACT_APP_STRIPE_PUBLISHABLE_KEY` starts with `pk_test_` or `pk_live_`

---

## Important Notes

### Test vs Live Mode

Stripe has separate webhook endpoints for test and live mode:
- **Test mode**: Use test publishable key `pk_test_...` and test webhook
- **Live mode**: Use live publishable key `pk_live_...` and live webhook

Make sure the mode matches between:
1. Frontend publishable key
2. Backend secret key
3. Webhook configuration

### Current Setup

Based on your env vars, you're likely in **TEST MODE** (verify by checking if `REACT_APP_STRIPE_PUBLISHABLE_KEY` starts with `pk_test_`).

Configure the webhook in **TEST MODE** dashboard:
https://dashboard.stripe.com/test/webhooks

### Webhook CLI (Development Only)

For local development, use Stripe CLI instead:
```powershell
.\stripe-cli\stripe.exe listen --forward-to localhost:5000/api/donations/webhook
```

This is NOT needed for production on Render.

---

## Security Reminder

⚠️ **URGENT**: Your SendGrid API key was exposed in the screenshot. You must:
1. Go to SendGrid → Settings → API Keys
2. Delete the key: `listentoHaltshelter48tank1`
3. Create a new API key
4. Update `SENDGRID_API_KEY` on Render with the new key
5. Never share API keys in screenshots/messages again

---

## After Fix

Once the webhook is working:
- ✅ Donations will be saved to MongoDB automatically
- ✅ Receipt emails will be sent via SendGrid
- ✅ Emails will show as from `contact@haltshelter.org` (not "via sendgrid.net")
- ✅ Duplicate events won't send duplicate emails (idempotency)

## Next Steps

After confirming receipts work:
1. Rotate SendGrid API key (security)
2. Add SendGrid Event Webhook (track bounces/complaints)
3. Centralize email templates
4. Tighten DMARC policy to `p=quarantine`
