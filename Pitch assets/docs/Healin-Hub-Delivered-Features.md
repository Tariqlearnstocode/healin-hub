# The Healin Hub — Delivered Features

A complete list of what has been built and is live on the directory, organized by area. Everything below is done and working unless noted in the final "Before launch" section.

## Latest delivery update — 2026-08-17

- **Five-step provider onboarding.** New providers move through business basics (including phone and email), location/hours, services/pricing, photos, and review/submit, with save-and-resume draft support. Required fields identify and focus the exact missing field rather than showing a vague error. An address already accepted by the directory reuses its saved coordinates unless the provider changes the address.
- **Service-level pricing in the listing wizard.** Selecting a directory service immediately reveals its own optional price, price note, duration, and short description directly below it. Those entries power the public Services & pricing section while the curated service choices continue to power directory search.
- **Provider workspace redesign.** The empty dashboard is now a guided setup panel, the dashboard supports multiple businesses cleanly, and listing editing uses the same guided wizard rather than a disconnected legacy edit form.
- **Admin taxonomy desk.** Categories, services, and SEO cities now have focused admin workspaces. Admins can add and edit categories, manage services, edit city/state data, toggle featured cities, and safely re-geocode locations when their address changes.
- **Public FAQ + editable FAQ CMS.** `/faq` provides grouped public answers with filtering and FAQ structured data. Admins can edit, reorder, publish/unpublish, add, and delete FAQ entries from the admin console.
- **Category stock-photo library.** Photo-less listings now draw from five stable fallback images per category across all 11 categories, for 55 stored assets total. A provider's own photo always overrides the fallback, and every fallback remains explicitly labeled as stock imagery.
- **Admin services and storage tooling.** Services have their own admin workspace, and the existing storage tracker makes photo usage visible against the free-tier limit.

The FAQ topic seed migration (`0017_faq_topics.sql`) and provider draft migration (`20260817164248_listing_drafts.sql`) should be verified against the live Supabase project before relying on those database-backed features in production. The provider-wizard progress migration (`20260817213832_expand_listing_wizard_steps.sql`) was applied on 2026-08-17.

---

## 1. Foundation

- **Production database with real geo-search.** Every listing is placed on the map when it's created, and search returns providers within a set distance, sorted by actual measured miles. This is the core capability the previous version couldn't do reliably.
- **Free, cached geocoding.** Turning a city or zip into a map location uses a free service and caches the result, so there's no per-lookup bill and no API key that can silently break search.
- **Security enforced in the database.** Who can see and edit what is controlled at the data layer, not in a plugin: the public sees approved listings only, providers can edit only their own, and the admin sees everything.

## 2. Homepage & design direction

- **Trust-led homepage.** The homepage leads with what customers are actually afraid of — unlicensed injectors, credentials they can't verify — rather than describing the technology. The message is self-care you can actually trust.
- **Animated hero demo.** The homepage plays a scripted search, with pins dropping and mile badges across rotating cities, so a visitor sees the product working before reading a word.
- **An alternate homepage concept to choose from.** A second, editorial homepage direction ("The Standard") was built as a design option to compare against the live one. It leads with the fear, answers it with the vetting process step by step (we read the license, confirm the business, match claims to reality, and re-check later), then sorts visitors by who they are — first-time injectables, recovering out of town, medical weight loss. It reuses the same search and category links, and the live homepage is left untouched: it's there to help pick a direction, not to replace anything.

## 3. Search & discovery

