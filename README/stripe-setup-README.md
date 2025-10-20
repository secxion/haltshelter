# Stripe Integration Setup Guide

This guide will help you complete the Stripe integration for your HALT Shelter donation system.

## Prerequisites

✅ **COMPLETED:**
- Stripe CLI installed (`stripe-cli/stripe.exe`)
- Webhook endpoint created (`/api/webhooks`)
- Backend server running on port 5000
- Frontend server running on port 3001

## Step 1: Get Your Stripe API Keys

1. **Log into your Stripe Dashboard:** https://dashboard.stripe.com/
2. **Navigate to:** Developers > API keys
3. **Copy the following keys:**
   - Publishable key (starts with `pk_test_...` for test mode)
   - Secret key (starts with `sk_test_...` for test mode)

## Step 2: Update Your Environment Variables

Add these to your `.env` file in the project root:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here_after_step_4

# React App Environment Variables
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 3: Login to Stripe CLI

Open a **NEW** PowerShell terminal and run:

```powershell
cd 'C:\Users\board\Desktop\Halt\halt-donation'
.\stripe-cli\stripe.exe login
```

This will open your browser to authenticate with Stripe.

## Step 4: Start Webhook Forwarding

In the same terminal, run:

```powershell
.\stripe-cli\stripe.exe listen --forward-to localhost:5000/api/webhooks
```

**IMPORTANT:** This command will output a webhook signing secret that looks like:
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

**Copy this secret** and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

## Step 5: Test the Integration

1. **Restart your development servers** (to pick up the new environment variables):
   ```powershell
   npm run dev
   ```

2. **Open your application:** http://localhost:3001

3. **Navigate to the donation page** and test with Stripe's test card numbers:
   - **Success:** `4242 4242 4242 4242`
   - **Decline:** `4000 0000 0000 0002`
   - **Requires 3D Secure:** `4000 0025 0000 3155`

## Step 6: Monitor Webhook Events

In the terminal where you ran `stripe listen`, you should see webhook events being received when you make test payments:

```
2024-01-15 14:30:25   --> payment_intent.created [evt_1ABC...]
2024-01-15 14:30:26   --> payment_intent.succeeded [evt_1DEF...]
```

## Step 7: Check Database Records

After a successful test payment, check your MongoDB database to ensure donation records are being created properly.

## For Production Deployment

When you're ready to go live:

1. **Activate your Stripe account** in the Stripe Dashboard
2. **Switch to live mode** in Stripe Dashboard
3. **Get your live API keys** (they'll start with `pk_live_...` and `sk_live_...`)
4. **Create a live webhook endpoint** in Stripe Dashboard pointing to your production server
5. **Update your production environment variables** with live keys

## Troubleshooting

### Common Issues:

1. **"Tracking Prevention blocked access to storage" warnings:**
   - **This is normal and safe to ignore** during development
   - These are browser privacy features blocking Stripe's analytics
   - Payment processing still works perfectly
   - You can disable tracking prevention in your browser if the messages bother you

2. **"Stripe is not configured" error:**
   - Check that your `.env` file has the correct keys
   - Restart your development servers after adding keys

2. **Webhook signature verification failed:**
   - Ensure you're using the webhook secret from the `stripe listen` command
   - The secret should start with `whsec_`

3. **CORS errors:**
   - Ensure your frontend URL is in the CORS whitelist in `server/app.js`

4. **Payment not appearing in database:**
   - Check the webhook terminal for error messages
   - Verify MongoDB connection is working
   - Check server logs for database errors

### Support Commands:

```powershell
# Test webhook endpoint
.\stripe-cli\stripe.exe trigger payment_intent.succeeded

# View Stripe events
.\stripe-cli\stripe.exe events list

# Test with specific amount
.\stripe-cli\stripe.exe trigger payment_intent.succeeded --add payment_intent:amount=2500
```

## Security Notes

- Never commit your `.env` file to version control
- Use test keys during development
- Rotate your keys if they're ever compromised
- Enable Stripe's fraud detection in production

---

**Next Steps:** Once this setup is complete, your donation system will be fully functional with secure payment processing and automatic donation record creation.
