# The Healin Hub — Product Requirements Document

**Client:** Dawn Foster
**Prepared by:** C4 Growth Solutions (Clarence T. Archibald IV)
**Product:** A nationwide directory for aesthetic & self-care providers
**Status:** Draft for rebuild scoping
**Reference (current site, V1):** https://thehealinhub.com

---

## 1. Summary

The Healin Hub is a nationwide (all 50 states) directory connecting consumers with aesthetic and self-care providers — med spas, botox/filler providers, post-op care, salons & nail shops, medical weight-loss, skin tightening, facials, and related services. Think "Angie's List for anything aesthetic."

A first version was built by an outside developer on a stock WordPress/ListingPro template. It failed on its most fundamental function — location and distance search — and was handed over unfinished and, as of this writing, compromised by SEO spam injection. This document defines a from-scratch rebuild on a modern, custom stack where geographic search is a first-class capability rather than a plugin afterthought.

This PRD covers the product requirements. Feature-by-feature scope and the two-tier quote breakdown live in the companion **Features** document.

---

## 2. Background & Problem

The existing site is a generic ListingPro WordPress theme configured lightly and sold as custom work. Its specific failures:

- **Location/distance search does not work.** Users cannot reliably find providers near them, and "search by state" falls back to crude text matching. For a directory, this is the entire value proposition failing.
- **Root cause:** listings were never geocoded (addresses converted to coordinates) and no maps/geocoding API was properly configured — so there is no geographic data to search against.
- **Unfinished & insecure.** The live site still carries placeholder/test listings and lorem-ipsum content, and the install has been compromised with injected spam links. It is not salvageable; it must be replaced, not patched.

## 3. Goals

1. Deliver a directory where **location and distance search work flawlessly** — the core function the prior build missed.
2. Provide **clean, fast filtering** by category, service, and location.
3. Give the owner **full administrative control** (moderate listings, edit any record, manage users).
4. Build on an architecture that is **SEO-strong** (directories live or die on organic search) and **secure**.
5. Structure the product so **paid listing tiers can be switched on later** without a rewrite.

## 4. Non-Goals (for the initial build)

- Go-to-market and listing acquisition/seeding are the client's responsibility, not part of the build scope.
- No in-app booking/scheduling calendars at launch (a lead/contact form covers the need).
- No marketplace payment processing between consumers and providers.
- No native mobile apps; the web app will be fully responsive.

## 5. Users & Personas

**Consumer (searcher).** Wants to find a trustworthy nearby provider for a specific service. Enters a service and a location, expects nearby results sorted by distance, filters by category/service, and views a provider's profile, photos, and contact details.

**Provider (business owner).** Wants to be found. Submits or claims a listing, manages their profile (services, hours, photos, contact), and — in later tiers — sees engagement and pays for enhanced placement.

**Administrator (the owner / Dawn).** Wants control. Approves and moderates listings, edits any record, manages categories and locations, and manages users. This directly addresses the capability gap from the original engagement ("edit listings, delete users").

## 6. Functional Requirements

### 6.1 Search & Discovery (the spine)
- Geocode every listing on creation/edit (address → latitude/longitude).
- Distance/radius search: "providers within N miles of a location," sorted by proximity.
- Location search by city, state, and zip that resolves geographically, not by text match.
- Faceted filtering: category, sub-service, location, distance (extensible to rating, price, "open now" in later tiers).
- Map view with provider pins alongside list results.
- Fast, forgiving search input (service/category autocomplete).

### 6.2 Listings
- Rich provider profile: name, categories/services, description, photos/gallery, address + map, hours, phone, website, social links.
- SEO-optimized, server-rendered listing pages with structured data (schema.org LocalBusiness).

### 6.3 Submission & Claiming
- Public "submit a listing" form with address geocoding.
- "Claim this listing" flow for providers to take ownership of an existing record, with verification.

### 6.4 Provider Accounts
- Sign up / log in, manage owned listing(s), edit content, upload photos.

### 6.5 Administration
- Dashboard to review, approve, edit, and remove any listing.
- Manage taxonomy (categories, services) and locations.
- Manage users and provider accounts.
- Moderate flagged/reported listings.

### 6.6 SEO & Content Infrastructure
- Templated **category landing pages** (e.g., `/botox`) and **location landing pages** (e.g., `/austin-tx`), plus **category+location** combinations (e.g., `/botox/austin-tx`). These combination pages are the primary organic-ranking mechanism for directories and must be designed in from the start.
- XML sitemap, clean URL structure, per-page meta, structured data.

### 6.7 Trust & Quality (tiered)
- Listing reporting/flagging.
- Reviews, ratings, and verification/"vetted" badges are defined in the Features doc as higher-tier capabilities aligned to the brand's "vetted by professionals" promise.

## 7. Business Model Requirements

- **Launch:** free for all providers to list.
- **Later:** introduce paid listing tiers (featured/sponsored placement, enhanced profiles).
- **Build implication:** the data model and listing schema must support tiering and feature gating from day one, but billing/payment integration is deferred until activation. Do not build subscription/billing infrastructure in the initial scope.

## 8. Recommended Technical Architecture

- **Frontend / app framework:** Next.js (React) — server-rendered for SEO and speed.
- **Database:** PostgreSQL with the **PostGIS** extension — native geographic/distance querying (the capability the prior build lacked).
- **Backend platform:** Supabase — managed Postgres + PostGIS, authentication, file storage, and row-level security in one platform, which compresses build time for a small team.
- **Geocoding & maps:** Google Maps Platform or Mapbox — address geocoding on submission, map display, and location autocomplete.
- **Hosting:** Vercel (app) + Supabase (data).
- **Deferred:** Stripe (payments, when paid tiers activate); a dedicated search engine such as Typesense/Algolia only if PostGIS filtering needs acceleration at scale.

One-line summary: **Next.js + Supabase (Postgres/PostGIS) + Mapbox/Google Maps, deployed on Vercel.**

## 9. Information Architecture (Page Map)

**Public:** Home (search-first) · Search/Results (filters + map) · Listing Detail · Category landing pages · Location landing pages · Category+Location landing pages · About · Contact · Pricing/Plans · Privacy · Terms.

**Provider:** Submit a Listing · Claim a Listing · Sign up / Log in · Business Dashboard.

**Admin:** Admin Dashboard (listings, taxonomy, locations, users, moderation).

**System:** 404 / empty states · password reset · email verification.

(Higher-tier pages — reviews, consumer accounts/favorites, blog, provider analytics — are enumerated in the Features doc.)

## 10. High-Level Data Model

- **Listing** — business profile; includes geocoded lat/long, category/service references, media, hours, contact, owner reference, status (pending/approved), and a tier field (for future gating).
- **Category / Service** — hierarchical taxonomy (e.g., Aesthetic Services → Injectables).
- **Location** — normalized city/state/zip data supporting landing pages and geo lookups.
- **User** — accounts with roles (consumer / provider / admin).
- **Review** *(later tier)* — rating + text tied to a listing and user.
- **Lead / Inquiry** *(later tier)* — contact-form submissions routed to providers.

## 11. Success Criteria

- A consumer can enter a service and a location and get accurate, distance-sorted nearby results — verified across multiple states.
- Filtering by category/service/location returns correct results quickly.
- A provider can submit or claim and fully manage a listing.
- The owner can moderate and manage all listings and users from one dashboard.
- Category and location pages are indexable and structured for organic search.
- No placeholder content or security/spam exposure at handover.

## 12. Phasing

- **Phase 1 (v1):** Sections 6.1–6.6 and the public/provider/admin pages in Section 9 — a complete, working, SEO-ready directory with free listings.
- **Phase 2+:** reviews & verification badges, paid tiers + Stripe, consumer accounts/favorites, provider analytics, blog/content engine, AI/MCP access, SMS, full scheduling, multi-location, public API. (Detailed and tier-assigned in the Features doc.)
