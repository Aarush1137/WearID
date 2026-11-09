# FIT — UNIVERSAL CLOTHING SIZE PROFILE
## Master Build Brief · India-First · PWA · Phase-by-Phase

---

## ROLE

Act as a complete senior product, design, data and engineering team.
Your responsibilities include product management, technical architecture, full-stack development,
fashion measurement research, data engineering, database design, user experience, quality
assurance and security. We are building a serious, scalable product that solves inconsistent
clothing sizes across fashion brands. Do not treat this as a generic AI application or a simple
size-chart website.

---

## PRODUCT VISION

People have different clothing sizes across different brands despite having the same body.
A person may wear M in one brand, L in another and XL in a third.
The long-term ambition is to build a universal clothing measurement profile and apparel sizing
infrastructure — allowing people to find their correct size across any brand, product, retailer
and country.

Working tagline: ONE PROFILE. EVERY BRAND. A BETTER FIT.

Initial market: INDIA.
First release: A responsive Progressive Web App (installable via Chrome/Safari).
Mobile applications, browser extensions and retailer integrations come in later phases.

---

## PRODUCT RULES (non-negotiable — enforce before every decision)

1. Never invent, interpolate or estimate clothing measurements. If data is missing, say so.
2. Never mix body measurements with garment measurements. They are separate things.
3. The four data layers must never be conflated:
   - Layer 1 — User's actual body measurements
   - Layer 2 — Brand's body-fit chart (what body dimensions a size label fits)
   - Layer 3 — Physical garment dimensions (chest flat, shoulder seam to seam, etc.)
   - Layer 4 — User's personal fit preference per clothing category
4. Every measurement imported from any source must retain its provenance.
5. Recommendations must be explainable. Every result must show why it was suggested.
6. Insufficient or low-confidence data must be reported honestly. Do not manufacture a result.
7. User profiles are private by default. No measurements in URLs, logs or analytics events.
8. Do not bypass logins, CAPTCHAs or anti-bot controls when collecting brand data.
9. Do not publish any unverified community submission to the trusted catalog.
10. All role permissions must be enforced server-side. Never trust client-side role checks.
11. Do not introduce machine learning before sufficient validated real-world data exists.
12. Do not introduce expensive infrastructure until usage data justifies it.
13. Test every sizing calculation. Recommendation errors are the core product failure mode.
14. The design system is defined in /styles/tokens.css. No new colors or type sizes outside it.

---

## PHASE 0 — RESEARCH AND ARCHITECTURE

Before writing any application code, complete the following research tasks.
Save findings in the docs/ folder.

### 0.1 Competitor Research

Investigate and document at minimum:
- StyleAi / SizeOS (claims universal profile across 85+ Indian + international brands, pre-launch 2026)
- FitCheck (Chrome extension, reads Myntra/AJIO/H&M charts vs personal measurements)
- Myntra's own fit recommendation features
- True Fit (global)
- Sizebay (global)
- Any other relevant fit/sizing products found during research

For each competitor document:
- What they claim to do
- What they actually do (based on available evidence)
- Where their data is likely insufficient
- Where we can do better

Save as: docs/competitor-analysis.md

### 0.2 Indian Sizing Research

Research and document:
- NIFT INDIAsize programme — body measurement study of 26,324 individuals
- INDIAsize body size charts (14 male, 13 female)
- IN Tag apparel-size identification system
- How Indian brands currently approach sizing
- Differences between Indian, UK, EU and US sizing systems
- INDIAsize portal: available from 2 January 2026
- Licensing and permitted use: CHECK before importing any data
- NIFT collaboration potential

Save as: docs/indian-sizing-research.md

### 0.3 Product Opportunities

Synthesize competitor gaps, Indian market conditions and missing infrastructure into:
- Where we can differentiate (data quality, openness, transparency, community)
- What the minimum credible database looks like for Phase 1
- Which 8 brands to prioritize for the pilot based on data access audit
- Whether INDIAsize can legally be used as our anthropometric baseline

Save as: docs/product-opportunities.md

### 0.4 Brand Data Access Audit

