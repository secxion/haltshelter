# Hostinger SMTP Setup for Render (CRITICAL)

## Required Environment Variables on Render

Set these **EXACT** values in Render Dashboard → Your Service → Environment:

```bash
# SMTP Configuration (Hostinger)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contact@haltshelter.org
SMTP_PASS=your_email_password_here
SMTP_FROM=contact@haltshelter.org

# Disable SendGrid primary (use as fallback only)
USE_SENDGRID_FIRST=false

# SendGrid (keep as fallback)
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=contact@haltshelter.org
```

## CRITICAL: Hostinger SMTP Ports

Hostinger supports these SMTP configurations:

### Option 1: Port 465 (SSL/TLS) - RECOMMENDED
- **Port**: 465
- **SMTP_SECURE**: true
- **Encryption**: SSL/TLS from connection start
- **Best for**: Render and most cloud hosts

### Option 2: Port 587 (STARTTLS)
- **Port**: 587
- **SMTP_SECURE**: false
- **Encryption**: STARTTLS upgrade
- **May fail on**: Some cloud hosts (firewall blocks)

### Option 3: Port 25 (Plain/STARTTLS)
- **Port**: 25
- **Not recommended**: Often blocked by cloud providers

## Current Implementation (email.js)

The code now:
1. ✅ Forces SMTP as primary (ignores USE_SENDGRID_FIRST)
2. ✅ Auto-detects secure mode based on port (465 = secure)
3. ✅ Extended timeouts (15s connection, 10s greeting)
4. ✅ Enables SMTP debug logging
5. ✅ Falls back to SendGrid only if SMTP fails
6. ✅ Detailed error reporting (code, command, response)

## Verification Steps

### 1. Check Render Environment Variables
```bash
# In Render Dashboard → Environment, verify:
SMTP_HOST = smtp.hostinger.com
SMTP_PORT = 465
SMTP_SECURE = true
SMTP_USER = contact@haltshelter.org
SMTP_PASS = [your_password]
```

### 2. Test SMTP Credentials Locally (Optional)
Create `test-smtp-direct.js`:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'contact@haltshelter.org',
    pass: 'YOUR_PASSWORD_HERE'
  },
  logger: true,
  debug: true
});

transporter.sendMail({
  from: 'contact@haltshelter.org',
  to: 'bellahipismo@gmail.com',
  subject: 'SMTP Direct Test',
  text: 'If you receive this, Hostinger SMTP works!'
}).then(info => {
  console.log('✅ Success:', info);
}).catch(err => {
  console.error('❌ Failed:', err);
});
```

Run: `node test-smtp-direct.js`

### 3. Check DNS Records (Already Set)
- ✅ SPF: `v=spf1 include:_spf.mail.hostinger.com include:sendgrid.net ~all`
- ✅ DKIM: Configured for Hostinger
- ✅ DMARC: `v=DMARC1; p=none; rua=mailto:contact@haltshelter.org`

### 4. Monitor Render Logs After Deploy
Look for:
```
[EMAIL] 🔧 Configuring SMTP transporter: smtp.hostinger.com:465 (secure=true)
[EMAIL] ✅ SMTP transporter configured (primary email service)
[WEBHOOK] 📨 Sending receipt to bellahipismo@gmail.com...
[EMAIL] 🔌 Attempting SMTP send via smtp.hostinger.com:465...
[EMAIL] ✅ Email sent successfully via SMTP
```

### 5. Common Errors and Fixes

#### Error: ETIMEDOUT
- **Cause**: Firewall blocking port
- **Fix**: Switch from 587 to 465, ensure SMTP_SECURE=true

#### Error: EAUTH (Authentication failed)
- **Cause**: Wrong password or username
- **Fix**: Reset password in Hostinger, update SMTP_PASS

#### Error: EENVELOPE (No recipients)
- **Cause**: Metadata missing donor_email
- **Fix**: Check PaymentIntent metadata in webhook logs

#### Error: 554 5.7.1 Message rejected
- **Cause**: SPF/DKIM failure or spam filter
- **Fix**: Verify DNS records, check email content

## Webhook Flow Verification

After deploying, send test payment and check logs for this sequence:

```
1. [WEBHOOK] ========== WEBHOOK ENDPOINT HIT AT 2025-11-29T...
2. [WEBHOOK] ✅ Event verified: id=evt_... type=payment_intent.succeeded
3. [WEBHOOK] 💳 payment_intent.succeeded: pi_... amount=$25
4. [WEBHOOK] 📧 Creating donation for bellahipismo@gmail.com - $25 USD
5. [WEBHOOK] ✅ Donation saved: <donation_id>
6. [WEBHOOK] 📨 Sending receipt to bellahipismo@gmail.com...
7. [EMAIL] 🔌 Attempting SMTP send via smtp.hostinger.com:465...
8. [EMAIL] ✅ Email sent successfully via SMTP
9. [WEBHOOK] ✅ Receipt sent successfully to bellahipismo@gmail.com
10. [WEBHOOK] 💾 Donation updated with receiptSent flag
```

If step 7-8 fails, logs will show detailed SMTP error for troubleshooting.

## Emergency Fallback: SendGrid

If Hostinger SMTP completely fails (e.g., account suspended), the system will:
1. Log SMTP failure with full error details
2. Automatically retry via SendGrid API
3. Continue processing without manual intervention

## Next Steps After Deploy

1. ✅ Push code changes
2. ⏱️ Wait for Render redeploy (1-2 min)
3. 💳 Send test payment from website
4. 📋 Check Render logs for webhook sequence
5. 📧 Verify email receipt in inbox (check spam folder)
6. 🔍 If failed, check SMTP error details in logs
7. 🔧 Adjust SMTP_PORT or credentials as needed

## Support Contact

- **Hostinger SMTP Support**: https://www.hostinger.com/tutorials/how-to-use-free-email-with-gmail
- **Render Support**: https://render.com/docs/troubleshooting
- **SendGrid Docs**: https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp
