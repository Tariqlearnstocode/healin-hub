# The Healin Hub — Rebuild Notes

**Client:** Dawn Foster
**Project:** Rebuild of a nationwide (all 50 states) directory for aesthetic & self-care businesses — botox, fillers, med spas, hair, nails, post-op care, etc. ("Angie's List for anything aesthetic")
**Current site (V1):** https://thehealinhub.com
**Status:** Scoping a proper rebuild. Tariq is building it; go-to-market/seeding is the client's concern, not in scope.

---

## The Vision

A searchable national directory where:
- Consumers find vetted aesthetic/self-care providers near them.
- Businesses get listed and (eventually) pay for placement.
- Coverage spans all 50 states.

**Business model:** Free for everyone to list at launch. Introduce listing fees later. Build the data model with paid tiers in mind now, but don't build billing/subscriptions yet.

---

## What V1 Actually Is

Not the custom Laravel build referenced a year ago — the current live site is a **stock WordPress install running the ListingPro directory theme + Elementor.** It's an off-the-shelf template, lightly configured.

(Note: Tariq referred to it as a "Housecall Pro-type template" — the point stands either way: it's a generic, pre-made directory template, not a custom build. The actual theme is ListingPro.)

---

## Mistakes the Last Developer Made

### 1. Sold a stock template as a custom build
He dropped in a basic, pre-made ListingPro WordPress theme — the same template anyone can buy — and charged her as if it were custom work. No real design or engineering investment. This is the core grievance: she paid custom prices for a generic template.

### 2. The backend doesn't do the one job a directory exists to do — search
- **No working distance search.** Users can't find providers near them by radius. For a directory, this isn't a missing feature — it's the entire point of the product.
- **Broken "search by state."** Location filtering falls back to crude text matching instead of real geographic lookup.
- **Filtering is poor overall.**

**Why this happened (so we sound credible diagnosing it):** ListingPro geo-search only works if (a) every listing is *geocoded* — its street address converted to lat/long coordinates — and (b) a *Google Maps API key with billing* is properly wired in. Cheap installs skip both. Without coordinates there's nothing to measure distance from, so location search is dead. He skipped the setup that makes the core function work.

### 3. No real content / polished placeholder left in place
Live site still shows "Test" and "Sample Listing Janine" listings, lorem-ipsum testimonials with "Designation" as the name, placeholder.com images, and category links that go nowhere (`#`). Handed over unfinished.

### 4. The install is now compromised (SEO spam injection)
The live pages are stuffed with injected spam — German casino text ("betrix") and a footer full of Indonesian gambling links (slot gacor, toto911, spgtoto, judi bola, etc.). Classic hacked-WordPress link injection, usually from a nulled/pirated plugin or theme or an unpatched install. **Implication:** the current install isn't salvageable as-is — it needs to be torn down, not patched. Google can/will penalize a site in this state.

### 5. Design had no "wow"
Per Dawn's earlier feedback: confusing navigation, no visual polish, "most basic site he could come up with." She had to spell out a full revamp (carousel banner, dropdown nav/categories, cascading subscription list) herself.

---

## Pricing / Plans (from V1)

The pricing page is just **ListingPro's stock plan-comparison grid** — nothing custom. Feature toggles in the template include: Map Display, Contact Display, Image Gallery, Video, Business Tagline, Location, Website, Social Links, FAQ, Price Range, Tags/Keywords, Business Hours, Timekit (booking), listing duration.

Useful as a **menu of features to gate behind paid tiers later** — not as a model to copy wholesale.

---

## Rebuild Principles (so far)

1. **Geo-search is native, not bolted on.** Architecture must treat distance + location filtering as a first-class function (proper geocoding + a database/search engine that does geo queries), not a plugin afterthought.
2. **Clean, real filtering** by category, service, and location.
3. **Data model designed for paid tiers from day one**, billing deferred.
4. **Don't reuse the compromised WordPress install** — fresh build.

---

## Open / Next

- **Stack & architecture** — to be discussed next.
- Build ownership: Tariq building it (solo vs. with a developer — TBD).

## Pitch Format Reference

Deliver as two single-page pitches (Quote A and Quote B), designed in the same style as the prior C4 proposal:

- **Reference pitch:** https://brilliant-detroit-c4.vercel.app/pitch.html
- **Structure to mirror:** hero/tagline → the problem today → how it works → the product → works anywhere → what's included (v1) → scope (v1 vs. future add-ons) → why it fits → see it in action (live demo links) → book a call → C4 Growth Solutions footer.
- **Note:** include a live, clickable demo of search + a listing page — seeing geo-search work is the strongest rebuttal to the last build.
