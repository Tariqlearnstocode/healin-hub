# The Healin Hub — Delivered Features Log

**Purpose:** A running, plain-English record of everything shipped on the build — big and small — so nothing gets lost before it's shown to Dawn. Some of these look minor in a list but represent real craft (polish, edge cases, trust signals) that's easy to forget happened once it's live.

Format: what shipped · why it's worth mentioning to Dawn. App repo: `~/Coding/healin-hub-app`.

---

## Delivered (as of 2026-07-23)

### Foundation
- **Production database with real geo-search.** Supabase Postgres with PostGIS: every listing is geocoded on creation and search returns providers within N miles sorted by actual measured miles. *Worth mentioning to Dawn:* this is the direct, verified fix for the one thing V1 couldn't do. Tested end-to-end: "60619" put her own med spa 0.2 miles from the searcher.
- **Free geocoding with caching.** City/zip lookups use OpenStreetMap and cache in the database, so there's no Google Maps bill and no API key to misconfigure — the exact failure that killed V1's search. *Worth mentioning:* her running costs stay low and the core feature can't silently break the same way twice.
- **Security baked in (row-level security).** The database itself enforces who sees what: public sees approved listings only, owners edit only their own, Dawn's admin role sees everything. *Worth mentioning:* V1 was compromised by spam injection; this build's permission model lives in the database, not in plugin settings.

### Consumer experience
- **Search that never lands blank.** No filters = everything nationwide, category alone works, location alone works, both combine. Paginated, with a national map fallback. *Worth mentioning:* users can't hit a dead end; every path shows providers.
- **Search autocomplete with service-level filtering.** The What field suggests all categories and services as you type; a picked suggestion becomes a real filter ("Lymphatic Drainage Massage" returns providers offering that exact service, not name matches).
- **Live map with brand pins + mile badges** beside results, on search and on every listing profile.
- **Trust-led homepage copy, grounded in research.** Researched real consumer pain (fear of unlicensed injectors, Instagram-as-search, unverifiable credentials) and wrote the homepage around it: "Self-care you can actually trust." *Worth mentioning:* the site sells what her customers are actually afraid of, not what the tech does. ICP documented in `healin-hub-app/docs/icp.md`.
- **Animated hero map demo.** The homepage plays a scripted search (pins dropping with mile badges, rotating Chicago/Atlanta/Houston) so visitors see the product working before reading a word.
- **Rich listing profiles.** Photo gallery, services chips, weekly hours table, social links (Instagram/Facebook/TikTok), map, call and website buttons, and a lead form that routes messages to the provider. *Worth mentioning:* providers get real leads from day one, which is her pitch for getting them to claim listings.
- **Photo uploads, built to scale.** Up to 5 photos per listing; the first is the cover shown on search results. Photos are compressed in the browser before upload (a 6MB phone photo becomes ~250KB) into two renditions (display + thumbnail), served with 1-year cache headers. The 5-photo cap is enforced by the database itself. *Worth mentioning:* photo storage adds effectively $0 to running costs even at 10,000 listings, because the sizing discipline is built in, not hoped for. Verified end to end: upload, cap rejection of a 6th photo, gallery, and search-card thumbnails.
- **Report-a-listing.** Every profile has a report link (wrong info, possibly unlicensed, closed, spam) feeding an admin moderation queue. *Worth mentioning:* "possibly unlicensed" reporting is the trust promise with teeth; the community helps police the checkmark.
- **Fully responsive.** Checked at phone width, issues fixed.

### Provider side
- **Submit-a-listing with automatic geocoding + review queue.** Listings enter as pending and can't exist without coordinates. Providers pick their exact services (checkboxes feed service search), set hours, and add socials in the same form.
- **Claim-a-listing** with evidence + admin approve/transfer. *Worth mentioning:* the claim flow is what the $100 outreach add-on drives providers into.
- **Provider dashboard.** Manage/edit listings, claim status, and a client-inquiry inbox showing each lead's message with tap-to-email/call contact.
- **Full account flows.** Email/password signup with confirmation callback, sign-in, password reset (request link → emailed → choose new password). No dead ends for real users.

