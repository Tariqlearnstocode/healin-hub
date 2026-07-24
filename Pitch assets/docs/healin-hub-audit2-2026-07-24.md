# The Healin Hub — End-to-End Audit v2

**Date:** 2026-07-24 (evening, after the v1 remediation) · **Method:** 8 parallel Sonnet 5 specialist agents, one per dimension, each with file:line evidence; schema claims live-verified against the Supabase project.
**Dimensions:** promised-features cross-reference · front-end design · copy · schema scalability · admin portal · auth + provider flows · visitor UX/UI · mobile responsiveness (live browser at 375px/768px).

---

## Verdict

**Every Quote A feature is delivered and verified in code**, and the v1 remediation held up under independent re-audit: the RLS privilege-escalation fixes, spam funnels, distance sort, mobile nav, and structured data were all re-verified as real by agents that did not know they were recent fixes. The build is demo-ready and close to handoff-ready.

The re-audit surfaced a **second, smaller ring of issues** — none are launch-blocking regressions of the earlier class, but four are worth fixing before Dawn's demo and the rest before handoff.

**Feature cross-reference result:** all Quote A / PRD-baseline items DELIVERED, with one soft gap — the homepage spec's "featured listings" element renders as category tiles + demo map, not a live data-backed listing strip. Operational items (Vercel deploy, Supabase transfer to Dawn's org) remain accurately tracked in delivered-features.md's "Still to do."

---

## 🔴 Fix before the demo

1. **Homepage over-claims universal credential review** (copy). Hero, trust strip, and footer strip say every provider's credentials are reviewed; About + Terms tie credential review to the ✓ Vetted tier only. Same legal-exposure class as the v1 finding, one level subtler. `page.tsx:64-67, 95-96, 234-235`.
2. **CMS long-form copy renders as raw Markdown** (design). `body_md` is wrapped in a `prose` class that does nothing — no typography plugin or Markdown parser is installed, so Dawn's admin-authored copy would display literal `##` and `**`. `[slug]/page.tsx:127`, `[slug]/[location]/page.tsx:133`.
3. **Vetted/Featured badges fracture across lines on mobile cards** (mobile, verified live at 375px). Inline pills wrap mid-badge into disconnected fragments. `ListingCard.tsx:25-37` — needs `whitespace-nowrap` / flex-row treatment.
4. **Open redirect via `next` param on login/signup** (auth). `redirect(String(formData.get("next")))` accepts absolute/protocol-relative URLs → post-login phishing vector. `auth.ts:13,19,29`. (The email callback route is safe.)

## 🟠 Fix before handoff

5. **Claim-hijack path** (auth + admin, two agents independently): `claimListing` doesn't check `owner_id` (UI-only guard), the admin claims queue doesn't show the current owner, and `resolveClaim` unconditionally overwrites `owner_id` — a bogus claim approved in good faith silently transfers a legitimate provider's listing. `listings.ts:149-166`, `admin.ts:176-201`, `admin/page.tsx:63`.
6. **Admin aggregate RPCs callable with the public anon key** (schema, live-verified): `admin_listing_states()` / `admin_owner_listing_counts()` rely incidentally on RLS. Revoke from anon/authenticated + `is_admin()` guard inside.
7. **`landing_pages` uniqueness doesn't actually hold** (schema): NULLs are distinct, so the UNIQUE constraint only protects combo rows; a duplicate category/location row makes `.maybeSingle()` throw → live 500 on that landing page. Replace with partial unique indexes per kind.
8. **Approving listings sight-unseen** (admin): the pending queue shows name/city/state only, with no link to full detail or photos, and no submitter contact info. Add a View link (admin already passes the edit-page ownership check) + surface email/phone.
9. **Search page a11y trio** (visitor UX): no `<h1>` on `/search`; unknown category slug silently zeroes results while the heading claims "All providers nationwide"; `ListingCard` cover photo has `alt=""`.
10. **`listing_services` missing a `service_id`-leading index** (schema) — the nationwide service-search join scans the table. One-line index.
11. **Status strings unvalidated in `setListingStatus`/`resolveReport`** (admin) — whitelist like `toggleListingFlag` does.
12. **Raw Supabase errors surfaced on signup** (auth) — "User already registered" enables email enumeration; map to friendly copy.

## 🟡 Backlog (post-handoff polish)

- **Copy:** "clients" in one Privacy sentence (rest says "consumers"); lowercase "botox" ×2; dashboard empty-state CTA missing "free"; `/submit` has no meta description; generic "Something went wrong" on lead/report/photo errors.
- **Design:** admin uses off-token `red-*` while forms use orchid (add danger tokens); admin table shows raw status text instead of the dashboard's badge; MapPanel "Loading map…" at 2.5:1 contrast; brand hex duplicated in 3 pin SVGs; outline-hover split (plum vs teal); emoji in trust strip; unused `public/` template assets; no pending state on submit buttons.
- **Auth/provider:** submit form loses all input on geocode failure; PhotoManager deletes storage before DB (broken refs) + orphans on partial failure + silently skips non-images; server-side validation gaps (state format, business email, lengths); re-geocode failure silently keeps stale coordinates.
- **Schema:** no listing dedup constraint (duplicates guaranteed at scale — trgm fuzzy check on submit); sitemap needs `generateSitemaps` sharding + `revalidate` before 50k listings; expanded search ILIKE chain should become a tsvector when radii widen; `listing_events` needs partitioning/rollup **before** analytics ships; reviews/favorites need denormalized aggregates before V2 rating-sort; lat/lng + state check constraints; storage object-count not capped by the photo trigger.
- **Visitor UX:** no Where-field autocomplete (home's CITIES list could seed it); map pins not keyboard-accessible; facet pills lack `aria-current` and counts; landing pages cap at 24 with no "see all N" link; combo page hides the map on zero results (search keeps it); empty state's "widen the search" isn't clickable.
- **Mobile:** dashboard listing rows lack `flex-wrap` (overflow risk with long names); photo-remove button is 24px and hover-revealed (touch-hostile); admin taxonomy inline forms cramped at phone width.
- **Features:** homepage "featured providers" strip (query + `ListingCard` already exist).

## What held up under independent re-audit

- All Quote A features present with evidence; delivered-features.md has no overclaims.
- Four-layer admin security (action guards, per-page checks, proxy gate, DB triggers) — called "genuinely strong belt-and-suspenders" by the admin agent, and the schema agent verified the row policies alone would have permitted both escalations the triggers now block.
- Geo core (GIST + `st_dwithin`), name trgm index, pagination pattern, leads/reports funnels, geocode-cache split, and the 0010 indexes all confirmed sound at 50k listings.
- Copy voice: em-dash discipline, pain-first hero, warm empty states, Terms/Privacy consistency.
- Design system: token discipline, radius scale, uniform success/empty states, focus-visible that survives `outline-none`, serif/sans discipline, reduced-motion.
- Mobile: every public page passes cleanly at 375px and 768px except the badge-wrap bug.

## Recommended order

1. Demo blockers (items 1–4) — copy fix, Markdown rendering, badge wrap, open redirect.
2. Handoff hardening (items 5–12) — claim flow, RPC grants, landing-page indexes, admin queue detail, search a11y, misc.
3. Backlog as capacity allows; schema items 6–7 of the backlog become **required** the moment analytics or reviews turn on.
