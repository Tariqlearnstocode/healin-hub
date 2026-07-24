# The Healin Hub — End-to-End Audit

**Date:** 2026-07-24 · **Auditor:** automated multi-agent review (7 parallel specialists) + hand-verification
**Codebases:**
- Product app — `~/Coding/healin-hub-app` (Next.js 16 · React 19 · Tailwind v4 · Supabase Postgres/PostGIS · Leaflet)
- Pitch/brand site — `~/Coding/Healin-hub` (static HTML proposal)

**Cross-referenced against:** `healin-hub-PRD.md`, `healin-hub-features.md` (Quote A = what Dawn bought, $2,000), `dawn-call-notes-2026-06-15.md`, `delivered-features.md`.

---

## Verdict

**The build is substantially real and, in its core, genuinely good.** Geo/distance search (PostGIS geography + GIST index + a real radius RPC returning measured miles), auth flows, submit/claim, provider dashboard + lead inbox, admin moderation/taxonomy/users, the SEO route engine, and a premium, token-driven brand design are all actually implemented and match the promise. This is not the WordPress-cheap V1.

**But it is not handoff-ready.** There is a cluster of issues that are individually serious and collectively block deploying or transferring the project to Dawn:

1. **The repo cannot reproduce the working database.** Three tables the code depends on exist only in the live dev DB, not in any migration. A fresh provision breaks reporting, location SEO pages, the sitemap, and the CMS.
2. **Two row-level-security holes** let any signed-up user become admin, and let any provider self-approve and self-award the "✓ Vetted" trust badge — reopening the exact trust-model collapse class the rebuild was meant to fix.
3. **The core search under-delivers** in two ways that echo V1's failure: free-text matches business *name* only, and the geocode cache is silently disabled so every search hits a rate-limited public geocoder.
4. **A contractual SEO requirement is missing** (LocalBusiness structured data on listing pages) and **the marketing copy creates legal exposure** by promising what the Terms page correctly disclaims.

None of these are architectural rewrites. They are targeted fixes. The foundation is sound; the finishing and the reproducibility are not.

---

## 🔴 Blockers — fix before deploy or handoff

### B1. Schema drift: three live tables are absent from the migrations
**Where:** `reports` (used in `lib/actions/listings.ts:159`, `admin.ts:42`, `admin/page.tsx:65`), `locations` (`admin.ts:100,110`, `sitemap.ts`, `[slug]/page.tsx`, `[slug]/[location]/page.tsx`, `admin/taxonomy/page.tsx:22`), `landing_pages` (`lib/seo.ts:22`, `admin.ts:148,154`, `admin/content/page.tsx`). Migrations `0001`/`0002` define only 8 tables; none of these three.

These power **Quote A deliverables**: report/flagging, location + category-in-location landing pages (the "110+ page SEO engine"), the XML sitemap's location URLs, and the CMS-lite editor. They work today only because they were created out-of-band in the live Supabase project. The "Still to do" list already plans a Supabase transfer to Dawn's org — **any migration-based rebuild or fresh provision produces a DB where report submits error, location pages 404, the sitemap drops all location/combo URLs, and admin content/taxonomy throw.**

**Fix:** `supabase db pull` (or `pg_dump --schema-only`) against the live project, diff against `0001`, and commit migrations `0003+` for all three tables **with their RLS**. Reconcile the `landing_pages` column mismatch while doing it (writer `admin.ts:154` never sets `faq`/`status`, but reader `seo.ts` requires `status='published'` — see B5).

### B2. RLS lets any user promote themselves to admin
**Where:** `supabase/migrations/0001_core_schema.sql:189-190`. The `profiles` UPDATE/INSERT policies gate only on `id = auth.uid()` with **no restriction on the `role` column**. The anon key is public (`NEXT_PUBLIC_...`), so any logged-in provider can call PostgREST directly: `PATCH /profiles?id=eq.<self>` `{ "role": "admin" }`. `is_admin()` then hands them Dawn's entire admin surface — approve/remove listings, manage users, everything.
**Fix:** forbid client writes to `role` entirely (mutate it only via a `security definer` admin RPC), or add a `with check` that pins `role` to its current value for non-admins.

