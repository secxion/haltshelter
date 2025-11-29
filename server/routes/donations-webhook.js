const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Donation } = require('../models');
const { logToFile } = require('../utils/fileLogger');

// Extracted Stripe webhook handler for raw body mounting.
module.exports = async function donationsWebhookHandler(req, res) {
  logToFile('[DIAG] Webhook handler entered');
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Additional high-level event logging for diagnostics
  try {
    logToFile(`[WEBHOOK] Received event id=${event.id} type=${event.type}`);
  } catch(e) {}

  switch (event.type) {
    case 'payment_intent.succeeded':
    case 'invoice.payment_succeeded':
    case 'invoice.paid':
    case 'invoice_payment.paid': {
      let paymentIntent, invoice;
      if (event.type === 'payment_intent.succeeded') {
        paymentIntent = event.data.object;
        logToFile(`[WEBHOOK] payment_intent.succeeded intent=${paymentIntent.id}`);
      } else {
        invoice = event.data.object;
        try {
          if (invoice && invoice.object === 'invoice_payment' && invoice.invoice) {
            const fetched = await stripe.invoices.retrieve(invoice.invoice);
            invoice = fetched;
          }
        } catch (e) {
          logToFile(`[DIAG] Could not retrieve full invoice for wrapper object: ${e}`);
        }
        if (invoice && invoice.payment_intent) {
          try {
            paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
            logToFile(`[WEBHOOK] Retrieved paymentIntent ${paymentIntent.id} from invoice ${invoice.id}`);
          } catch (e) {
            logToFile(`[DIAG] Could not retrieve paymentIntent for invoice: ${e}`);
          }
        }
      }

      let donation = null;
      try {
        let transactionId = '';
        let stripeSubscriptionId = '';
        if (paymentIntent && paymentIntent.id) {
          transactionId = paymentIntent.id;
        } else if (invoice) {
          transactionId = invoice.charge || invoice.id;
        }
        if (invoice && invoice.subscription) {
          stripeSubscriptionId = invoice.subscription;
        } else if (paymentIntent && paymentIntent.metadata && paymentIntent.metadata.stripeSubscriptionId) {
          stripeSubscriptionId = paymentIntent.metadata.stripeSubscriptionId;
        }

        if (transactionId) {
          donation = await Donation.findOne({ transactionId });
          if (donation) {
            logToFile(`[DIAG] Found donation by transactionId: ${donation._id}`);
          }
        }
        if (!donation && stripeSubscriptionId && transactionId) {
          donation = await Donation.findOne({ stripeSubscriptionId, transactionId });
          if (donation) {
            logToFile(`[DIAG] Found donation by stripeSubscriptionId + transactionId: ${donation._id}`);
          }
        }
        if (donation) {
          logToFile(`[DIAG] Duplicate payment event received; donation exists transactionId=${donation.transactionId}`);
          // If receipt already sent, skip email sending to ensure idempotency
          if (donation.receiptSent) {
            logToFile('[DIAG] Receipt already sent for this donation. Skipping email.');
            break;
          } else {
            logToFile('[DIAG] Donation exists without receipt; will proceed to send receipt.');
          }
        }

        let donorName = 'Supporter';
        let donorEmail = '';
        let donationType = 'one-time';
        let amount = 0;
        let currency = 'USD';
        let stripeCustomerId = '';
        let isRecurring = false;

        if (paymentIntent) {
          const meta = paymentIntent.metadata || {};
          donorName = meta.donor_name || meta.donorName || paymentIntent.shipping?.name || 'Supporter';
          donorEmail = meta.donor_email || meta.donorEmail || paymentIntent.receipt_email;
          if (invoice && invoice.subscription) {
            donationType = 'monthly';
            isRecurring = true;
          } else {
            donationType = meta.donation_type || 'one-time';
            isRecurring = donationType !== 'one-time';
          }
          amount = paymentIntent.amount / 100;
          currency = paymentIntent.currency ? paymentIntent.currency.toUpperCase() : 'USD';
          stripeCustomerId = paymentIntent.customer;
          if ((!donorEmail || donorEmail === 'null' || donorEmail === 'undefined') && paymentIntent.customer) {
            try {
              const customer = await stripe.customers.retrieve(paymentIntent.customer);
              if (customer && customer.email) {
                donorEmail = customer.email;
                donorName = customer.name || donorName;
                logToFile(`[DIAG] Retrieved donor email from Stripe customer: ${donorEmail}`);
              }
            } catch (custErr) {
              logToFile(`[DIAG] Error fetching Stripe customer for email: ${custErr}`);
            }
          }
        } else if (invoice) {
          amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0;
          currency = invoice.currency ? invoice.currency.toUpperCase() : 'USD';
          stripeCustomerId = invoice.customer;
          if (invoice.subscription) {
            donationType = 'monthly';
            isRecurring = true;
          }
          if (invoice.customer) {
            try {
              const customer = await stripe.customers.retrieve(invoice.customer);
              if (customer && customer.email) {
                donorEmail = customer.email;
                donorName = customer.name || donorName;
                logToFile(`[DIAG] Retrieved donor email from Stripe customer (invoice fallback): ${donorEmail}`);
              }
            } catch (custErr) {
              logToFile(`[DIAG] Error fetching Stripe customer for invoice fallback: ${custErr}`);
            }
          }
        }

        let donationJustCreated = false;
        if (donorEmail) {
          donation = new Donation({
            donorInfo: { name: donorName, email: donorEmail },
            amount,
            currency,
            donationType,
            paymentMethod: 'stripe',
            paymentStatus: 'completed',
            transactionId,
            stripeCustomerId,
            stripeSubscriptionId,
            source: 'website',
            isRecurring,
            completedAt: new Date()
          });
          try {
            await donation.save();
            logToFile(`[DIAG] Donation created and saved (dedup safe): ${donation._id}`);
            donationJustCreated = true;
          } catch (saveErr) {
            logToFile(`[DIAG] Error saving new donation (dedup safe): ${saveErr}`);
            if (saveErr.code === 11000) {
              donation = await Donation.findOne({ transactionId });
              donationJustCreated = false;
            } else {
              donation = null;
            }
          }
        } else {
          logToFile('[DIAG] Could not create donation: donor email missing in all sources.');
        }

        if (!donation) {
          const noDonationMsg = '[DIAG] No donation object available for receipt email. Skipping email send.';
          console.log(noDonationMsg);
          logToFile(noDonationMsg);
        } else if (donationJustCreated || !donation.receiptSent) {
          try {
            const { sendReceiptEmail } = require('../utils/email');
            const donorEmailFinal = (donation.donorInfo && donation.donorInfo.email) || donation.email || (paymentIntent && paymentIntent.receipt_email);
            if (!donorEmailFinal) {
              const noEmailMsg = '[DIAG] No donor email found for receipt.';
              console.log(noEmailMsg);
              logToFile(noEmailMsg);
            } else {
              const donorNameFinal = (donation.donorInfo && donation.donorInfo.name) || donation.firstName || 'Supporter';
              const dateStr = donation.completedAt ? new Date(donation.completedAt).toLocaleString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              let paymentMethodStr = 'Stripe';
              if (paymentIntent && paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length > 0) {
                const charge = paymentIntent.charges.data[0];
                if (charge.payment_method_details && charge.payment_method_details.card) {
                  const brand = charge.payment_method_details.card.brand;
                  const last4 = charge.payment_method_details.card.last4;
                  paymentMethodStr = `${brand.charAt(0).toUpperCase() + brand.slice(1)} •••• ${last4}`;
                } else if (charge.payment_method_details && charge.payment_method_details.type) {
                  paymentMethodStr = charge.payment_method_details.type.charAt(0).toUpperCase() + charge.payment_method_details.type.slice(1);
                }
              }
              const recurringStr = donation.isRecurring ? `Yes (${donation.donationType.charAt(0).toUpperCase() + donation.donationType.slice(1)})` : 'No';
              const subject = 'Thank you for your donation to HALT!';
              const html = `
                <p>Dear ${donorNameFinal},</p>
                <p>Thank you for your generous donation to HALT. Here are your donation details:</p>
                <ul>
                  <li><b>Donor Name:</b> ${donorNameFinal}</li>
                  <li><b>Donor Email:</b> ${donorEmailFinal}</li>
                  <li><b>Amount:</b> $${donation.amount} ${donation.currency || 'USD'}</li>
                  <li><b>Donation Type:</b> ${donation.donationType.charAt(0).toUpperCase() + donation.donationType.slice(1)}</li>
                  <li><b>Payment Method:</b> ${paymentMethodStr}</li>
                  <li><b>Transaction ID:</b> ${donation.transactionId}</li>
                  <li><b>Date:</b> ${dateStr} UTC</li>
                  <li><b>Category:</b> ${donation.category || 'general'}</li>
                  <li><b>Recurring:</b> ${recurringStr}</li>
                </ul>
                <p>Your support helps us continue our mission to help animals live and thrive.</p>
                <p>With gratitude,<br/>The HALT Team</p>
              `;
              const text = `Dear ${donorNameFinal},\n\nThank you for your generous donation to HALT. Here are your donation details:\n\nDonor Name: ${donorNameFinal}\nDonor Email: ${donorEmailFinal}\nAmount: $${donation.amount} ${donation.currency || 'USD'}\nDonation Type: ${donation.donationType.charAt(0).toUpperCase() + donation.donationType.slice(1)}\nPayment Method: ${paymentMethodStr}\nTransaction ID: ${donation.transactionId}\nDate: ${dateStr} UTC\nCategory: ${donation.category || 'general'}\nRecurring: ${recurringStr}\n\nYour support helps us continue our mission to help animals live and thrive.\n\nWith gratitude,\nThe HALT Team`;
              try {
                logToFile(`[RECEIPT] Sending receipt to ${donorEmailFinal} for transaction ${donation.transactionId}`);
                const info = await sendReceiptEmail({ to: donorEmailFinal, subject, html, text });
                logToFile(`[DIAG] Receipt email sent to ${donorEmailFinal} (accepted: ${JSON.stringify(info.accepted)}, rejected: ${JSON.stringify(info.rejected)})`);
                donation.receiptSent = true;
                donation.receiptSentAt = new Date();
                await donation.save();
                logToFile(`[RECEIPT] Updated donation with receiptSentAt for transaction ${donation.transactionId}`);
              } catch (emailErr) {
                logToFile(`[DIAG] Error sending receipt email: ${emailErr && emailErr.message ? emailErr.message : emailErr}`);
              }
            }
          } catch (err) {
            logToFile(`[DIAG] Error in receipt email block: ${err}`);
          }
        }
      } catch (error) {
        console.error('Error updating or creating donation:', error);
        logToFile(`Error updating or creating donation: ${error}`);
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const failedPayment = event.data.object;
      try {
        const donation = await Donation.findOne({ paymentIntentId: failedPayment.id });
        if (donation) {
          donation.status = 'failed';
          await donation.save();
        }
      } catch (error) {
        console.error('Error updating failed donation:', error);
      }
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
