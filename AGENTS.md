# AGENTS.md — Operational Rules & Invariants for WearID

> **WearID** — *Your clothing identity, everywhere.*  
> Universal clothing identity, deterministic body-to-garment fitting, and sovereign measurement portability.

---

## 1. Core Operating Principles & Hard Invariants

Every agent (and subagent) operating within the WearID codebase must unconditionally adhere to these 10 invariants. Any code change, automated task, or architectural refactor that violates any of these principles must be aborted immediately.

### 1. Never Invent Clothing Measurements or Brand Size Charts
- **Rule:** Under no circumstance should an agent generate, estimate, or hallucinate size tables, grading rules, or garment dimensions.
- **Enforcement:** If brand data or size charts are unavailable, the system must report a state of missing or pending data (`size_chart_unavailable`), prompt for verified inputs, or gracefully degrade to manual input. Never synthesize plausible-looking numbers.

### 2. Every External Measurement Must Retain Its Source
- **Rule:** Every ingested measurement, brand sizing table, and dimension entry must retain end-to-end provenance.
- **Enforcement:** Schemas must enforce metadata fields including:
  - `source_type`: `brand_official`, `retailer_api`, `curated_dataset`, `user_measured_physical`, or `contributor_verified`.
  - `source_uri`: Direct URL, API endpoint, or publication archive.
  - `retrieved_at`: ISO 8601 timestamp.
  - `verification_hash`: Content checksum/signature.
  - `license_or_permission`: Proof of authorized data acquisition.

### 3. Never Mix Body Measurements with Garment Dimensions
- **Rule:** Body anatomy measurements and finished garment dimensions are strictly distinct domains. They must never share interchangeable database columns, types, or DTO properties.
- **Enforcement:**
  - **Body Measurements** (e.g., `AnatomicalProfile`): Biometric human dimensions (chest circumference, natural waist circumference, high hip, inseam to floor, neck circumference, sleeve span).
  - **Garment Dimensions** (e.g., `GarmentDimensions`): Physical textile dimensions laid flat or finished garment 3D specs (pit-to-pit flat, half-waist, collar-to-hem length, sleeve crown to cuff, rise, thigh flat).
  - Bridges between the two must explicitly specify **ease allowance** (`wearing_ease`, `design_ease`, `fabric_stretch_factor`).

### 4. All Stored Measurements Must Use Canonical Units
- **Rule:** All stored dimensions, thresholds, and calculations must use a single canonical unit of measure internally.
- **Enforcement:**
  - Canonical unit for length/distance: **Millimeters (`mm`)** stored as non-negative integers or high-precision fixed decimals.
  - Canonical unit for weight/mass: **Grams (`g`)**.
  - All imperial units (inches, lbs) or colloquial metric units (cm, m) must only exist as converted projections at the user presentation layer or external input ingestion boundaries.
  - Rounding errors must never propagate to the canonical storage layer.

### 5. Do Not Publish Unverified Contributor Submissions
- **Rule:** Community-submitted garments, brand updates, and peer-measured items must remain in an isolated, non-public staging state until verified.
- **Enforcement:**
  - Status progression: `draft` -> `pending_review` -> `multi_source_corroborated` -> `verified_published`.
  - Size recommendation engines must only ingest items with status `verified_published` unless explicitly running in a user sandbox mode.

### 6. Never Bypass a Website's Access Controls
- **Rule:** Data extraction must strictly respect network boundaries, access restrictions, robots policies, and terms of service.
- **Enforcement:**
  - Never bypass paywalls, bot-detection barriers, Cloudflare turnstiles, CAPTCHAs, or authentication checks.
  - No scraping of gated user portals or undocumented private endpoints without explicit OAuth/API authorization.
  - Always prefer official APIs, merchant feeds, or user-consented direct imports.

