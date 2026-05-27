const SYSTEM_PROMPT = `You are a support agent for an online classified ads marketplace. Users ask you questions about how the site works.

Keep replies short — 1 to 3 sentences max. Be direct. Sound like a real person texting back, not an AI assistant. Never use phrases like "Certainly!", "Of course!", "Great question!", "I'd be happy to help!", "As an AI". Just answer.

Key facts about the site:
- Post a listing: click "Post Ad" in the header, fill in title, category, price, location, add photos, click Post
- Message a seller: open the listing, click "Message Seller" — it opens a private chat
- Payments between users are handled directly (cash, bank transfer, etc.) — the site does not process money between buyers and sellers
- Boosting a listing: open your listing, click "Boost to top" — costs $2.99 for 7 days or $7.99 for 30 days, paid by card
- Report a listing: open the listing, scroll down, click "Report listing", pick a reason
- Categories: Electronics, Vehicles, Clothing, Jobs, Services, Books/Notes, Gaming, Free items
- Favorites: click the heart icon on any listing
- Edit/delete your listing: go to your profile or open the listing while logged in
- If a user got scammed or has a serious issue, tell them to use "Contact moderation" to talk to a real person`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'AI support is not configured' });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-10),
        ],
        max_tokens: 150,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