### B3. RLS lets providers self-approve, self-Vet, and self-Feature
**Where:** `0001_core_schema.sql:197-198`. The `owners edit own listing` policy authorizes the row (`owner_id = auth.uid()`) but **not the columns**. `status`, `vetted`, `featured` are plain columns. A provider can `PATCH /listings?id=eq.<own>` `{ "status":"approved", "vetted":true, "featured":true }` — skipping moderation, awarding themselves the hand-checked trust badge the whole brand rests on, and pinning to the top of search. The clean `updateListing` server action is irrelevant; the anon key + RLS is the real trust boundary. **This is also why the data model is not yet safely tier-ready** — a future `tier` column would be self-settable the same way.
**Fix:** a `BEFORE UPDATE` trigger that forces `status/vetted/featured/owner_id` to their old values unless `is_admin()`; or column-level GRANTs; or route all listing writes through a service-role server action and revoke direct UPDATE from `authenticated`.

### B4. No profile row is created on signup (no trigger, no insert)
**Where:** `lib/actions/auth.ts:8` (`signUp` writes `full_name` to auth metadata only, never inserts `profiles`); no `handle_new_user` trigger exists anywhere. Consequences: `profiles` lookups return null, so `is_admin()` is always false and the admin console is unreachable **from a fresh build**; nothing can be approved, so a fresh directory is empty; and every real signup gets a null dashboard greeting. The dev instance works only because an admin profile + approved listing were seeded by hand — i.e., **not reproducible from the repo**, same root cause as B1.
**Fix:** add the standard `on auth.users` → `handle_new_user` trigger that inserts a `profiles` row (id, `full_name` from metadata, default role), seed Dawn's admin row explicitly, and add an idempotent "ensure profile" on dashboard load to backfill existing users.

### B5. Location/CMS content would never display even with the tables
**Where:** `saveLandingContent` (`admin.ts:154`) inserts without `status`, but `getLandingContent` (`seo.ts`) filters `status='published'`. Admin-authored copy silently never appears. Fix alongside B1.

---

## 🟠 Critical — core value prop, security, legal, contractual

### C1. Free-text search matches business *name* only
**Where:** RPC `0001:153` (`l.name ilike '%query%'`) and nationwide branch `search/page.tsx:92`. A "What" term becomes a real filter only on an **exact** taxonomy-name match (`search/page.tsx:52-57`). So "botox" works (seed service is literally "Botox") but **"lip filler," "facial," "ozempic," "weight loss shot,"** or any provider whose *services* match but whose *name* doesn't will return few or zero results. This is the "search that fails" class the rebuild exists to fix. `pg_trgm` is provisioned but unused for fuzzy matching.
**Fix:** extend the RPC's `p_query` to also match description, joined service names, and category — ideally a `websearch_to_tsquery` over a `name + description + services` tsvector.

### C2. Geocode cache is dead — every search hits live Nominatim
**Where:** `lib/geocode.ts:8` uses the **anon** key and comments "public read/insert via RLS," but the schema enables RLS on `geocode_cache` with **zero policies** (`0001:223`, "service-role only"). Anon + RLS-on + no-policy = deny all: cache reads always miss, upserts silently fail. Every located search calls `nominatim.openstreetmap.org` live (policy ~1 req/s, bans abusers), with **no fetch timeout**. Under real traffic this degrades to the nationwide fallback and stalls SSR — the same silent-break failure mode that killed V1's search.
**Fix:** use the service-role key in `geocode.ts` (server-only) or add explicit RLS policies for `geocode_cache`; add a fetch timeout; consider Mapbox/Google for the accuracy promise.

### C3. Listing detail page is missing LocalBusiness structured data + per-page meta
**Where:** `app/listing/[slug]/page.tsx` emits no JSON-LD and has no `generateMetadata`. PRD §6.2 explicitly mandates "server-rendered listing pages with structured data (schema.org LocalBusiness)." LocalBusiness appears only as ItemList children on aggregate pages (`seo.ts:43`) — not the canonical entity page. This is a **contractual Quote A/baseline item**, and the profile is the page in robots/sitemap.
**Fix:** add a `LocalBusiness` JSON-LD block + `generateMetadata` (title/description) to the listing page.