For each of the 8 pilot brands, document:
- Does the brand have a public size guide page?
- Is the size chart in HTML (parseable), PDF (needs OCR), or image (needs vision extraction)?
- Does robots.txt permit crawling?
- Are there terms of service restrictions on automated collection?
- Is garment measurement data (Layer 3) available, or only body-fit charts (Layer 2)?

This audit result determines how the scraping service is built.
Record output as: docs/brand-data-audit.md

### 0.5 Architecture and Schema

Produce before implementation:
- Full database schema with all tables, columns and relationships
- API route map
- Component hierarchy
- Measurement data flow diagram (Layer 1 → 4)
- Recommendation engine pseudocode
- Admin workflow for data verification queue

---

## PLATFORM: PWA-FIRST

Build as a Next.js Progressive Web App. The website must be installable from Chrome on Android
and Safari on iOS. It must feel native after installation.

### Required PWA setup

Web App Manifest (/public/manifest.json):
```json
{
  "name": "Fit — Universal Size Profile",
  "short_name": "Fit",
  "description": "Your clothing size across every brand. One profile.",
  "start_url": "/app",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#425B48",
  "background_color": "#F5F3ED",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512",
      "type": "image/png", "purpose": "maskable" }
  ],
  "categories": ["lifestyle", "shopping"],
  "screenshots": [
    { "src": "/screenshots/home.png", "sizes": "390x844", "type": "image/png",
      "form_factor": "narrow" }
  ]
}
```

Service worker (via Workbox):
- Cache strategy: Network-first for /api/ routes, Cache-first for static assets
- Offline fallback: cached profile data available, search shows "offline" state gracefully
- Background sync: queue feedback submissions when offline