### Admin (Dawn's control panel)
- **Moderation.** Approval queue, claim resolution, report queue (resolve/dismiss), ✓ Vetted and Featured toggles, edit/remove any listing.
- **Filtering and sorting at scale.** Listings table filters by name/category/state/status, sorts on any column, 50 per page, all in the database query. *Worth mentioning:* when the directory is 5,000 listings, her control panel already handles it.
- **Taxonomy management.** Add/edit categories, add/remove services per category, from the UI.
- **SEO location management.** Add a city (auto-geocoded) and ~11 landing pages + sitemap entries publish instantly; remove one to unpublish. No developer needed.
- **User management.** Promote/demote admins, see each user's listings count. Guard: an admin can't demote themselves.
- **Editable page copy (CMS-lite).** Override any landing page's title, meta description, intro, or body; blank fields fall back to templates. *Worth mentioning:* Dawn can strengthen her best-performing pages herself, forever, without paying for edits.

### SEO engine
- **110+ page SEO footprint from two route files.** Category pages (`/med-spas`), city pages (`/chicago-il`), and category-in-city pages (`/med-spas/chicago-il`) render live from the database with structured data (LocalBusiness/ItemList), canonicals, cross-links, and an auto-generated sitemap. *Worth mentioning:* directories live or die on organic search; this is the growth engine, and it scales by adding data, not code.

### V2 readiness (built, not switched on)
- **Schema for reviews/ratings, paid tiers (free/premium/featured), provider analytics events, and favorites.** *Worth mentioning:* the $1,500 Quote B upgrade path is genuinely "flip on features," not "rebuild," exactly as sold on the call.

### Polish
- **Branded 404 page** (aubergine/teal, animated map-pin, clear paths back).
- **Supporting pages:** About, Contact, Pricing ("list free," honest premium-later note), Privacy, Terms (frames "Vetted" as a review process, not a guarantee — a real liability point in this space).
- **Categories index page** with live listing counts and per-category service lists.
- **Dawn's real logo everywhere:** header, footer, favicon (mark), white variant staged for dark surfaces.

### Audit hardening (2026-07-24, from the end-to-end audit)
- **Repo now rebuilds the real database.** The four migrations that existed only in the live project (auto profile on signup, V2 schema + CMS tables, reports, photo storage) are committed, so a fresh provision matches production.
- **Closed two privilege-escalation holes.** Database triggers now stop a signed-up user from making themselves admin and stop a provider from self-approving or self-awarding the ✓ Vetted badge via direct API calls. *Worth mentioning:* this is the trust model the whole brand rests on.
- **Search matches services, not just names.** "Lip filler" or "facial" now finds providers whose services match even when their business name doesn't.
- **Listing pages got per-page titles and LocalBusiness structured data** (a contractual SEO item), plus two XSS fixes (structured-data injection, unvalidated provider URLs) and a timeout on the geocoder call.
- **Marketing copy aligned with the Terms.** "Verify/checked by hand/safe" softened to review-process language so the homepage can't be quoted against the disclaimer.
- **Mobile hamburger nav** — the header no longer overflows on phones, the single most visible mobile break.
- **Accessibility pass:** visible keyboard focus rings everywhere, animations respect the OS reduced-motion setting, low-contrast placeholder text fixed.
- **Lead + report forms hardened against spam** (V1's killer): hidden honeypot field, server-side validation, and database rules that only accept submissions against approved listings.
- **Search now sorts purely by real miles**, matching the site's own promise — a featured listing 90 miles away no longer outranks a vetted one nearby.

---

## Still to do

- [x] **Apply migrations 0007 (RLS hardening) + 0008 (search text expansion) to the live Supabase project** — applied and verified 2026-07-24.
- [x] **Add `SUPABASE_SERVICE_ROLE_KEY`** to `.env.local` — done 2026-07-24. Still needs adding to Vercel env at deploy time.
- [ ] **Deploy** to production (Vercel + domain).
- [ ] **Pre-launch config:** point Supabase auth Site URL + redirect URLs and NEXT_PUBLIC_SITE_URL at the production domain (currently localhost).
- [ ] **Post-launch handoff:** transfer the Supabase project (currently $10/mo on Tariq's account) to Dawn's own Supabase organization so she owns her data and the bill. Remember to move the env keys on Vercel to the transferred project's values if they change.

---

## How to use this doc

Add one line per shippable thing, as it ships — not at the end of the week from memory. Keep the "why it's worth mentioning" part honest: if it's genuinely minor, say so briefly rather than overselling it. When it's time to update Dawn, this doubles as the source material for a status email or call.
