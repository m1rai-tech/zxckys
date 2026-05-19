# Marketplace — Modern Classifieds Platform

A fast, clean, and fully-featured classifieds marketplace built for international buyers and sellers. Post ads, chat in real time, leave reviews, and find anything — from electronics to real estate.

---

## Live Demo

[https://demo-market-blond.vercel.app/](https://demo-market-blond.vercel.app/)

## Features

### For Buyers
- **Smart search** — fuzzy/typo-tolerant search powered by PostgreSQL `pg_trgm`
- **Global location filter** — autocomplete powered by OpenStreetMap, works for any city in the world
- **Currency selector** — switch between USD and EUR, prices displayed everywhere accordingly
- **Favorites** — save listings locally, count shown in the nav
- **Similar listings** — shown at the bottom of every listing page
- **Seller profiles** — rating, number of deals, member since date, suspension status
- **Price filter** — min/max price range on home and search pages
- **Sort options** — Newest, Featured first, Price low to high, Price high to low
- **Recently viewed** — horizontal scroll strip of last 12 visited listings, stored locally

### For Sellers
- **Post ads in minutes** — title, description, photos, price, location, category attributes
- **Rich category attributes** — structured fields per category
- **Status management** — mark listings as Active, Sold, or Archived
- **Sale confirmation flow** — confirm sale via chat with a dedicated button
- **Photo upload** — multiple photos with square thumbnails
- **Paid Boost** — promote listings to the top of results for 7 or 30 days via Stripe

### Real-time Chat
- Instant messaging between buyer and seller
- Photo sharing inside chat
- Delivery confirmation and sale flow built into chat
- Read receipts (single and double tick)
- Review and rating system after a completed deal
- Auto-confirm after 7 days if buyer does not respond
- Pin conversations, hide or delete chat per user
- Report user button in chat header — sends a report to moderation with a reason

### Support
- 24/7 support widget — floating button on every page
- FAQ with 6 built-in answers
- Live chat with moderation if FAQ does not help
- Unread message badge and sound notification for moderator replies
- Admins reply directly from the admin panel

### Admin and Moderation
- Overview dashboard — total listings, users, conversations, reviews
- Listings tab — search, change status, delete any listing
- Users tab — search, change role, ban or unban with duration and reason
- Reports tab — listing reports and user reports from chat, with Dismiss, Delete, and Ban actions
- Reviews tab — delete any review
- Support tab — reply to user tickets, close tickets
- All Chats tab — view every conversation on the platform, reported ones sorted first with a badge, read-only message history, ban participants directly from the chat view

### Report System
- Report any listing with a reason: Spam, Scam, Inappropriate, Wrong category, Duplicate, or Other
- Report any user from a chat conversation
- The "Other" reason opens a custom text field
- Reported listings are hidden from the reporter's feed while pending
- Moderation resolves reports: Dismiss or Delete listing / Ban user

### Ban System
- Ban duration: 1 hour, 24 hours, 7 days, 30 days, or permanent
- Optional ban reason stored and shown to the banned user
- Banned users see a full-screen overlay with reason and expiry and cannot interact with the platform
- Banned users' listings are hidden from all other users automatically via RLS
- Listings restore automatically when a temporary ban expires
- Admins and moderators can always see all listings including those from banned users
- Public profile shows an "Account suspended" banner when a user is banned

### Categories

| Category | Key Attributes |
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

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite 7 |
| Routing | React Router v7 |
| UI | Custom CSS (no UI library) |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Search | PostgreSQL `pg_trgm` — fuzzy, typo-tolerant |
| Location | OpenStreetMap Nominatim API (free, no key required) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Real-time | Supabase Realtime subscriptions |
| Payments | Stripe Checkout (listing boost) |
| Email | Resend via Supabase Edge Functions |

---

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx                  # Main layout, header, sidebar, bottom nav, ban screen
│   ├── Footer.jsx                  # Footer with categories and static links
│   ├── SupportWidget.jsx           # Floating support button with FAQ and live chat
│   ├── ListingCard.jsx             # Card used in grids
│   ├── LocationAutocomplete.jsx    # City search with OpenStreetMap
│   └── Icons.jsx                   # All icon exports
├── contexts/
│   ├── AuthContext.jsx             # User session, profile, isBanned
│   └── CurrencyContext.jsx         # USD / EUR switching
├── hooks/
│   └── useReportedListings.js      # Filters out listings reported by current user
├── lib/
│   ├── supabase.js                 # Supabase client
│   ├── categories.js               # All categories and their attributes
│   └── favorites.js                # Local favorites (localStorage)
├── pages/
│   ├── Home.jsx
│   ├── Search.jsx
│   ├── Category.jsx
│   ├── ListingDetails.jsx
│   ├── CreateListing.jsx
│   ├── Chat.jsx
│   ├── Profile.jsx
│   ├── Settings.jsx
│   ├── Favorites.jsx
│   ├── Admin.jsx
│   ├── Static.jsx
│   └── Auth.jsx
└── index.css                       # All styles (CSS variables, components, responsive)
db/
└── migrations/                     # SQL migrations — apply in filename order
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy your project URL and anon key

### 3. Configure environment

Create a `.env` file in the project root:

```env
# Supabase (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App URL — used by Stripe redirects (required for boost feature)
APP_URL=https://your-domain.vercel.app

# Stripe (optional — only needed for paid listing boost)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase service role — used by Stripe webhook to update listings
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4. Apply database migrations

Run all `.sql` files in `db/migrations/` in filename order via the Supabase SQL editor.

### 5. Run locally

```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

### 6. Build for production

```bash
npm run build
```

---

## Deploy to Vercel

1. Push the repository to GitHub
2. Import it on [vercel.com](https://vercel.com)
3. Add all environment variables from `.env` in **Settings → Environment Variables**
4. Deploy — Vercel auto-deploys on every push to `main`

The `api/` directory is automatically served as Vercel serverless functions.

---

## Stripe Setup (Paid Boost)

Listing owners can pay to promote their listings to the top of search and category pages for 7 days ($2.99) or 30 days ($7.99).

1. Create a [Stripe](https://stripe.com) account
2. Go to **Developers → API keys** and copy your Secret key
3. Add the following environment variables to Vercel:

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | from step 4 below |
| `APP_URL` | `https://your-domain.vercel.app` |
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role |

4. Go to **Developers → Webhooks → Add endpoint**:
   - URL: `https://your-domain.vercel.app/api/stripe-webhook`
   - Events: `checkout.session.completed`
   - Copy the signing secret and add it as `STRIPE_WEBHOOK_SECRET`

To change boost prices, edit `api/create-checkout.js`:

```js
const PLANS = {
  '7d':  { name: '7-day Boost',  amount: 299,  days: 7  },  // $2.99
  '30d': { name: '30-day Boost', amount: 799,  days: 30 },  // $7.99
};
```

---

## Email Notifications Setup (Resend)

Sellers receive an email when a buyer opens a chat. Buyers receive an email when they get a reply.

1. Create a [Resend](https://resend.com) account and verify your sending domain
2. Copy your API key and deploy the Edge Function:

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref

supabase secrets set RESEND_API_KEY=re_...
supabase secrets set FROM_EMAIL=noreply@yourdomain.com
supabase secrets set APP_URL=https://your-domain.vercel.app

supabase functions deploy send-notification-email
```

3. Create Database Webhooks in **Supabase → Database → Webhooks**:

| Hook name | Table | Event | Function |
|-----------|-------|-------|----------|
| `notify_new_conversation` | `conversations` | INSERT | `send-notification-email` |
| `notify_new_message` | `messages` | INSERT | `send-notification-email` |

---

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profiles — name, avatar, rating, role, ban status and reason |
| `listings` | All ads — title, price, photos, category, location, status, boost expiry |
| `listing_extras` | Key-value attributes per listing (category-specific fields) |
| `conversations` | Buyer and seller chat threads linked to a listing |
| `messages` | Individual chat messages with read status and image support |
| `reviews` | Ratings left after completed deals |
| `reports` | Listing and user reports — pending or dismissed |
| `support_tickets` | Support chat sessions between users and moderators |
| `support_messages` | Messages inside support tickets |

---

## Customization

| What | Where |
|------|-------|
| Brand name | `src/components/Layout.jsx`, `index.html` |
| Categories | `src/lib/categories.js` |
| Colors and fonts | `src/index.css` — `:root` CSS variables |
| Popular cities | `src/components/LocationAutocomplete.jsx` — `POPULAR` array |
| Currencies | `src/contexts/CurrencyContext.jsx` — `CURRENCIES` array |
| Boost prices | `api/create-checkout.js` — `PLANS` object |
| Email templates | `supabase/functions/send-notification-email/index.ts` |
| Support FAQ | `src/components/SupportWidget.jsx` — `FAQ` array |

---

## License

MIT — free to use, modify, and sell.