### C4. Marketing copy over-promises what the Terms disclaim (legal exposure)
The Terms page (`terms/page.tsx:31-39`) correctly frames "✓ Vetted" as an internal **review process**, *not* a guarantee of licensing, safety, or quality. But the marketing surfaces assert the opposite as accomplished fact:
- `page.tsx:64-67,96,158,235` — "check credentials by hand," "Credentials checked, not just claimed," "Licensing checked."
- `about/page.tsx:32-34` — "we verify their license and business standing **ourselves**"; `:19` — "make it **safe**."
- `[slug]/page.tsx:105` (auto-generated across every category page) — "credentials were checked by hand."
- `HeroMapDemo.tsx:62` — caption says "Showing **vetted** providers" over a demo set that includes `vetted:false` pins (factually wrong).

In the aesthetics/injectables space a plaintiff quotes the homepage, not the disclaimer. **Fix:** move all claims to process language ("we review each provider's credentials before listing"), verb = *review* not *verify/guarantee*, drop "safe" and "recommend," and fix the hero caption. This aligns with the documented voice note that "Vetted" must read as a review process, not a guarantee.

### C5. Stored XSS via JSON-LD injection
**Where:** `[slug]/page.tsx:89-94,155-162` and `[slug]/[location]/page.tsx:72-84` inject `JSON.stringify(...)` into `<script type="application/ld+json">`. `JSON.stringify` does not escape `<`/`/`, so a provider whose approved listing `name`/`description` contains `</script><script>…` breaks out and executes on high-traffic public SEO pages.
**Fix:** escape before injecting — `JSON.stringify(x).replace(/</g,'\\u003c')` — via a shared `safeJsonLd()` helper at all four sites.

### C6. `javascript:` URI XSS via unvalidated listing URLs
**Where:** `listing/[slug]/page.tsx:106-108,124` render provider-supplied `website`/socials directly as `href`; no scheme validation on write (`listings.ts`). A `javascript:…` value executes on click.
**Fix:** validate/normalize URLs server-side (require http/https) and/or guard at render.

---

## 🟡 High

- **Featured-first sort buries the nearest provider.** RPC `0001:154` orders `featured desc, distance asc`; a featured provider 90 mi away outranks a Vetted one 1 mi away, contradicting the site's own "Results sort by real miles" copy (`page.tsx:135`). Default to pure distance when a location is present; cap promoted placement to one clearly-labeled slot. (`search/page.tsx:94`)
- **Lead & report forms have no spam protection.** `leads` insert policy is `with check (true)` (`0001:218`); `sendLead`/`reportListing` do no validation and trust a client `listing_id`. Given V1 was compromised by spam, this is an open funnel into providers' inboxes. Add honeypot + rate limit + captcha; constrain RLS to approved listings.
- **Header nav overflows at 375px** — no hamburger/mobile menu; the `<nav>` is `flex` with no wrap and its four items exceed the phone viewport (`layout.tsx:30-51`). The single most likely visible mobile break, on the primary chrome.
- **No visible keyboard focus states anywhere** — grep for `focus-visible`/`focus:ring` returns nothing; inputs only shift border color (~1.3:1). Add a global `:focus-visible` outline.
- **No `prefers-reduced-motion` handling** — the 6s auto-rotating hero carousel, staggered pin animations, and 404 `animate-bounce` are ungated.
- **Admin dashboard full-table loads** — `admin/page.tsx:64` selects every listing's `state` on each render to build a dropdown; `users/page.tsx:27` loads all `owner_id`s into a JS Map for counts; both use exact `COUNT`. Scale cliffs well before the "handles 5,000 listings" claim. Aggregate in SQL / use estimated counts.
- **No index on `listings.owner_id`** (`0001:68-72`) though it's filtered in RLS on nearly every authenticated path. Add it.
- **Delivered-log overclaim.** `delivered-features.md:45` states schema for "reviews/ratings, paid tiers (free/premium/featured), analytics events, favorites" exists. **None of it does** — no such tables/columns, no `tier`, no consumer role. "Tier-ready" holds only in the weak sense that columns can be added later (and B3 must be fixed first). Correct this before it's shown to Dawn as sold-and-built.