iOS-specific meta tags (in _document.tsx or layout.tsx):
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Fit" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
```

Install prompt UX:
- Intercept `beforeinstallprompt` event
- Never show on first visit
- Show a subtle dismissible banner after onboarding is complete
- Track install rate in analytics (anonymized event only — no measurements)

Mobile UX requirements:
- 44px minimum tap target on every interactive element
- No interactions that depend on hover state
- Safe area insets: respect CSS env(safe-area-inset-*) for iPhone notch and home indicator
- Pull-to-refresh disabled on search results (use explicit refresh)
- Smooth scroll everywhere. No layout shift on font load.

---

## TECH STACK

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | SSR for brand/product pages |
| Styling | Tailwind CSS + CSS custom properties | Design tokens in globals.css |
| Component primitives | shadcn/ui (Radix UI) | Copy-owned, fully customizable |
| Forms | React Hook Form + Zod | Type-safe form validation |
| Database | Supabase PostgreSQL | Row Level Security on all user tables |
| Auth | Supabase Auth | Email + Google OAuth |
| File storage | Supabase Storage | Garment photos, source documents, PDFs |
| State | Zustand | Client-side profile/session state |
| Data fetching | TanStack Query | Server state, caching, background refetch |
| Background workers | Python service on Railway | Scraping, ingestion, scheduled jobs |
| Scraping | Python + Playwright + BeautifulSoup | JavaScript-rendered brand sites |
| PDF extraction | pdfplumber | Size charts in PDF |
| Image/OCR | GPT-4o Vision + Tesseract fallback | Image-based size charts (human review required) |
| Data validation | Python + Pydantic | Ingestion schema validation |
| Testing | Vitest (unit) + Playwright (e2e) | |
| Frontend hosting | Vercel | |
| Analytics | PostHog | Privacy-respecting, no PII in events |
| Error tracking | Sentry | |
| Email | Resend | Transactional only |

---

## DESIGN SYSTEM

### Philosophy

Editorial fashion-tech. Minimal, warm, precise.
Think: Everlane meets Notion meets early Apple.
This must look like a real fashion-technology product built by designers who care about clothing,
not a generated SaaS dashboard or a neon AI app.
Every screen should feel deliberate — nothing accidental, nothing decorative without purpose.

### Color Palette

Define all colors as CSS custom properties in /styles/tokens.css.

```css
:root {
  /* ─── Surfaces ─── */
  --bg-base:          #F5F3ED;  /* Warm ivory — page background */
  --bg-surface:       #FFFFFF;  /* Card, panel, modal surface */
  --bg-elevated:      #EFEDE6;  /* Slightly deeper surface, sidebar */
  --bg-accent-subtle: #DDE4D9;  /* Sage — tinted accent background */

  /* ─── Text ─── */
  --text-primary:   #242821;    /* Ink — all body and heading text */
  --text-secondary: #73776F;    /* Muted — labels, secondary copy */
  --text-tertiary:  #A5A9A1;    /* Placeholder, disabled, hint text */
  --text-on-accent: #FFFFFF;    /* Text on dark accent surfaces */
  --text-link:      #425B48;    /* Link text */

  /* ─── Accent (Forest Green) ─── */
  --accent:         #425B48;    /* Primary action, CTA, focus ring */
  --accent-hover:   #354A3A;    /* Hover state for accent elements */
  --accent-active:  #2C3D30;    /* Pressed state */
  --accent-subtle:  #DDE4D9;    /* Tinted background, tag fill */

  /* ─── Terracotta (warm highlight) ─── */
  --terracotta:        #C38367; /* Badges, warm accent, alt CTA */
  --terracotta-hover:  #B0704F;
  --terracotta-subtle: #F5EAE3; /* Terracotta tinted background */

  /* ─── Semantic ─── */
  --success:          #2D6A4F;
  --success-subtle:   #E8F3ED;
  --warning:          #B5621A;
  --warning-subtle:   #FAF0E6;
  --destructive:      #9B2335;
  --destructive-subtle: #FAEAEC;
  --info:             #2C567A;
  --info-subtle:      #E8F1F8;

  /* ─── Confidence indicators ─── */
  --confidence-high:   #2D6A4F;  /* > 85% */
  --confidence-medium: #B5621A;  /* 65–85% */
  --confidence-low:    #C38367;  /* 40–65% — rough estimate */
  --confidence-none:   #73776F;  /* < 40% — do not show recommendation */

  /* ─── Borders ─── */
  --border:       #E6E2D9;   /* Default divider and card border */
  --border-strong: #C8C4BB;  /* Stronger borders, input outlines */
  --border-focus: #425B48;   /* Focus ring (2px, 40% opacity) */

  /* ─── Shadows ─── */
  --shadow-xs: 0 1px 2px rgba(36,40,33,0.04);
  --shadow-sm: 0 1px 4px rgba(36,40,33,0.06);
  --shadow-md: 0 4px 12px rgba(36,40,33,0.08);
  --shadow-lg: 0 8px 24px rgba(36,40,33,0.10);
}
```

### Typography

Load from Google Fonts (or self-host for performance):
- DM Sans: weights 300, 400, 500, 600
- DM Serif Display: weight 400 (editorial headlines only — use sparingly)

```css
:root {
  --font-sans:    'DM Sans', -apple-system, system-ui, sans-serif;
  --font-display: 'DM Serif Display', Georgia, serif;

  /* Type scale */
  --text-2xs: 0.625rem;  /* 10px — micro labels */
  --text-xs:  0.75rem;   /* 12px — caps labels, tags */
  --text-sm:  0.875rem;  /* 14px — secondary body, captions */
  --text-base: 1rem;     /* 16px — body text */
  --text-lg:  1.125rem;  /* 18px — large body */
  --text-xl:  1.25rem;   /* 20px — card titles, section intro */
  --text-2xl: 1.5rem;    /* 24px — page sub-headings */
  --text-3xl: 1.875rem;  /* 30px — page headings */
  --text-4xl: 2.25rem;   /* 36px — hero headings */
  --text-5xl: 3rem;      /* 48px — DM Serif Display only */
  --text-6xl: 3.75rem;   /* 60px — homepage hero, DM Serif Display */

  /* Line heights */
  --leading-tight:  1.25;
  --leading-snug:   1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose:  1.75;

  /* Letter spacing */
  --tracking-tight:  -0.02em;
  --tracking-normal:  0em;
  --tracking-wide:    0.04em;  /* Uppercase labels only */
  --tracking-wider:   0.08em;
}
```

### Components specification

Cards:
```
border: 1px solid var(--border)
border-radius: 10px
background: var(--bg-surface)
box-shadow: var(--shadow-sm)
padding: 20px (desktop), 16px (mobile)
hover: translateY(-2px) + box-shadow: var(--shadow-md)
```

Buttons:
```
min-height: 44px
border-radius: 8px
font: DM Sans 500, 15px
padding: 10px 20px

