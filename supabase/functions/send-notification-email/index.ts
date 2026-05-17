import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev';
const APP_URL = (Deno.env.get('APP_URL') || 'http://localhost:5173').replace(/\/$/, '');

// these are auto-injected by Supabase into every Edge Function
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  if (!res.ok) console.error('Resend error:', await res.text());
}

async function getEmail(userId: string): Promise<string | null> {
  const { data } = await supabase.auth.admin.getUserById(userId);
  return data?.user?.email ?? null;
}

serve(async (req) => {
  const payload = await req.json();
  const { type, table, record } = payload;

  // new conversation → notify seller
  if (table === 'conversations' && type === 'INSERT') {
    const sellerEmail = await getEmail(record.seller_id);
    if (sellerEmail) {
      await sendEmail(
        sellerEmail,
        `New message about "${record.listing_title}"`,
        `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <h2 style="font-size:18px;margin-bottom:8px">You have a new message</h2>
            <p style="color:#555">Someone is interested in your listing <strong>${record.listing_title}</strong>.</p>
            <a href="${APP_URL}/chat?c=${record.id}"
               style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
              Open Chat
            </a>
            <p style="margin-top:24px;font-size:12px;color:#999">
              You're receiving this because you have an active listing on Marketplace.
            </p>
          </div>
        `,
      );
    }
  }

  // new message → notify the other participant
  if (table === 'messages' && type === 'INSERT') {
    const { data: conv } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id, listing_title')
      .eq('id', record.conversation_id)
      .single();

    if (conv) {
      const recipientId = record.author_id === conv.buyer_id ? conv.seller_id : conv.buyer_id;
      const recipientEmail = await getEmail(recipientId);
      if (recipientEmail) {
        await sendEmail(
          recipientEmail,
          `New message about "${conv.listing_title}"`,
          `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
              <h2 style="font-size:18px;margin-bottom:8px">You have a new message</h2>
              <p style="color:#555">You received a new message in the chat about <strong>${conv.listing_title}</strong>.</p>
              <a href="${APP_URL}/chat?c=${record.conversation_id}"
                 style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
                Open Chat
              </a>
              <p style="margin-top:24px;font-size:12px;color:#999">
                You're receiving this because you have an active conversation on Marketplace.
              </p>
            </div>
          `,
        );
      }
    }
  }

  return new Response('ok', { status: 200 });
});