- **Search that never lands blank.** No filters shows everyone nationwide; a category alone works, a location alone works, and both combine. Every path returns real providers with a national map fallback.
- **Real-distance results.** Results are sorted purely by actual miles from the searcher, so a nearby vetted provider always outranks a far-away featured one.
- **Adaptive location search.** The "where" box is a proper autocomplete: pick a city or zip and it does a distance/radius search with radius options; pick a whole state and it lists every provider in that state, sorted Featured → Vetted → City. The heading and map re-center to match.
- **Service-level autocomplete.** The "what" box suggests real categories and services as you type. Picking "Lymphatic Drainage Massage" returns providers who actually offer that service, not just name matches.
- **Search matches services, not just names.** "Lip filler" or "facial" finds providers whose service menu matches, even when their business name doesn't.
- **Live map with pins and mile badges.** Search results and every profile show a map with branded pins, the exact distance on each pin, and a "you are here" dot.
- **Exact pagination.** Results paginate with true totals ("Page X of Y").
- **Fully responsive.** Checked and fixed at phone width, where most traffic will be.

## 4. Provider profiles

- **Rich listing pages.** Photo gallery, a priced services menu, weekly hours table, social links, a map, call and website buttons, and a message form that routes leads to the provider.
- **Redesigned profile layout.** Breadcrumbs, a two-column desktop layout with a sticky "Get in touch" card, carded sections with icons, an adaptive photo gallery, and a "More in this category nearby" strip that cross-links other providers.
- **Per-listing services & pricing menu.** Providers list their actual services with optional prices, durations, and notes — rendered as a clean menu on the profile, separate from the search categories.
- **Photo galleries.** Up to five photos per listing, with the first as the search-result cover. Photos are automatically compressed and sized so a large phone photo doesn't bloat storage.
- **Social links across eight networks.** Instagram, Facebook, TikTok, YouTube, LinkedIn, X, Pinterest, and Yelp, each shown with its real brand icon.
- **Report a listing.** Every profile can be flagged (wrong info, closed, possibly unlicensed, spam), feeding the admin moderation queue.

## 5. Provider tools

- **Submit a listing.** A guided form places the business on the map automatically and enters it into the review queue. Providers pick their services, set hours, and add socials in the same form.
- **Address autocomplete.** A single search field fills street, city, state, and zip on selection and captures exact coordinates. Manual entry still works as a fallback.
- **Dropdown hours.** Each day uses an Open / Closed / By-appointment selector with time pickers instead of free-text.
- **Claim a listing.** Providers can claim a listing already in the directory, with evidence, and the admin approves the transfer.
- **Provider dashboard.** Manage and edit listings, see claim status, and an inbox of every client inquiry with tap-to-email or call. Includes an at-a-glance stats row (Listings, Live, In review, Inquiries).
- **Preview before it's live.** A submitted-but-not-yet-approved listing is visible only to its owner as a self-preview, with a status banner, so a new provider can see exactly what will publish. Previews can't be found publicly or indexed by Google.
- **Full account flows.** Email and password signup with confirmation, sign-in, and password reset (request link, email, set new password) — with no dead ends.
- **Email notifications.** New leads, claim decisions, and listing approvals/rejections email the provider directly. Leads go to the provider (reply goes straight to the client); approvals and claim outcomes notify the right person. (Turns on once the domain is verified — see final section.)

## 6. Admin control panel

- **Moderation.** Approval queue for new listings, claim resolution, and a report queue to resolve or dismiss — plus edit or remove any listing, with a restore option for removed ones.
- **Vetted, Featured, and tier control.** Toggle the Vetted badge and Featured status, and set any listing to Free / Premium / Featured by hand. Placement is entirely the admin's call, protected so only an admin can change it.
- **Listings table built for scale.** Filter by name, category, state, or status, sort on any column, paginated — all handled in the database so it stays fast at thousands of listings.
- **Taxonomy management.** Add, rename, and remove categories and the services under each, from the screen.
- **SEO location management.** Add a city and its landing pages plus sitemap entries publish instantly; remove one to unpublish. No developer required.
- **Editable page copy.** Override any landing page's title, description, intro, or body; blank fields fall back to the default template.
- **Editable FAQs.** Edit, reorder, publish/unpublish, add, and delete the FAQ questions and answers directly, with changes live immediately.
- **User management.** Promote or demote admins and see each user's listing count, with a guard preventing an admin from locking themselves out.
- **Storage tracker.** A live gauge of how full the photo storage is against the free-tier limit, with warning thresholds, so limits are visible before they cause problems.
- **Consistent, aligned dashboards.** Admin and provider screens share the site's layout, with real carded tables, status badges, and grouped filter toolbars.

