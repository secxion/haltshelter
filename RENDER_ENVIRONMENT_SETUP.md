# Render Environment Variables Setup

## Critical: Build-Time vs Runtime Variables

### For React Frontend (Build-Time Variables)
These must be set in Render's **Environment** section and will be baked into the build:

```
REACT_APP_API_URL=/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
```

**Important:** After adding these variables, you MUST trigger a **Manual Deploy** or push a new commit to rebuild the frontend with the new environment variables.

### For Node.js Backend (Runtime Variables)
These are used by the server at runtime:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-here
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
FRONTEND_URL=https://haltshelter.onrender.com
ALLOWED_ORIGINS=https://haltshelter.onrender.com
```

## Step-by-Step Setup on Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your `haltshelter` web service
3. Click on **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add each variable one by one:
   - Key: `REACT_APP_API_URL`
   - Value: `/api`
   - Click **Add**
6. Repeat for all variables listed above
7. **CRITICAL:** After adding all variables, go to **Manual Deploy** and click **Deploy latest commit**

## Verification

After deployment completes:

1. Check browser console for errors
2. Verify API calls go to `https://haltshelter.onrender.com/api/...` not `localhost`
3. Test donation flow with Stripe test card: `4242 4242 4242 4242`

## Stripe Webhook Configuration

1. Go to Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter URL: `https://haltshelter.onrender.com/api/donations/webhook`
4. Select events: `payment_intent.succeeded`, `invoice.paid`, `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to Render as `STRIPE_WEBHOOK_SECRET`
7. Redeploy the service

## Common Issues

### Issue: Frontend still calls localhost
**Cause:** Environment variables not set during build
**Solution:** Add `REACT_APP_API_URL=/api` and trigger a new deployment

### Issue: CSP blocking fetch requests
**Cause:** Missing `'self'` in CSP connectSrc directive  
**Solution:** Already configured in server/app.js - ensure latest code is deployed

### Issue: Stripe payments failing
**Cause:** Missing Stripe keys
**Solution:** Set `REACT_APP_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`
