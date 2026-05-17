import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@yourdomain.com';
const APP_URL = Deno.env.get('APP_URL') || 'https://yourdomain.com';

interface Payload {
  type: 'INSERT' | 'UPDATE';
  table: string;
  record: Record<string, unknown>;
  old_record?: Record<string, unknown>;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
  }
}

serve(async (req) => {
  const payload: Payload = await req.json();

  // New conversation created → notify the seller
  if (payload.table === 'conversations' && payload.type === 'INSERT') {
    const conv = payload.record;
    const sellerEmail = conv.seller_email as string;
    const listingTitle = conv.listing_title as string;
    const convId = conv.id as string;

    if (sellerEmail) {
      await sendEmail(
        sellerEmail,
        `New message about "${listingTitle}"`,
        `
          <p>Someone is interested in your listing <strong>${listingTitle}</strong>.</p>
          <p><a href="${APP_URL}/chat?c=${convId}" style="
            display:inline-block;padding:10px 20px;background:#2563eb;
            color:#fff;text-decoration:none;border-radius:8px;font-weight:600
          ">Open Chat</a></p>
          <p style="color:#6b7280;font-size:13px">
            You're receiving this because you have an active listing on Marketplace.
          </p>
        `,
      );
    }
  }

  // New message sent → notify the recipient (if they are not the author)
  if (payload.table === 'messages' && payload.type === 'INSERT') {
    const msg = payload.record;
    const recipientEmail = msg.recipient_email as string;
    const convId = msg.conversation_id as string;

    if (recipientEmail) {
      await sendEmail(
        recipientEmail,
        'You have a new message',
        `
          <p>You received a new message.</p>
          <p><a href="${APP_URL}/chat?c=${convId}" style="
            display:inline-block;padding:10px 20px;background:#2563eb;
            color:#fff;text-decoration:none;border-radius:8px;font-weight:600
          ">Open Chat</a></p>
          <p style="color:#6b7280;font-size:13px">
            You're receiving this because you have an active conversation on Marketplace.
          </p>
        `,
      );
    }
  }

  return new Response('ok', { status: 200 });
});