## 7. SEO engine

- **110+ pages generated from the data.** Category pages, city pages, and category-in-a-city pages all render live from the directory.
- **Structured data on every page.** Each provider is described to Google as a real local business (the basis for rich results and map presence), with category and listing pages carrying the appropriate schema.
- **Automatic sitemap, canonicals, and cross-links.** New pages add themselves to the sitemap and link to related pages.
- **Grows by adding data, not code.** Every new provider and city adds more pages that can rank; scaling SEO just means growing the directory.

## 8. Sharing & branding

- **Branded share cards on every page.** Any link pasted into iMessage, Instagram, Facebook, or Slack unfurls as a designed 1200×630 card in the brand's colors and fonts, instead of a bare URL.
- **Profiles generate their own share card.** A provider's card shows their name, category, city, and a Vetted pill — so a provider sharing their own page markets the directory.
- **Real favicon and brand mark.** The logo appears in browser tabs, bookmarks, and link previews across the app.
- **Brand applied throughout.** The full logo and its light variant are used across header, footer, and dark surfaces.

## 9. Trust, security & anti-spam

- **Privilege-escalation holes closed.** Nobody can make themselves an admin or award themselves the Vetted badge through a back door — the database blocks it.
- **Spam-hardened forms.** Hidden honeypot fields, server-side validation, and rules that only accept submissions against approved listings — addressing the exact failure that took down the previous version.
- **Security fixes.** Cross-site-scripting holes closed (structured-data and provider-URL handling), only safe web links rendered, and a timeout on the location lookup.
- **Liability-aware copy.** "Vetted" is framed as a review process, not a guarantee, so the marketing can't be quoted against the disclaimer.

## 10. Accessibility & polish

- **Accessibility pass.** Visible keyboard focus states throughout, animations respect the operating system's reduced-motion setting, and low-contrast text fixed.
- **Mobile navigation.** A hamburger menu so the header no longer overflows on phones.
- **Loading states and optimized images.** Loading skeletons on every page and optimized imagery for speed.
- **Confirmation dialogs.** On deletes and role changes, to prevent accidents.
- **Branded 404 page.** An on-brand not-found page with clear paths back.
- **Supporting pages.** About, Contact, Pricing, Privacy, Terms, and a Categories index with live listing counts.

## 11. Live data

- **100 real Chicago-area providers seeded.** Ten businesses across each of ten categories, with names, addresses, phones, websites, socials, hours, and services — added as approved, not-vetted, so the Vetted badge stays a human decision.
- **The owner's own studio is live and real.** Chicago Dollz Experience carries its verified details and real studio photos, with Vetted and Featured badges.
- **Category stock photos as fallback.** Listings without their own photos show a licensed, clearly-labeled per-category stock image that disappears the moment a real photo is added.

## 12. Built to scale

- **Holds up at thousands of listings.** Admin queries and pagination are handled in the database, so the control panel stays fast well beyond today's size.
- **Photo storage stays near zero cost** even at tens of thousands of listings, because sizing discipline is built in.
- **Groundwork for the paid version is in place.** The schema already supports reviews and ratings, paid tiers (free / premium / featured), provider analytics, and favorites — future features switch on rather than getting rebuilt.

---

## Before the public launch

Everything above is delivered. These final steps mostly need decisions and a couple of accounts, and can be done together at the handoff:

- **Point the custom domain** (thehealinhub.com) at the site.
- **Turn on email notifications** by verifying the domain with the email service — the wiring is already built and waiting.
- **Create a few service accounts** in the owner's name so the business data and billing sit under her.
- **Finishing touches** (optional): swap in real studio photos and give the category list a final review.
