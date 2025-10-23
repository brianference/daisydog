# Stripe Setup Guide for DaisyDog Parent Dashboard

## Overview
This guide will walk you through setting up Stripe payment integration for the DaisyDog parent dashboard subscription system ($6.99/month or $59/year).

---

## Step 1: Create Stripe Products & Prices

### 1.1 Log in to Stripe Dashboard
1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Log in with your Stripe account
3. Make sure you're in **Test mode** initially (toggle in top-right corner)

### 1.2 Create Monthly Product
1. Click **Products** in the left sidebar
2. Click **+ Add product**
3. Fill in the form:
   - **Name**: `DaisyDog Parent Dashboard - Monthly`
   - **Description**: `Monthly subscription to DaisyDog parent dashboard with activity monitoring, safety alerts, and learning progress tracking`
   - **Pricing model**: Select **Standard pricing**
   - **Price**: Enter `6.99`
   - **Billing period**: Select **Monthly**
   - **Currency**: Select **USD**
4. Click **Save product**
5. **IMPORTANT**: Copy the **Price ID** (starts with `price_...`)
   - Example: `price_1A2B3C4D5E6F7G8H9I0J`

### 1.3 Create Annual Product
1. Click **+ Add product** again
2. Fill in the form:
   - **Name**: `DaisyDog Parent Dashboard - Annual`
   - **Description**: `Annual subscription to DaisyDog parent dashboard (save 30% compared to monthly)`
   - **Pricing model**: Select **Standard pricing**
   - **Price**: Enter `59.00`
   - **Billing period**: Select **Yearly**
   - **Currency**: Select **USD**
3. Click **Save product**
4. **IMPORTANT**: Copy the **Price ID** (starts with `price_...`)
   - Example: `price_9Z8Y7X6W5V4U3T2S1R0Q`

---

## Step 2: Configure Price IDs in Your App

### 2.1 Update StripeService.js
1. Open `src/services/StripeService.js`
2. Find the `getPriceIds()` method (around line 45-50)
3. Replace the placeholder price IDs with your actual Stripe price IDs:

```javascript
getPriceIds() {
  return {
    monthly: 'price_YOUR_MONTHLY_PRICE_ID_HERE',  // Replace this
    annual: 'price_YOUR_ANNUAL_PRICE_ID_HERE',    // Replace this
  }
}
```

**Example:**
```javascript
getPriceIds() {
  return {
    monthly: 'price_1A2B3C4D5E6F7G8H9I0J',
    annual: 'price_9Z8Y7X6W5V4U3T2S1R0Q',
  }
}
```

---

## Step 3: Set Up Stripe Webhook

### 3.1 Get Your Webhook Endpoint URL
Your webhook URL will be:
```
https://YOUR_REPLIT_APP_URL.repl.co/.netlify/functions/stripe-webhook
```

Example:
```
https://daisydog-parent-dashboard.replit.app/.netlify/functions/stripe-webhook
```

### 3.2 Create Webhook in Stripe Dashboard
1. In Stripe Dashboard, click **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Enter your webhook URL from Step 3.1
4. Select **Latest API version**
5. Click **Select events** and choose these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **Add endpoint**

### 3.3 Get Webhook Signing Secret
1. After creating the endpoint, click on it
2. Under **Signing secret**, click **Reveal**
3. Copy the signing secret (starts with `whsec_...`)
4. In Replit, go to **Secrets** (lock icon in left sidebar)
5. Add a new secret:
   - **Key**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: Paste the webhook signing secret

---

## Step 4: Set Up Stripe Customer Portal

### 4.1 Enable Customer Portal
1. In Stripe Dashboard, click **Settings** → **Billing** → **Customer portal**
2. Click **Activate test link** (for test mode) or **Activate** (for live mode)
3. Configure features:
   - ✅ **Update payment method**
   - ✅ **Cancel subscription**
   - ✅ **View invoice history**
4. Set cancellation behavior:
   - **Cancellation**: Allow customers to cancel
   - **When cancelled**: At the end of billing period
5. Click **Save changes**

### 4.2 Update Customer Portal URL (Optional)
If you want to customize the portal URL in your app:
1. Open `src/services/StripeService.js`
2. Find `getCustomerPortalUrl()` method
3. Update with your actual portal URL if needed (default should work)

---

## Step 5: Test the Integration

### 5.1 Test with Stripe Test Cards
Use these test card numbers:
- **Successful payment**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- **Declined payment**: `4000 0000 0000 9995`

Details:
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### 5.2 Test Workflow
1. Go to your app's pricing page: `https://YOUR_APP_URL/pricing`
2. Enter your email address
3. Click "Select Monthly Plan" or "Select Annual Plan"
4. You'll be redirected to Stripe Checkout
5. Use a test card (see above)
6. Complete the payment
7. You should be redirected back to your app
8. Check the Stripe Dashboard → **Payments** to see the test payment

### 5.3 Verify Database Updates
After successful test payment:
1. Check Replit Database viewer
2. Verify the `parents` table has new entry with:
   - `subscription_status = 'active'`
   - `stripe_customer_id` is populated
   - `stripe_subscription_id` is populated

---

## Step 6: Go Live (When Ready)

### 6.1 Switch to Live Mode
1. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Create the same products and prices in live mode
3. Update price IDs in `StripeService.js` with live price IDs
4. Create webhook endpoint for live mode
5. Update `STRIPE_WEBHOOK_SECRET` in Replit Secrets with live webhook secret

### 6.2 Update Stripe Keys
Ensure your Replit Secrets has both test and live keys:
- `STRIPE_SECRET_KEY` - Your live secret key (starts with `sk_live_...`)
- `VITE_STRIPE_PUBLIC_KEY` - Your live publishable key (starts with `pk_live_...`)

---

## Troubleshooting

### Webhook not receiving events
- Verify webhook URL is correct and accessible
- Check webhook signing secret matches in Replit Secrets
- View webhook attempts in Stripe Dashboard → Developers → Webhooks

### Payment succeeds but user not subscribed
- Check Netlify function logs for errors
- Verify database connection is working
- Check `stripe_customer_id` and `stripe_subscription_id` are being saved

### Customer portal not working
- Verify portal is activated in Stripe Dashboard
- Check that customer has an active subscription
- Ensure `stripe_customer_id` is saved in database

---

## Summary Checklist

- [ ] Created monthly product ($6.99) in Stripe
- [ ] Created annual product ($59) in Stripe
- [ ] Copied both price IDs
- [ ] Updated `StripeService.js` with real price IDs
- [ ] Created webhook endpoint in Stripe
- [ ] Added webhook signing secret to Replit Secrets
- [ ] Activated Customer Portal in Stripe
- [ ] Tested with Stripe test cards
- [ ] Verified database updates correctly

---

## Need Help?

If you encounter issues:
1. Check Stripe Dashboard → Developers → Logs
2. Check Netlify function logs in Replit
3. Check browser console for frontend errors
4. Refer to [Stripe Documentation](https://stripe.com/docs)

---

**Important Notes:**
- Always test in Test mode before going live
- Never share your secret keys
- Webhook signing secret is different for test and live modes
- Price IDs are different for test and live modes
