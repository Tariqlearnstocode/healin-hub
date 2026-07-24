# The Healin Hub — Rebuild Proposal

A single-page pitch site for C4 Growth Solutions' proposal to rebuild **The Healin Hub**
directory, prepared for Dawn Foster. Built on the **First Light** brand system.

## Run it

Any static server works. The `<image-slot>` component fetches a same-origin sidecar,
so open it over HTTP rather than `file://`:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Structure

```
index.html              The pitch page
styles.css              Entry stylesheet (imports the three token files)
tokens/                 Design tokens — colors, typography, spacing/radii/elevation
brand-guide/            First Light document layout (.g-section, .wrap, mocks, etc.)
css/components.css      Reusable product components (buttons, fields, badges, cards…)
css/pitch.css           Pitch-specific layout (hero, quotes, demo, profile, CTA band)
js/pitch-demo.js        Live geo-search demo — real haversine distance, city + radius
image-slot.js           Drag-and-drop image placeholders (headshot, spa gallery)
assets/                 Logos (ink/white) and Clarence's headshot
docs/                   Source reference docs (PRD, features, rebuild notes)
```

## Notes

- **Fonts** (Instrument Serif + Figtree) and **Lucide icons** load from CDNs, so the
  page needs network access to render exactly as designed.
- The **search demo** computes real miles from each provider's coordinates to the
  selected city center and re-sorts/re-pins on every click. It defaults to Chicago, IL,
  where Dawn's own med spa (Chicago Dollz Experience) appears as a ✓ Vetted result.
- `<image-slot>` drop-zones (Clarence's headshot, the provider photo gallery) are
  fillable inside the Claude Design runtime; elsewhere they render read-only, showing
  the `src` image or the placeholder caption.
