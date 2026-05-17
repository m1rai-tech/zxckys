import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  '7d':  { name: '7-day Boost',  amount: 299,  days: 7  },
  '30d': { name: '30-day Boost', amount: 799,  days: 30 },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { listingId, listingTitle, plan } = req.body;
  if (!listingId || !PLANS[plan]) return res.status(400).json({ error: 'Invalid request' });

  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const { name, amount } = PLANS[plan];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name, description: `Boost "${listingTitle}" to the top of search results` },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${appUrl}/listing/${listingId}?boosted=1`,
      cancel_url:  `${appUrl}/listing/${listingId}`,
      metadata: { listingId: String(listingId), plan },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