### 7. Keep Users' Profiles Private by Default
- **Rule:** Human body dimensions, fit profiles, body scans, and sizing identities are sensitive personal biometrics.
- **Enforcement:**
  - Default visibility: `private` (accessible strictly by the authenticated owner).
  - WearID tokens / portability keys shared with third-party retailers must share only deterministic sizing matches (`"Size L fits best (96% fit confidence)"`), never raw anatomical measurements, unless the user explicitly grants granular, time-bound consent.
  - All PII and biometric attributes must support cryptographic pseudonymization and full export/purge capabilities (GDPR/CCPA compliance).

### 8. Every Recommendation Must Be Explainable
- **Rule:** WearID will never produce black-box or unsubstantiated size recommendations.
- **Enforcement:**
  - Every sizing recommendation DTO must include an `ExplanationTree`:
    - Expected ease vs. target ease (e.g., *“Pit-to-pit: 560mm gives +80mm chest ease; your preference is relaxed (+60mm to +100mm)”*).
    - Fabric tension / elasticity influence (e.g., *“100% rigid cotton with 0% elastane requires at least 40mm ease over waist”*).
    - Historical calibration notes (e.g., *“Calibrated against your validated Levi’s 501 32x32 fit”*).

### 9. Never Fabricate User Reviews, Performance Statistics or Brand Partnerships
- **Rule:** Synthetic or mock credibility indicators are prohibited in test environments that touch live configurations, seed scripts destined for staging/production, or client-facing marketing materials.
- **Enforcement:**
  - Zero fabricated partner logos, fake testimonials, or artificial confidence inflation.
  - Mock datasets must be explicitly flagged with `is_synthetic: true` and isolated from production storage schemas.

### 10. Write Tests for Every Important Measurement and Sizing Calculation
- **Rule:** Sizing and mathematical logic without automated tests is considered broken code.
- **Enforcement:**
  - Mandatory unit tests for all unit conversions, ease addition/subtraction, grade rule extrapolations, and edge-case boundary conditions (e.g., athletic proportions, between-size boundaries, shrinkage rates).
  - Every pull request / agent task touching calculation code must verify against the [Verification & Test Matrix](file:///e:/Projects/WearID/tests.md).

---

## 2. Agent Interaction & Execution Guidelines

1. **Verify Before Declaring Done:** Use the [Verification & Test Matrix](file:///e:/Projects/WearID/tests.md) to validate implementations. Running unit tests and lint checks is required before considering a task complete.
2. **Consult Architecture & Roadmap:** Refer to [architecture.md](file:///e:/Projects/WearID/architecture.md) for data flow and [roadmap.md](file:///e:/Projects/WearID/roadmap.md) for milestone priorities.
3. **Environment Isolation:** Use [env.template.md](file:///e:/Projects/WearID/env.template.md) for environment configuration. Never leak real API tokens or private credentials.
4. **Follow Agent Personas:** Operate within the bounded roles described in [system.md](file:///e:/Projects/WearID/system.md) and [agents.json](file:///e:/Projects/WearID/agents.json).
5. **Instant Session Wakeup:** When a user opens this workspace with any Antigravity account and sends a trigger prompt (e.g., `scan`, `boot`, `sync`, `resume`, or `scan the project`), immediately follow the protocol in [BOOTSTRAP.md](file:///e:/Projects/WearID/BOOTSTRAP.md) to inspect codebase state, identify the current milestone in [roadmap.md](file:///e:/Projects/WearID/roadmap.md), and resume execution without friction.

---

## 3. Session Bootstrapping & Account Switch Protocol

If the user types:
- `scan`
- `boot`
- `sync`
- `resume`
- `scan the file` or `scan the project`

The agent must immediately execute the **5-Step Autonomous Reconnaissance Protocol** in [BOOTSTRAP.md](file:///e:/Projects/WearID/BOOTSTRAP.md):
1. Ingest core governance (`AGENTS.md`, `roadmap.md`, `architecture.md`, `tests.md`).
2. Run discovery (`git status`, file tree).
3. Run baseline verification checks (`npm test`).
4. Find the first unchecked item (`- [ ]`) in `roadmap.md`.
5. Deliver a concise state briefing and proceed directly with that next task slice.