---

## 🟢 Medium / Low (polish backlog)

**Search/UX:** real results map has no mile badges (only the demo does — `LeafletMap.tsx` vs `DemoMap.tsx`); no `loading.tsx` skeletons on any async route; photos use raw `<img>` (no `next/image`, layout shift, thumb rendition exists but profile uses full-res); autocomplete is an ungrouped native `<datalist>` with no "Where" typeahead; result-count label misleads on deep pages; no "you are here" map marker.
**Schema/data:** 5-photo cap is app-only, not DB-enforced (log claims otherwise — add a `check` constraint); no listing de-dup constraint; `category_id` has no `on delete` action; missing indexes on `claims.claimant_id`, `leads.listing_id`, and the nationwide sort.
**Auth/admin:** `updateListing` has no server-side ownership check (relies on RLS; non-owner edits report false "saved"); the edit form pre-fills for any approved listing (info exposure); no server-side input validation (Zod) anywhere — omitted fields insert the literal string `"null"`; no confirmations on hard deletes (`deleteService` cascades to every listing) or user demotion; no restore button for soft-removed listings; proxy gates `/admin` on login only, not role (per-page checks cover it, but no defense-in-depth).
**Design/a11y:** `text-plum-300` placeholders fail WCAG AA (→ `plum-400`); keep interactive text on `teal-600` not `teal-500`; tap targets under 44px on facet/admin pills; duplicated hardcoded brand hex in three pin SVGs; untokenized `red-*` error colors; `logo-white.svg` unused; leftover Next template SVGs in `public/`.
**Copy consistency:** audience noun drifts "clients" vs "consumers"; CTA label varies 5 ways ("List your business free" / "List it free" / "Submit for review"); missing meta descriptions on About/Contact/Search; sitemap omits `/pricing`, `/terms`, `/privacy`; 7 user-facing em dashes vs the "minimal em dashes" preference; "botox" vs "Botox" casing.

---

## What's genuinely strong (don't touch)

- **Geo core:** PostGIS geography column + GIST index + radius-bounded RPC returning real miles — the right architecture, and it holds at 50k listings. Listings can't be created without coordinates.
- **"Never lands blank"** is real and verified — every search path (no filter / category-only / location-only / both / bad location) resolves to results or an honest, on-brand empty state with a CTA.
- **Access control on admin actions** is clean — `requireAdmin()` guards all 11 admin server actions and every admin page re-checks role server-side; the self-demote lockout guard is correct.
- **Auth plumbing** — `proxy.ts` uses `getUser()` (JWT-validating), gates the account areas, and the reset/confirmation callbacks handle both PKCE and OTP flows.
- **Design system** — premium, token-driven (aubergine/mauve/teal), serif/sans pairing, consistent radii/pills/shadows. Most page layouts already stack correctly on mobile; the admin table is correctly `overflow-x-auto`-wrapped.
- **Profile completeness, branded 404, empty states, RLS model** (public=approved / owner / admin) are all well done.

---

## Recommended order of work

1. **Reproducibility + security (blockers):** B1 (commit the three missing tables + RLS), B2/B3 (close the two RLS escalation holes), B4 (profile trigger + seed admin), B5 (CMS status). Nothing ships until the repo can rebuild a working, non-bypassable DB.
2. **Core value prop:** C1 (search beyond name), C2 (geocode cache + timeout).
3. **Contractual + legal:** C3 (listing JSON-LD + meta), C4 (reconcile marketing copy with Terms). Correct the `delivered-features.md:45` overclaim.
4. **Hardening:** C5/C6 (XSS), lead/report spam controls, server-side validation.
5. **Mobile + a11y:** header nav collapse, focus-visible, reduced-motion, contrast, tap targets.
6. **Scale + polish:** admin full-table loads, indexes, loading states, `next/image`, map mile badges, copy/CTA consistency.
