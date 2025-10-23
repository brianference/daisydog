// Netlify Function: Handle Stripe Webhooks
// Listens for subscription events and updates database

const Stripe = require('stripe');
const { neon } = require('@neondatabase/serverless');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  
  let stripeEvent;

  try {
    // Verify webhook signature
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  console.log('Stripe webhook event:', stripeEvent.type);

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        
        // Update parent account with customer ID and subscription status
        await sql`
          UPDATE parents
          SET 
            stripe_customer_id = ${session.customer},
            subscription_status = 'active',
            subscription_started_at = NOW(),
            updated_at = NOW()
          WHERE email = ${session.customer_email}
        `;
        
        console.log('Subscription activated for:', session.customer_email);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object;
        
        await sql`
          UPDATE parents
          SET 
            subscription_status = ${subscription.status},
            subscription_ends_at = to_timestamp(${subscription.current_period_end}),
            updated_at = NOW()
          WHERE stripe_customer_id = ${subscription.customer}
        `;
        
        console.log('Subscription updated:', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object;
        
        await sql`
          UPDATE parents
          SET 
            subscription_status = 'cancelled',
            subscription_ends_at = NOW(),
            updated_at = NOW()
          WHERE stripe_customer_id = ${subscription.customer}
        `;
        
        console.log('Subscription cancelled:', subscription.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object;
        
        await sql`
          UPDATE parents
          SET 
            subscription_status = 'past_due',
            updated_at = NOW()
          WHERE stripe_customer_id = ${invoice.customer}
        `;
        
        console.log('Payment failed for customer:', invoice.customer);
        break;
      }

      default:
        console.log('Unhandled event type:', stripeEvent.type);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
