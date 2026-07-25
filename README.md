# Oreste Utensils

Premium kitchenware e-commerce for [Oreste Utensils](https://oresteutensils.com) — City Plaza, Kigali, Rwanda. Browse the catalog, build a cart, and check out via WhatsApp with payment on delivery (cash or MoMo). Free delivery across Kigali on orders over 500,000 RWF.

## Stack

- **Next.js 16** (App Router, Server Components) · **TypeScript** (strict)
- **Tailwind CSS v4** — warm editorial design system defined in `src/app/globals.css`
- **Supabase** — Postgres (catalog + orders), Auth (admin), Storage (product images)
- **Zod** — input validation on the order API and admin actions

The storefront runs entirely on typed **seed data** (`src/lib/seed.ts`) when Supabase env vars are absent, so you can develop and demo with zero backend setup.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — leave blank to run on seed data
npm run dev                  # http://localhost:3012
```

## Environment

See `.env.example`. All Supabase keys are optional for the storefront; all three are required for the admin panel and live orders.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap, JSON-LD, OG |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (RLS-restricted) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only.** Records orders past RLS. Keep secret. |

## Supabase setup

1. Create a Supabase project.
2. In the SQL editor, run `supabase/migrations/0001_init.sql` (schema, RLS, `product-images` storage bucket), then `0002_seed_catalog.sql` (launch catalog).
3. Create an admin user under **Authentication → Users**. That email/password logs into `/admin`.
4. Add the three Supabase env vars and redeploy.

The seed SQL is generated from `src/lib/seed.ts` — regenerate with `node scripts/generate-seed-sql.mjs` after editing the seed catalog.

## Architecture

```
src/
  app/
    (site)/        Storefront routes (home, shop, product, cart, about, faq, contact)
    admin/         Auth-guarded admin panel (products CRUD, orders, settings)
    api/orders/    Validated order intake (Zod + rate limit + honeypot)
    sitemap.ts robots.ts manifest.ts opengraph-image.tsx
  components/
    layout/ shop/ cart/ ui/
  lib/
    data.ts        Catalog access — Supabase when configured, else seed
    seed.ts        Launch catalog (source of truth for demo + seed SQL)
    supabase/      public / browser / server / admin (service role) / adminGuard
    constants.ts   Business facts (single source of truth: NAP, delivery rule)
```

- **Data layer** (`src/lib/data.ts`) is the only place that decides Supabase-vs-seed; pages never branch on it.
- **Business facts** live once in `src/lib/constants.ts` and flow to footer, JSON-LD, `llms.txt` and the WhatsApp flow — consistent NAP everywhere.
- **Free-delivery threshold** is admin-editable (`ou_settings`) and enforced server-side in the order API — the client never dictates totals.

## SEO & AEO

Per-route metadata, `LocalBusiness` / `Product` / `BreadcrumbList` / `FAQPage` JSON-LD, dynamic `sitemap.xml`, `robots.txt` (AI crawlers explicitly allowed), and a `public/llms.txt` business summary for answer engines.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on port 3012 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on port 3012 |
| `npm run lint` | ESLint |
| `node shot.mjs <url> <name> <width>` | Screenshot a page via system Chrome |
