# Alluring — Build Plan (v1)

A trusted skincare marketplace with shopper storefront, accounts, wishlist, reviews, recommendations, and an admin dashboard. Payments are deferred — checkout will record orders as "Pending payment" so we can wire Paystack in a later pass.

## Phase 0 — Design directions

Before writing UI code, generate 3 rendered homepage directions in the brand palette (Deep Plum #2B0A3D, Soft Cream #F7F3EE, Champagne Gold #D6B36A, Charcoal #2D2D2D) with luxury serif display + clean sans body. You pick one, and every page is built to match.

Also generate the Alluring logo (elegant "A" monogram, gold-on-plum) as a reusable asset.

## Phase 1 — Backend (Lovable Cloud)

Enable Lovable Cloud, then create the schema:

- `profiles` — id (FK auth.users), full_name, phone, skin_type, skincare_goals[]
- `user_roles` + `app_role` enum (`admin`, `customer`) + `has_role()` security-definer function (per the user-roles pattern — never store role on profiles)
- `addresses` — user_id, label, recipient, phone, street, city, state, is_default
- `categories` — slug, name, description, image_url, sort_order
- `brands` — slug, name, logo_url
- `products` — slug, name, brand_id, category_id, price, description, ingredients, usage_instructions, skin_types[], skincare_goals[], stock_qty, is_active, avg_rating, review_count
- `product_images` — product_id, url, sort_order
- `reviews` — product_id, user_id, rating, title, body, is_approved (verified-purchaser check via trigger against orders)
- `wishlists` — user_id, product_id
- `carts` + `cart_items` (server-side cart keyed to user; guest cart stays in localStorage and merges on login)
- `orders` — user_id, status enum (`pending`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`), totals, shipping_address snapshot, payment_method
- `order_items` — order_id, product_id snapshot (name, price, image), qty
- `coupons` — code, type, value, active, expires_at, usage_limit

RLS on every table with proper `GRANT` blocks. Auth-only tables grant to `authenticated`; public catalog tables (categories, brands, products, product_images, approved reviews) also grant `SELECT` to `anon`. Admin-only writes gated by `has_role(auth.uid(), 'admin')`. Trigger creates a profile row on signup. Seed ~25 plausible skincare products across the 6 categories with AI-generated product images.

## Phase 2 — Auth

Email/password + Google sign-in via the Lovable broker. Guest checkout supported (creates a lightweight order tied to email, no account required). Password reset page at `/reset-password`. `_authenticated` layout is integration-managed.

## Phase 3 — Storefront routes

Public (top-level, SSR-friendly, each with its own `head()` metadata):

- `/` home — hero, featured, best sellers, category tiles, "shop by skin type" block, trust strip, reviews
- `/shop` product listing with filters (category, brand, skin type, goal, price) + sort + pagination
- `/category/$slug` filtered listing
- `/product/$slug` detail — gallery, price, description, ingredients, usage, skin-type/goal chips, reviews, related products, add-to-cart
- `/search` results with same filter rail
- `/cart` line-item editor + summary
- `/checkout` shipping + (stubbed) payment + summary → creates `pending` order
- `/order/$id/confirmation` order placed screen with delivery estimate
- `/about`, `/contact`
- `/auth` sign in / register, `/reset-password`

Authenticated (`/_authenticated/...`):

- `/account` profile + skin profile (skin type + goals drive recommendations)
- `/account/addresses`
- `/account/orders` + `/account/orders/$id` (track status)
- `/account/wishlist`

## Phase 4 — Recommendation engine (v1)

Simple SQL filtering — no ML. A server fn `getRecommendations({ skinType, goals, limit })` returns products where `skin_types` overlaps user's skin type AND `skincare_goals` overlaps at least one goal, ordered by avg_rating then review_count. Home page shows "Recommended for your skin type" when the user has a skin profile, otherwise falls back to "Best sellers". Product detail shows related products by shared category + overlapping goals.

## Phase 5 — Reviews

Verified-purchase only: review insert allowed only when an `order_items` row exists for that user+product on a `paid`/`shipped`/`delivered` order. DB trigger recomputes `avg_rating` and `review_count` on the product row. Admin can unapprove/remove.

## Phase 6 — Admin dashboard (`/_authenticated/admin/...`)

Gated by `has_role('admin')` in a pathless `_admin` layout. Sections:

- Overview — revenue, orders, top sellers, customer growth (simple charts from order data)
- Products — list, create, edit, delete, image upload to Cloud storage, stock edit inline
- Categories — CRUD
- Brands — CRUD
- Orders — list with status filter, detail view, status update dropdown
- Customers — list + view, can disable account
- Reviews — moderation queue, approve/remove
- Coupons — create/edit/disable

## Phase 7 — Polish

Mobile-first responsive pass on every route, sticky add-to-cart on mobile product detail, skeletons for loading, empty states, toasts for cart/wishlist actions, SEO `head()` per route with og:image at leaf routes, footer with category links, accessibility pass.

## Out of scope for v1 (flagged for follow-ups)

- Live Paystack integration (checkout writes `pending` orders, but no payment capture). Once you're ready, we add a server route under `/api/public/webhooks/paystack`, an initialize-transaction server fn, and flip orders to `paid` on webhook verify.
- Email notifications (order confirmation, shipping updates) — needs Resend or similar.
- Real shipping rate calculation — flat-rate placeholder for now.

## Technical notes

- TanStack Start + TanStack Query (loader `ensureQueryData` + `useSuspenseQuery`)
- All Supabase reads through `createServerFn`; public catalog reads use the publishable-key server client; user/admin reads use `requireSupabaseAuth`
- Product images stored in Cloud storage bucket `product-images`
- Design tokens in `src/styles.css` under `@theme` — no hardcoded colors in components
- Cart merges localStorage → server cart on login

## What you'll see between phases

After Phase 0 you choose a design direction. After Phase 1 the catalog is browsable. After Phase 3 the full shopping flow works end-to-end with stub checkout. After Phase 6 the admin can fully run the store. Confirm to proceed and I'll start with the design directions.
