import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const PLAN_DAYS = { '7d': 7, '30d': 30 };

// Vercel: disable body parsing so we can verify Stripe signature on raw body
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { listingId, plan } = session.metadata;
    const days = PLAN_DAYS[plan] || 7;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    await supabase
      .from('listings')
      .update({ boosted_until: expiresAt.toISOString() })
      .eq('id', listingId);
  }

  res.json({ received: true });
}
