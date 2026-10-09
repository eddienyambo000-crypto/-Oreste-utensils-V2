# Oreste Utensils

Online shop for [Oreste Utensils](https://oresteutensils.com), a kitchenware shop at City Plaza, Kigali, Rwanda. Customers browse and search the catalogue, build a cart and check out; the order is recorded and confirmed on WhatsApp, and paid for on delivery or at the counter (cash or MoMo). The owner runs the catalogue from an installable admin app on their phone.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions) · **TypeScript** (strict)
- **Tailwind CSS v4**: design tokens in `src/app/globals.css`, light and dark themes
- **Supabase**: Postgres (catalogue, orders, enquiries), Auth (admin), Storage (product photos)
- **Zod** at every boundary: API routes, server actions, database rows
- **Vitest** unit tests, GitHub Actions CI (typecheck, lint, test, build)
- Deployed on **Vercel** (functions pinned to `cdg1`, next to the Paris database)

Without Supabase env vars the storefront runs on a local demo catalogue (`src/lib/seed.ts`). Production never serves it and nothing writes it to the database.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional; leave blank to run on the demo catalogue
npm run dev                  # http://localhost:3012
```

## Environment

See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap, JSON-LD, OG |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (RLS-restricted) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only.** Records orders and enquiries. Keep secret. |
| `ADMIN_EMAILS` | Optional. Accounts allowed into `/admin` (defaults to the shop account). |
| `NEXT_PUBLIC_GA_ID` | Optional. GA4, loaded only after cookie consent. |
| `GOOGLE_SITE_VERIFICATION` | Optional. Search Console meta tag. |

## Database

Run the files in `supabase/migrations/` in order in the Supabase SQL editor:

| File | What it does |
| --- | --- |
| `0001_init.sql` | Schema, RLS, `product-images` bucket |
| `0002_retired_demo_seed.sql` | Intentionally empty (the old demo seed was retired) |
| `0003_leads.sql` · `0004_testimonials.sql` · `0005_messages.sql` | Trade leads, reviews, contact messages |
| `0006_admin_only_access.sql` | Restricts every write and all customer data to the admin account |

Then create the admin user under **Authentication → Users** and turn **off** "Allow new users to sign up".

## How it works

- **Catalogue**: one list of products (photo, name, price, optional description). Shoppers search and sort; there are no categories to maintain. The database's `category_slug` column is filled automatically with an internal category.
- **Orders**: the browser sends product ids and quantities only. `/api/orders` re-prices every line from the database (`src/lib/orderPricing.ts`), applies the admin's free-delivery threshold, stores the order and returns the authoritative totals used in the WhatsApp message.
- **Admin**: `/admin`, installable as "Oreste Admin" (`public/admin.webmanifest`). Camera-first product editor, one-tap stock and homepage toggles, orders with references matching the customer's WhatsApp message.
- **Access**: `src/proxy.ts` and `requireAdmin()` allow only listed admin accounts; migration 0006 enforces the same in Postgres RLS.
- **Privacy**: no analytics cookies until the visitor accepts; "Cookie settings" in the footer reopens the choice.
- **Pure rules** live in `src/lib/*.ts` with tests next to them: catalogue, cart, order pricing, slugs, storage paths, WhatsApp messages, admin allowlist, i18n parity.

## SEO

Per-route metadata, `HomeGoodsStore` / `Product` / `BreadcrumbList` / `FAQPage` JSON-LD (no unverified ratings), dynamic `sitemap.xml`, `robots.txt`, and a live `/llms.txt` summary generated from the same data as the site.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on port 3012 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on port 3012 |
| `npm run lint` | ESLint |
| `npm test` | Unit tests |
