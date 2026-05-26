# Marketplace — Classifieds Platform

A clean, fast marketplace where people can buy and sell anything — electronics, cars, real estate, clothes, you name it. Real-time chat, reviews, moderation, paid boosts, email notifications. Everything a real classifieds platform needs, ready to deploy.

---

## Live Demo

[https://market-demo-omega.vercel.app/](https://market-demo-omega.vercel.app/)

---

## What's inside

### For buyers
- **Smart search** — typo-tolerant, powered by PostgreSQL `pg_trgm`, finds results even if you mistype
- **Location filter** — autocomplete via OpenStreetMap, works for any city in the world, no API key needed
- **Currency selector** — switch between USD and EUR, prices update everywhere instantly
- **Favorites** — save listings locally, counter shows in the nav.
- **Recently viewed** — last 8 visited listings; swipe strip on mobile, grid on desktop
- **Similar listings** — shown full-width at the bottom of each listing, up to 12 cards, "See all" links to category
- **Seller profiles** — rating, number of deals, member since, suspension status
- **Price filter + sorting** — min/max range, sort by newest / featured / price
- **Delivery badge** — listings with delivery show a badge on the photo in every card view
- **Category chip** — each card in Recent listings shows what category it belongs to

### For sellers
- **Post in minutes** — title, description, photos, price, location, category-specific fields
- **Edit anytime** — update any field on your listing after publishing
- **Status management** — mark as Active, Sold, or Archived
- **Sale confirmation** — confirm a deal directly in chat
- **Photo upload** — multiple photos, square thumbnails
- **Paid Boost** — pay to push a listing to the top for 7 or 30 days via Stripe

### Account settings
- **Profile** — update name, bio, city, and avatar photo (up to 5 MB, stored in Supabase Storage)
- **Phone number** — international dial code selector with 60+ countries; number is visible on your public profile
- **Password** — change it anytime; minimum 6 characters
- **Sign out everywhere** — ends all active sessions across all devices at once

### Real-time chat
- Instant messages between buyer and seller
- Photo sharing inside chat
- Sale confirmation flow built into chat
- Read receipts (single and double tick)
- Reviews and ratings after a completed deal
- Auto-confirm after 7 days if buyer doesn't respond
- Pin, hide, or delete conversations per user
- Report user button — sends a report to moderation with a reason

### Support
- Floating support widget on every page, always visible
- FAQ with 6 built-in answers
- Live chat with a moderator if FAQ doesn't cover it
- Unread badge and sound notification when moderator replies
- Admins reply from the admin panel

### Admin & moderation
- Dashboard — total listings, users, conversations, reviews
- Listings tab — search, change status, delete anything
- Users tab — search, change role, ban/unban with duration and reason
- Reports tab — listing and user reports with Dismiss, Delete, and Ban actions
- Reviews tab — delete any review
- Support tab — reply to tickets, close them
- All Chats tab — read-only view of every conversation, reported ones sorted first, ban users directly from chat

### Report system
- Report any listing: Spam, Scam, Inappropriate, Wrong category, Duplicate, or Other
- Report any user from a chat
- "Other" opens a custom text field
- Reported listings are hidden from the reporter's feed while under review
- Moderation resolves: Dismiss or Delete listing / Ban user

### Ban system
- Ban duration: 1 hour, 24 hours, 7 days, 30 days, or permanent
- Optional reason stored and shown to the banned user
- Banned users see a full-screen block with reason and expiry, can't do anything
- Their listings are hidden from everyone via RLS
- Listings come back automatically when a temporary ban expires
- Admins always see all listings including from banned users
- Public profiles show an "Account suspended" banner

### Static pages

The footer links to three built-in pages — they use the same accordion layout and are easy to customize:

- **Privacy Policy** — `/privacy`
- **Terms of Service** — `/terms`
- **Help** — `/help`

### Browse by category

Home page has a **Browse by category** section — up to 24 listings per category, boosted ones always first. Each row scrolls horizontally via trackpad or scrollbar on desktop, swipe on mobile. Vertical page scroll always works even when your finger is on a category row.

### Categories

| Category | Key attributes |
|----------|----------------|
| Electronics | Type, Brand, Model, Condition, Storage/RAM, Warranty |
| Vehicles | Make, Model, Year, Mileage, Fuel, Transmission, Drive, Body |
| Real Estate | Deal type, Property type, Rooms, Area, Furnished, Parking |
| Clothing | Gender, Type, Size (EU/US), Brand, Color, Material, Season |
| Home & Furniture | Category, Brand, Material, Dimensions, Assembly |
| Sports & Outdoors | Sport, Item type, Brand, Size |
| Baby & Kids | Category, Age range, Brand, Gender |
| Jobs | Type, Industry, Experience, Schedule, Remote/Hybrid, Salary |
| Services | Category, Format, Experience, Pricing model |
| Books & Media | Type, Genre, Author, Language, Condition |
| Gaming | Platform, Item type, Genre, Region |
| Free Stuff | Category, Condition, Reason, Pickup options |

---

## Tech stack

| Layer | What |
|-------|------|
| Frontend | React 19 + Vite 7 |
| Routing | React Router v7 |
| UI | Custom CSS — no UI library, no bloat |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Search | PostgreSQL `pg_trgm` — fuzzy, typo-tolerant |
| Location | OpenStreetMap Nominatim — free, no key needed |
| Auth | Supabase Auth — email/password + Google OAuth |
| Real-time | Supabase Realtime subscriptions |
| Payments | Stripe Checkout — listing boost |
| Emails | Resend via Supabase Edge Functions |

---

## Project structure

```
src/
├── components/
│   ├── Layout.jsx                  # header, sidebar, bottom nav, ban screen
│   ├── Footer.jsx                  # footer with categories and static links
│   ├── SupportWidget.jsx           # floating support button with FAQ and live chat
│   ├── ListingCard.jsx             # card used in grids
│   ├── CategoryBar.jsx             # horizontal category nav strip below the header
│   ├── LocationAutocomplete.jsx    # city search with OpenStreetMap
│   ├── PhoneCodeSelect.jsx         # international dial code dropdown (60+ countries)
│   └── Icons.jsx                   # all icon exports
├── contexts/
│   ├── AuthContext.jsx             # session, profile, ban status
│   └── CurrencyContext.jsx         # USD / EUR switching
├── hooks/
│   └── useReportedListings.js      # hides listings reported by current user
├── lib/
│   ├── supabase.js                 # Supabase client
│   ├── categories.js               # all categories and their attributes
│   ├── favorites.js                # local favorites via localStorage
│   └── imageUtils.js               # in-browser image resize + JPEG compression via canvas
├── pages/
│   ├── Home.jsx           # feed, filters, sort, recently viewed, browse by category rows
│   ├── Search.jsx         # fuzzy search results with location filter
│   ├── Category.jsx       # single category page with filters and sort
│   ├── ListingDetails.jsx # full listing view with similar listings
│   ├── CreateListing.jsx  # create and edit listings (shared component)
│   ├── Chat.jsx           # real-time chat with sale confirmation and reviews
│   ├── Profile.jsx        # my profile and public seller profiles
│   ├── Settings.jsx       # profile editor, password change, sign out all devices
│   ├── Favorites.jsx      # saved listings from localStorage
│   ├── Admin.jsx          # moderation panel — listings, users, reports, reviews, support, chats
│   ├── Static.jsx         # privacy policy, terms, help — accordion layout
│   └── Auth.jsx           # login and registration
└── index.css                       # all styles — CSS variables, components, responsive
db/
└── migrations/                     # SQL files — run in filename order to set up the DB
```

---

## Getting started

> Only Supabase is required to run the app. Stripe and Resend are optional — everything works fine without them, you just won't have paid boosts or email notifications until you add those keys.

### 1. Clone and install

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open **Settings → API** and copy your **Project URL** and **anon public** key

### 3. Run the migrations

1. In Supabase open **SQL Editor**
2. Go through each file in `db/migrations/` in filename order (01, 02, 03…)
3. Paste and run each one — this sets up all tables, functions, and row-level security

### 4. Set up environment variables

Create a `.env` file in the root of the project:

```env
# Supabase — required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Required only if you're using Stripe boost
APP_URL=https://your-domain.vercel.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — that's it.

### 6. Build for production

```bash
npm run build
```

---

## Deploy to Vercel

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add your environment variables in **Settings → Environment Variables**
4. Hit deploy — Vercel picks up every push to `main` automatically

The `api/` folder is served as Vercel serverless functions out of the box.

---

## Stripe setup (paid boost).

Sellers can pay to bump their listing to the top of search and category pages for 7 days ($2.99) or 30 days ($7.99).

1. Create a [Stripe](https://stripe.com) account
2. Go to **Developers → API keys**, copy the Secret key
3. Add these to Vercel environment variables:

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | from step 4 |
| `APP_URL` | `https://your-domain.vercel.app` |
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role |

4. Go to **Developers → Webhooks → Add endpoint**:
   - URL: `https://your-domain.vercel.app/api/stripe-webhook`
   - Events: `checkout.session.completed`
   - Copy the signing secret → add as `STRIPE_WEBHOOK_SECRET`

Want to change the prices? Edit `api/create-checkout.js`:

```js
const PLANS = {
  '7d':  { name: '7-day Boost',  amount: 299,  days: 7  },  // $2.99
  '30d': { name: '30-day Boost', amount: 799,  days: 30 },  // $7.99
};
```

---

## Email notifications (Resend)

Sellers get an email when someone opens a chat. Buyers get one when they receive a reply.

1. Create a [Resend](https://resend.com) account and verify your sending domain
2. Deploy the Edge Function:

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref

supabase secrets set RESEND_API_KEY=re_...
supabase secrets set FROM_EMAIL=noreply@yourdomain.com
supabase secrets set APP_URL=https://your-domain.vercel.app

supabase functions deploy send-notification-email
```

3. Set up Database Webhooks in **Supabase → Database → Webhooks**:

| Hook name | Table | Event | Function |
|-----------|-------|-------|----------|
| `notify_new_conversation` | `conversations` | INSERT | `send-notification-email` |
| `notify_new_message` | `messages` | INSERT | `send-notification-email` |

---

## Database schema

| Table | What it stores |
|-------|----------------|
| `profiles` | name, avatar, rating, role, ban status and reason |
| `listings` | all ads — title, price, photos, category, location, status, boost expiry |
| `listing_extras` | category-specific attributes per listing (key-value) |
| `conversations` | chat threads between buyer and seller, linked to a listing |
| `messages` | individual messages with read status and image support |
| `reviews` | ratings left after completed deals |
| `reports` | listing and user reports — pending or dismissed |
| `support_tickets` | support sessions between users and moderators |
| `support_messages` | messages inside support tickets |

---

## Performance

The app is built to stay fast even as the number of listings and photos grows.

### Images

Photos are the biggest culprit when it comes to slow pages — someone uploads a 4K photo from their phone and suddenly your listing page is loading 8 MB of images. To prevent that:

- **Automatic compression on upload** — every photo goes through an in-browser canvas resize before it ever touches the server. Listing photos are capped at 1920×1920 px, chat images at 1280×1280 px, and avatars at 400×400 px. All output is JPEG at ~82% quality regardless of what format was originally uploaded (PNG, HEIC, WEBP, etc.). Real-world savings: 3–4 MB raw → 100–400 KB on disk.
- **Lazy loading everywhere** — images in cards, thumbnails, and gallery strips use `loading="lazy"` so the browser only fetches what's actually on screen.

If you already have photos uploaded before compression was added, there's a one-time migration script:

```bash
node scripts/compress-existing-photos.js
```

It walks every file in `listing-media` and `chat-media`, skips anything already under 100 KB, and re-uploads compressed versions in place. The public URLs in the database stay exactly the same — no listing data needs updating.

The script uses a `service_role` key to bypass storage RLS. Set it as an env variable before running:

```bash
SUPABASE_SERVICE_KEY=eyJ... node scripts/compress-existing-photos.js
```

### Code splitting

All pages load on demand — the browser only downloads the code for the page the user is actually on. The initial bundle is ~430 KB (vs 679 KB without splitting), and each page chunk is 10–30 KB. Navigation to a new page fetches its chunk in the background, usually before the user even clicks.

### Database queries

Listing cards only need a handful of fields — title, price, photos, location, a couple of flags. Instead of fetching every column with `select('*')` and sending `description` and other heavy text over the wire for every card in the feed, all list-view queries select only the columns they actually display. Cuts the response payload noticeably once you have a few hundred listings.

---

## Security & production readiness

The code was audited before release — here's what was checked:

| What | Status |
|------|--------|
| `.env` in git | ✅ not tracked — excluded by `.gitignore` |
| Stripe secret key | ✅ server-side only (`api/`) — never reaches the browser |
| Resend API key | ✅ Edge Function only — never exposed to client |
| Supabase service role key | ✅ server-side only — not in frontend code |
| Admin access | ✅ role-based — no hardcoded user IDs |
| Database migrations | ✅ self-contained — no project-specific IDs |
| Missing `APP_URL` in production | ✅ both `api/sitemap.js` and `api/create-checkout.js` throw a clear error instead of silently falling back to wrong values |

**Before going live, make sure you have:**

1. `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` — from Supabase → Settings → API
2. `APP_URL` — your production domain, needed for Stripe redirects and sitemap
3. `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — needed for the Stripe webhook to update listings
4. `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` — only if you want paid boosts
5. `RESEND_API_KEY` + `FROM_EMAIL` — only if you want email notifications

Stripe and Resend are fully optional. The app runs fine without them — those features just stay disabled until the keys are there.

---

## Customization

| What to change | Where to find it |
|----------------|-----------------|
| Brand name | `src/components/Layout.jsx` and `index.html` |
| Categories | `src/lib/categories.js` |
| Colors and fonts | `src/index.css` — `:root` CSS variables |
| Popular cities | `src/components/LocationAutocomplete.jsx` — `POPULAR` array |
| Currencies | `src/contexts/CurrencyContext.jsx` — `CURRENCIES` array — see currency section below |
| Boost prices | `api/create-checkout.js` — `PLANS` object |
| Email templates | `supabase/functions/send-notification-email/index.ts` |
| Support FAQ | `src/components/SupportWidget.jsx` — `FAQ` array |
| Static pages (Privacy, Terms, Help) | `src/pages/Static.jsx` — see placeholders section below |
| Phone country list | `src/components/PhoneCodeSelect.jsx` — `PHONE_CODES` array |

### Currency

The platform has a per-listing currency system:

- **Sellers** pick a currency (USD or EUR) when creating a listing — it's stored alongside the price.
- **Buyers** choose a preferred currency in the header (All / $ USD / € EUR). Selecting one sorts matching listings to the top; it does **not** convert prices.
- **Default** is "All" — no preference, listings shown in their original currency.

**Required migration** — run this once in Supabase → SQL Editor before the feature works:

```sql
ALTER TABLE listings ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT NULL;
```

This file is already included as `db/migrations/20260520000000_add_listing_currency.sql`.

**Adding more currencies** — edit the `CURRENCIES` array in `src/contexts/CurrencyContext.jsx`:

```js
export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'EUR', symbol: '€', label: 'EUR' },
  { code: 'GBP', symbol: '£', label: 'GBP' }, // add more here
];
```

Each entry needs a `code` (used in the DB), a `symbol` (shown next to prices), and a `label` (shown in the selector).

---

### Legal pages (Terms, Privacy, Help)

All legal content lives in `src/pages/Static.jsx`. The Terms of Use and Privacy Policy use placeholders so you can fill in your details without hunting through paragraphs of legal text.

Search for these strings and replace them with your own values:

| Placeholder | Replace with |
|-------------|-------------|
| `[YOUR_PLATFORM_NAME]` | Your product or company name, e.g. `Sellify` |
| `[YOUR_DOMAIN]` | Your domain, e.g. `sellify.com` — used in the support email `support@[YOUR_DOMAIN]` |
| `[EFFECTIVE_DATE]` | The date these terms go into effect, e.g. `June 1, 2026` |

The Help page (`/help`) and Privacy Policy (`/privacy`) don't use brand-specific names in the text — just update the support email placeholder and you're done.

---

## License

MIT — use it, modify it, sell it, whatever you want.
