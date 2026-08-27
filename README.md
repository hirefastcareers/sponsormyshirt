# Great North Run — Kit Sponsorship Landing Page

Viral, high-conversion sponsorship inventory for race-day kit placements (vest, shorts, socks, cap). Built with **Next.js App Router**, **Supabase**, and **Dodo Payments**.

## Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 · dark slate + neon emerald blueprint |
| Database | Supabase PostgreSQL (`sponsorship_slots`) |
| Storage | Supabase Storage bucket `sponsor-logos` |
| Payments | Dodo Payments (`dodopayments` + `@dodopayments/nextjs`) |

## Quick start

```bash
cp .env.local.example .env.local
# fill in Supabase + Dodo keys

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup

1. Create a Supabase project.
2. In the SQL Editor, run [`supabase/migrations/001_sponsorship_slots.sql`](supabase/migrations/001_sponsorship_slots.sql).
3. Confirm the `sponsor-logos` storage bucket exists and is public.
4. Copy project URL, anon key, and service role key into `.env.local`.

## Dodo Payments setup

1. Create one **one-time** product per slot in the [Dodo dashboard](https://app.dodopayments.com) (matching GBP prices).
2. Update each row:

```sql
UPDATE sponsorship_slots
SET dodo_product_id = 'pdt_xxxxx'
WHERE id = 'chest_center';
-- repeat for every slot
```

3. Point a webhook to `https://<your-domain>/api/webhooks/dodo` and set `DODO_PAYMENTS_WEBHOOK_SECRET`.

## Checkout flow

1. Buyer clicks an **available** pin on the kit blueprint.
2. Modal collects sponsor name, URL, and logo → `POST /api/upload`.
3. `POST /api/checkout` sets the slot to `pending` and creates a Dodo checkout session with metadata (`slot_id`, `sponsor_name`, `sponsor_url`, `logo_path`).
4. Buyer pays on Dodo; webhook `payment.succeeded` marks the slot `sold`, writes logo URL, and `revalidatePath('/')`.

## Project map

```
app/
  page.tsx                  Landing page (hero + kit + rate card)
  api/checkout/route.ts     Create Dodo session + hold slot
  api/upload/route.ts       Logo → Supabase Storage
  api/webhooks/dodo/route.ts Fulfil sold slots
components/
  KitVisualizer.tsx         SVG blueprint + interactive pins
  SponsorshipModal.tsx      Checkout form
  SponsorExperience.tsx     Client state bridge
lib/                        Supabase + Dodo helpers
supabase/migrations/        Schema + seed
types/sponsorship.ts        Shared TypeScript types
```

## Notes

- Without Supabase credentials the UI falls back to seeded demo inventory (checkout will still require live keys + `dodo_product_id`).
- Pending holds are not auto-expired; release abandoned checkouts manually or add a cron if needed.