Primary: bg --accent, text white, hover bg --accent-hover
Secondary: bg white, border 1.5px --accent, text --accent
Ghost: bg transparent, text --text-primary, hover bg --bg-elevated
Destructive: bg --destructive, text white
Disabled: opacity 0.45, cursor not-allowed
```

Inputs and selects:
```
height: 44px (single line), auto (textarea)
border: 1.5px solid --border-strong
border-radius: 8px
font: DM Sans 400, 15px, --text-primary
background: --bg-surface
padding: 0 14px
focus: border-color --accent, outline 3px solid rgba(66,91,72,0.15)
error: border-color --destructive
placeholder: --text-tertiary
```

Measurement confidence dots:
```
width: 8px, height: 8px, border-radius: 50%
High:   background --confidence-high
Medium: background --confidence-medium
Low:    background --confidence-low
None:   background --confidence-none
```

Tags and badges:
```
border-radius: 100px (pill)
font: DM Sans 500, 12px, --tracking-wide, uppercase
padding: 3px 10px
Success: bg --success-subtle, text --success
Warning: bg --warning-subtle, text --warning
Info: bg --info-subtle, text --info
Neutral: bg --bg-elevated, text --text-secondary
Terracotta: bg --terracotta-subtle, text --terracotta
```

---

## DATABASE SCHEMA SUMMARY

- `users`: Core authentication & preferred unit (`cm`, `in`), role enforcement
- `profiles`: Multi-profile management (`self`, `partner`, `parent`, etc.) with consent tracking
- `body_measurements`: Layer 1 append-only history with provenance
- `fit_preferences`: Layer 4 category-specific fit intent (`slim`, `regular`, `relaxed`, `oversized`)
- `brands`: Directory of brands with verification and crawl statuses
- `brand_size_charts`: Layer 2 body-fit charts
- `products`: Product catalog with fabric specs and category
- `garment_measurements`: Layer 3 flat/physical textile specs
- `reference_garments`: User-owned benchmark calibration items
- `community_contributions`: Staged unverified submissions with reputation tracking
- `community_fit_feedback`: Real-world fit feedback
- `size_recommendations`: Cached recommendation history with explanation trees
- `indiasize_reference`: Read-only NIFT anthropometric baseline with `CHECK (false)` until licensed

---

## RECOMMENDATION ENGINE SUMMARY

1. **Layer 3 Preferred:** If physical garment measurements exist, use Layer 3; fallback to Layer 2 body-fit charts; otherwise report insufficient data.
2. **Measurement Weights by Category:** E.g., T-shirt/polo (Chest 40%, Shoulder 35%, Length 15%, Sleeve 10%).
3. **Ease Calculation:** $\text{Ease} = \text{Garment Chest} - \text{Body Chest}$.
   - Slim: 4–8 cm
   - Regular: 8–14 cm
   - Relaxed: 14–20 cm
   - Oversized: 20–30 cm
   - Gaussian score centered on ideal ease midpoint.
4. **Reference Garment Calibration:** Adjust score $\pm 0.15$ based on user-owned reference garments.
5. **Borderline Detection:** If $|\text{score}_0 - \text{score}_1| < 0.08$, flag borderline and show tradeoff.
6. **Confidence Scoring:** High (>0.85), Medium (0.65–0.85), Low (0.40–0.65), Insufficient (<0.40).
7. **Explainability:** Per-dimension breakdown with ease delta and rationale.

---

## PHASE 0 DELIVERABLES CHECKLIST
- `docs/competitor-analysis.md`
- `docs/indian-sizing-research.md`
- `docs/product-opportunities.md`
- `docs/brand-data-audit.md`
- Architecture, schema, and API route maps
- Design system token integration in `/styles/tokens.css`
