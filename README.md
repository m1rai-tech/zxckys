# YOUR BRAND — Modern Classifieds Marketplace

A fast, clean, and fully-featured classifieds marketplace built for international buyers and sellers. Post ads, chat in real time, leave reviews, and find anything — from electronics to real estate.

---

## Live Demo

🔗 [zxckys.vercel.app](https://zxckys.vercel.app)

**Test account** (no registration needed):
- Email: `demo@marketplace.com`
- Password: `demo1234`

---

## Screenshots

| Home | Chat |
|------|------|
| ![Home](https://github.com/user-attachments/assets/03140e6e-0f54-4678-885d-84d4285f2623) | ![Chat](https://github.com/user-attachments/assets/a322ff76-d7bb-4168-ac2b-012f80e282e9) |

| Create Ad | Profile |
|-----------|---------|
| ![Create](https://github.com/user-attachments/assets/feef4fc9-02dc-451b-80d8-5340bada682b) | ![Profile](https://github.com/user-attachments/assets/5280e0b0-535f-4b5b-a2fb-ae3eee2344ee) |

| Mobile |
|--------|
| ![Mobile](https://github.com/user-attachments/assets/e9bd1bec-a1da-4ec0-a305-54b5f01d127e) |

---

## Features

### For Buyers
- **Smart search** — fuzzy/typo-tolerant search powered by PostgreSQL `pg_trgm`
- **Global location filter** — autocomplete powered by OpenStreetMap, works for any city in the world
- **Currency selector** — switch between USD and EUR, price displayed everywhere accordingly
- **Favorites** — save listings locally, count shown in the nav
- **Similar listings** — shown at the bottom of every listing page
- **Seller profiles** — rating, number of deals, member since date, suspension status
- **Price filter** — min/max price range on home and search pages
- **Sort options** — Newest, Featured first, Price low→high, Price high→low
- **Recently viewed** — horizontal scroll row of last 12 visited listings, stored locally

### For Sellers
- **Post ads in minutes** — title, description, photos, price, location, category attributes
- **Rich category attributes** — structured fields per category (see list below)
- **Status management** — mark listings as Active / Sold / Archived
- **Sale confirmation flow** — confirm sale via chat with a dedicated button
- **Photo upload** — multiple photos with square thumbnails
- **Paid Boost** — promote listings to the top of results for 7 or 30 days (Stripe)

### Real-time Chat
- Instant messaging between buyer and seller
- Photo sharing inside chat
- Delivery confirmation and sale flow built into chat
- Read receipts (single / double tick)
- Review & rating system after a completed deal
- Auto-confirm after 7 days if buyer doesn't respond
- Pin conversations, hide/delete chat per user
- **Report user** button in chat header — sends a report to moderation with a reason

### Support
- **24/7 Support widget** — floating button on every page
- FAQ with 6 built-in answers
- Live chat with moderation if FAQ doesn't help
- Unread message badge + sound notification for mod replies
- Admins reply directly from the admin panel

### Admin & Moderation
- **Overview dashboard** — total listings, users, conversations, reviews
- **Listings tab** — search, status change, delete any listing
- **Users tab** — search, role change, ban/unban with duration and reason
- **Reports tab** — listing reports and user reports from chat, with Dismiss / Delete / Ban actions
- **Reviews tab** — delete any review
- **Support tab** — reply to user tickets, close (auto-deletes) tickets
- **All Chats tab** — view every conversation on the platform, reported ones sorted first with a badge, read-only message history, ban participants directly from the chat view

### Report System
- Report any listing with a reason (Spam, Scam, Inappropriate, Wrong category, Duplicate, Other)
- Report any user from a chat conversation
- "Other" reason opens a custom text field
- Reported listings hidden from reporter's feed while pending
- Moderation resolves reports: Dismiss or Delete listing / Ban user

### Ban System
- Ban duration: 1 hour, 24 hours, 7 days, 30 days, or permanent
- Optional ban reason stored and shown to the banned user
- Banned users see a full-screen overlay with reason and expiry — cannot interact with the platform
- Banned users' listings are hidden from all other users automatically via RLS
- Listings restore automatically when a temporary ban expires
- Admins and moderators can always see all listings including from banned users
- Public profile shows "Account suspended" banner when user is banned

### Categories
| Category | Key Attributes |
|----------|---------------|
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
|-------|-----------|
| Frontend | React 19 + Vite 7 |
| Routing | React Router v7 |
| UI | Custom CSS (no UI library), Heroicons |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Search | PostgreSQL `pg_trgm` — fuzzy, typo-tolerant |
| Location | OpenStreetMap Nominatim API (free, no key needed) |
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
│   ├── SupportWidget.jsx           # Floating 24/7 support button with FAQ + live chat
│   ├── ListingCard.jsx             # Card used in grids
│   ├── LocationAutocomplete.jsx    # City search with OpenStreetMap
│   └── Icons.jsx                   # All icon exports (Heroicons)
├── contexts/
│   ├── AuthContext.jsx             # User session, profile, isBanned
│   └── CurrencyContext.jsx         # USD / EUR switching
├── hooks/
│   └── useReportedListings.js      # Filters out listings reported by current user
├── lib/
│   ├── supabase.js                 # Supabase client
│   ├── categories.js               # All categories + their attributes
│   └── favorites.js                # Local favorites (localStorage)
├── pages/
│   ├── Home.jsx
│   ├── Search.jsx
│   ├── Category.jsx
│   ├── ListingDetails.jsx          # Report listing modal
│   ├── CreateListing.jsx
│   ├── Chat.jsx                    # Report user button, sale flow, reviews
│   ├── Profile.jsx                 # My profile + public seller profile (ban banner)
│   ├── Settings.jsx
│   ├── Favorites.jsx
│   ├── Admin.jsx                   # Full admin panel (listings, users, reports, reviews, support, chats)
│   ├── Static.jsx                  # Privacy, Terms, Help pages
│   └── Auth.jsx
└── index.css                       # All styles (CSS variables, components, responsive)
db/
└── migrations/                     # SQL migrations — apply in filename order
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-brand.git
cd your-brand
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy your URL and anon key

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

1. Push the repo to GitHub
2. Import it on [vercel.com](https://vercel.com)
3. Add all environment variables from `.env` in **Settings → Environment Variables**
4. Deploy — Vercel auto-deploys on every push to `main`

The `api/` directory is automatically served as Vercel serverless functions.

---

## Stripe Setup (Paid Boost)

Listing owners can pay to promote their listings to the top of search and category pages for 7 days ($2.99) or 30 days ($7.99).

### 1. Create a Stripe account

Go to [stripe.com](https://stripe.com) → Sign up.

### 2. Get your API keys

Stripe Dashboard → **Developers** → **API keys** → copy **Secret key**.

### 3. Add environment variables to Vercel

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | from step 4 below |
| `APP_URL` | `https://your-domain.vercel.app` |
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role |

### 4. Set up Stripe Webhook

Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**:
- URL: `https://your-domain.vercel.app/api/stripe-webhook`
- Events: `checkout.session.completed`
- Copy **Signing secret** → add as `STRIPE_WEBHOOK_SECRET` in Vercel

### 5. Change boost prices

Edit `api/create-checkout.js` — `PLANS` object:
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
2. Copy your API key

**Deploy the Edge Function:**

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>

supabase secrets set RESEND_API_KEY=re_...
supabase secrets set FROM_EMAIL=noreply@yourdomain.com
supabase secrets set APP_URL=https://your-domain.vercel.app

supabase functions deploy send-notification-email
```

**Create Database Webhooks in Supabase → Database → Webhooks:**

| Hook name | Table | Event | Function |
|-----------|-------|-------|----------|
| `notify_new_conversation` | `conversations` | INSERT | `send-notification-email` |
| `notify_new_message` | `messages` | INSERT | `send-notification-email` |

---

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profiles — name, avatar, rating, role, `is_banned`, `banned_until`, `ban_reason` |
| `listings` | All ads — title, price, photos, category, location, status, `boosted_until` |
| `listing_extras` | Key-value attributes per listing (category-specific) |
| `conversations` | Buyer ↔ seller chat threads, linked to a listing |
| `messages` | Individual chat messages with read status and image support |
| `reviews` | Ratings left after completed deals |
| `reports` | Listing reports and user reports from chat — pending / dismissed |
| `support_tickets` | Support chat sessions between users and moderators |
| `support_messages` | Messages inside support tickets |

---

## Customization

| What | Where |
|------|-------|
| Brand name | `src/components/Layout.jsx` line 56, `index.html` |
| Categories | `src/lib/categories.js` |
| Colors / fonts | `src/index.css` — `:root` CSS variables |
| Popular cities | `src/components/LocationAutocomplete.jsx` — `POPULAR` array |
| Currencies | `src/contexts/CurrencyContext.jsx` — `CURRENCIES` array |
| Boost prices | `api/create-checkout.js` — `PLANS` object |
| Email templates | `supabase/functions/send-notification-email/index.ts` |
| Support FAQ | `src/components/SupportWidget.jsx` — `FAQ` array |

---

## License

MIT — free to use, modify, and sell.
