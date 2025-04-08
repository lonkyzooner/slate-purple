const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { updateUserSubscriptionStatus, notifyUserPaymentFailed } = require('../services/subscriptionService');
const bodyParser = require('body-parser');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  let customerId;
  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created':
      console.log('Subscription updated or created:', event.data.object.id);
      customerId = event.data.object.customer;
      await updateUserSubscriptionStatus(customerId, 'active');
      break;
    case 'customer.subscription.deleted':
      console.log('Subscription canceled:', event.data.object.id);
      customerId = event.data.object.customer;
      await updateUserSubscriptionStatus(customerId, 'canceled');
      break;
    case 'invoice.payment_failed':
      console.log('Payment failed for invoice:', event.data.object.id);
      customerId = event.data.object.customer;
      await notifyUserPaymentFailed(customerId);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;