# YOUR BRAND — Modern Classifieds Marketplace

A fast, clean, and fully-featured classifieds marketplace built for international buyers and sellers. Post ads, chat in real time, leave reviews, and find anything — from electronics to real estate.

---

## Screenshots

> _(replace with your screenshots)_

| Home | Listing | Chat |
|------|---------|------|
| ![Home](docs/screenshot-home.png) | ![Listing](docs/screenshot-listing.png) | ![Chat](docs/screenshot-chat.png) |

| Mobile | Search | Create Ad |
|--------|--------|-----------|
| ![Mobile](docs/screenshot-mobile.png) | ![Search](docs/screenshot-search.png) | ![Create](docs/screenshot-create.png) |

---

## Features

### For Buyers
- **Smart search** — fuzzy/typo-tolerant search powered by PostgreSQL `pg_trgm`
- **Global location filter** — autocomplete powered by OpenStreetMap, works for any city in the world
- **Currency selector** — switch between USD and EUR, price displayed everywhere accordingly
- **Favorites** — save listings locally, count shown in the nav
- **Similar listings** — shown at the bottom of every listing page
- **Seller profiles** — rating, number of deals, member since date

### For Sellers
- **Post ads in minutes** — title, description, photos, price, location, category attributes
- **Rich category attributes** — structured fields per category (see list below)
- **Status management** — mark listings as Active / Sold / Archived
- **Sale confirmation flow** — confirm sale via chat with a dedicated button
- **Photo upload** — multiple photos with thumbnails

### Real-time Chat
- Instant messaging between buyer and seller
- Delivery confirmation and sale flow built into chat
- Read receipts (single / double tick)
- Review & rating system after a completed deal

### Admin & Moderation
- Admin panel for managing listings and users
- Moderators can delete any listing directly from the listing page
- Role-based access: `user`, `moderator`, `admin`

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
| Auth | Supabase Auth (email/password) |
| Real-time | Supabase Realtime subscriptions |

---

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx                  # Main layout, header, sidebar, bottom nav
│   ├── ListingCard.jsx             # Card used in grids
│   ├── LocationAutocomplete.jsx    # City search with OpenStreetMap
│   └── Icons.jsx                   # All icon exports (Heroicons)
├── contexts/
│   ├── AuthContext.jsx             # User session, profile
│   └── CurrencyContext.jsx         # USD / EUR switching
├── lib/
│   ├── supabase.js                 # Supabase client
│   ├── categories.js               # All categories + their attributes
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
│   └── Auth.jsx
└── index.css                       # All styles (CSS variables, components, responsive)
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
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Apply database migrations

```bash
npm run supabase:setup
```

Or apply the SQL files in `db/migrations/` manually via the Supabase SQL editor.

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

## Database Schema (key tables)

| Table | Description |
|-------|-------------|
| `profiles` | User profiles — name, avatar, rating, role |
| `listings` | All ads — title, price, photos, category, location, status |
| `listing_extras` | Key-value attributes per listing (category-specific) |
| `conversations` | Buyer ↔ seller chat threads, linked to a listing |
| `messages` | Individual chat messages with read status |
| `reviews` | Ratings left after completed deals |

---

## Deployment

The app is a standard Vite SPA. Deploy to any static host:

- **Vercel** — connect repo, set env vars, deploy
- **Netlify** — same as Vercel
- **Cloudflare Pages** — same

Make sure to add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your deployment settings.

For SPA routing to work, configure your host to redirect all routes to `index.html`.

---

## Customization

| What | Where |
|------|-------|
| Brand name | `src/components/Layout.jsx` — line with `YOUR BRAND` |
| Categories | `src/lib/categories.js` |
| Colors / fonts | `src/index.css` — `:root` CSS variables |
| Popular cities | `src/components/LocationAutocomplete.jsx` — `POPULAR` array |
| Currencies | `src/contexts/CurrencyContext.jsx` — `CURRENCIES` array |

---

## License

MIT — free to use, modify, and sell.
