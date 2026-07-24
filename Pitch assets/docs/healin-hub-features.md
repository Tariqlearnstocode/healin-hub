# The Healin Hub — Feature Breakdown & Two-Quote Scope

**Companion to:** The Healin Hub PRD
**Purpose:** Catalog every feature and page, split into the two quotes Dawn will receive, plus future add-ons and an explicit "won't build" list.

**Pitch format to design against (reference):** Build both quotes as single-page pitches in the same style as the Brilliant Detroit proposal — https://brilliant-detroit-c4.vercel.app/pitch.html — structure: hero/tagline → the problem today → how it works → the product → works anywhere → what's included (v1) → scope (v1 vs future add-ons) → why it fits → see it in action (live demo links) → book a call → C4 footer.

**The dividing line between the two quotes:**
- **Quote A — The Working Directory:** everything required for the directory to *do its job* and look premium. This is the direct fix for what the last developer broke. It is complete and launchable on its own.
- **Quote B — The Full Platform:** everything in A, plus the features that *grow the business* — trust signals, monetization, and content.

---

## Quote A — The Working Directory

A complete, launchable directory with location/distance search that actually works. Free for providers to list.

### Pages
- **Home** — search-first hero (What + Where), category tiles, featured listings
- **Search / Results** — list + map view, faceted filters (category, service, location, distance)
- **Listing Detail** — full provider profile
- **Category landing pages** — e.g., `/med-spas`, `/botox`
- **Location landing pages** — e.g., `/texas`, `/austin-tx`
- **Category + Location landing pages** — e.g., `/botox/austin-tx` (organic-ranking engine)
- **Submit a Listing** — public form with address geocoding
- **Claim a Listing** — provider claims an existing record (with verification)
- **Business Sign up / Log in**
- **Business Dashboard** — manage owned listing(s)
- **Admin Dashboard** — moderate, edit, manage taxonomy/locations/users
- **About · Contact · Pricing ("list free") · Privacy · Terms**
- **System pages** — 404/empty states, password reset, email verification

### Core Features
- **Geocoding on every listing** (address → lat/long) — the missing piece in V1
- **Distance/radius search**, sorted by proximity
- **Geographic location search** (city/state/zip), not text matching
- **Faceted filtering** — category, sub-service, location, distance
- **Map view** with provider pins
- **Service/category autocomplete**
- **Rich listing profile** — photos/gallery, services, hours, contact, website, social links, map
- **Contact / lead form** on each listing (provider receives the inquiry)
- **Listing reporting/flagging** for moderation
- **Admin controls** — approve/edit/remove any listing; manage categories, services, locations, users

### Baseline (included, never a separate line item)
- Fully responsive (phone → desktop)
- SEO foundation — schema.org LocalBusiness markup, XML sitemap, clean URLs, per-page meta
- Secure, isolated deployment (own database; no shared/compromised install)
- **Tier-ready data model** — listing schema supports future paid gating without a rewrite

---

## Quote B — The Full Platform

Everything in Quote A, plus the growth layer.

### Added Pages
- **Reviews** on listing pages + review submission flow
- **Consumer Sign up / Log in**
- **User Dashboard** — saved/favorite providers
- **Provider Analytics** view (within business dashboard)
- **Blog** — index + article pages
- **"For Businesses"** marketing/landing page

### Added Features
- **Reviews & ratings** with moderation — core to the "Angie's List / vetted" promise
- **Verified / "Vetted" badges** — leans into the brand's "vetted by professionals" language
- **Featured / sponsored listings** + **paid tiers** (Stripe-ready; switch on when ready)
- **Provider analytics** — profile views, lead counts, engagement
- **Lead / appointment-request inbox** for providers
- **Consumer accounts + saved favorites**
- **Richer filters** — rating, price range, "open now"
- **Map browse** with pin clustering
- **Blog / content engine** — compounding SEO
- **Optional showpiece: AI / MCP access** — query the directory conversationally ("what's listed in Dallas?"), pull reports, update records via ChatGPT/Claude

---

## Phase 2+ Future Add-Ons (list in both quotes; upsell later)

Built on the same foundation, switched on when she's ready:
- **SMS / text notifications**
- **Full booking & scheduling** with provider calendars
- **Multi-location / chain** support (one owner, many locations)
- **Public API** for partners/integrations
- **Native mobile app** (iOS/Android)
- **Scheduled report exports & email digests**

---

## Won't Build (deliberately out of scope)

Flagged so scope stays disciplined and the budget goes where it matters:

- **In-app booking calendars at launch** — providers won't keep them current; a "request appointment" lead form does ~90% of the job for ~10% of the effort. Real scheduling belongs in Phase 2.
- **Marketplace payment processing** between consumers and providers — don't become a payment processor; the business sells listings, not transactions.
- **In-app chat / messaging** — heavy to build and moderate; email leads are sufficient.
- **Native mobile apps in v1** — responsive web covers it; apps double the maintenance surface.
- **Heavy consumer-account features early** — favorites/profiles are nice-to-have, not the product; they sit in Quote B, not Quote A.

---

## Quick Reference — Tier Matrix

| Capability | Quote A | Quote B | Phase 2+ |
|---|---|---|---|
| Geo/distance + location search | ✅ | ✅ | |
| Faceted filtering (category/service/location) | ✅ | ✅ | |
| Map view | ✅ | ✅ (+ clustering) | |
| Listing profiles + photos | ✅ | ✅ | |
| Submit / claim listing | ✅ | ✅ | |
| Business dashboard | ✅ | ✅ (+ analytics) | |
| Admin dashboard & moderation | ✅ | ✅ | |
| Category/location SEO landing pages | ✅ | ✅ | |
| Contact / lead form | ✅ | ✅ (+ lead inbox) | |
| Reviews & ratings | | ✅ | |
| Verified / vetted badges | | ✅ | |
| Featured/sponsored + paid tiers (Stripe) | | ✅ | |
| Consumer accounts + favorites | | ✅ | |
| Blog / content engine | | ✅ | |
| AI / MCP access | | ✅ (optional) | |
| SMS notifications | | | ✅ |
| Full booking/scheduling | | | ✅ |
| Multi-location / chains | | | ✅ |
| Public API | | | ✅ |
| Native mobile app | | | ✅ |
