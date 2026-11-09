# docs/competitor-analysis.md — Competitor Research & Market Landscape

> **Fit / WearID — Universal Clothing Size Profile**  
> Comprehensive competitive audit of sizing platforms, browser extensions, marketplace algorithms, and global fit technology providers.

---

## 1. Executive Summary

Apparel sizing inconsistency is a multi-billion dollar problem in global e-commerce, with returns in Indian fashion e-commerce averaging 25–40%, of which 60–70% are attributed directly to incorrect size and poor fit. Consumers frequently vary between sizes (e.g., Size M in Brand A, Size L in Brand B, Size XL in Brand C) because brand size charts represent vanity sizing, disparate grading rules, or arbitrary marketing buckets rather than standardized human anthropometrics.

This audit evaluates the 5 key competitors and incumbent approaches operating in India and globally:
1. **StyleAi / SizeOS** (India, pre-launch 2026)
2. **FitCheck** (Chrome Extension for Indian Marketplaces)
3. **Myntra's In-House Fit & Sizing Engine**
4. **True Fit** (Global Market Leader)
5. **Sizebay** (Global Sizing SaaS)

---

## 2. Competitor Breakdown

### 2.1 StyleAi / SizeOS
- **Claim:** Promises a single universal profile interoperable across 85+ Indian and international brands (pre-launch 2026). Claims to map user dimensions to brand sizing automatically.
- **Actual Capability & Reality:**
  - Operates primarily on high-level heuristic mapping (interpolating user height/weight into standard size tags).
  - Pre-launch marketing claims 85+ brands, but data acquisition appears to rely on unverified crowd-sourced data and shallow scrapes of body-fit tables (Layer 2).
  - Lacks physical garment dimension specifications (Layer 3) and ease allowance modeling.
- **Where Data is Insufficient:**
  - Treats size tables as static and homogeneous; fails to account for fabric stretch (e.g., 100% rigid cotton vs. 2% elastane blend).
  - Ignores fit intent categories (e.g., boxy vs. slim fit within the same brand).
  - No provenance tracking or verifier workflow; risk of stale or hallucinated charts.
- **How Fit / WearID Differentiates:**
  - Enforces the 4 distinct data layers (Layer 1 Body, Layer 2 Brand Chart, Layer 3 Garment Spec, Layer 4 User Intent).
  - Does not interpolate or guess; reports data confidence honestly.
  - Transparent mathematical ease calculation instead of black-box prediction.

---

### 2.2 FitCheck (Browser Extension)
- **Claim:** In-browser Chrome extension that overlays real-time fit guidance on Myntra, AJIO, and H&M product pages by comparing user-inputted tape measurements against retailer page charts.
- **Actual Capability & Reality:**
  - Injects a DOM overlay script on e-commerce product pages.
  - Scrapes the visible modal table on the retailer product page.
  - Flags whether the user's measurement falls inside the minimum and maximum body ranges stated in the chart.
- **Where Data is Insufficient:**
  - Fragile DOM scraping: breaks whenever Myntra or AJIO update CSS class names or modal layouts.
  - Does not know finished garment specs (Layer 3); it only checks the retailer's generic size chart (Layer 2), which is often shared across dozens of completely different styles (e.g., an oversized drop-shoulder tee sharing the same chart as a slim polo).
  - Desktop Chrome extension only; fails on mobile Safari / Chrome where over 82% of Indian online fashion shopping occurs.
- **How Fit / WearID Differentiates:**
  - PWA-first architecture accessible on mobile devices (iOS/Android) with native tap targets.
  - Product-level garment measurements (Layer 3) rather than generic brand-level tables.
  - Explainable ease breakdowns that explicitly account for fabric elasticity and garment cut.

---

### 2.3 Myntra In-House Fit & Sizing Features
- **Claim:** Offers "Find your size" widgets, customer review sentiment tags (e.g., "78% customers say fits true to size"), and size recommendation quizzes.
- **Actual Capability & Reality:**
  - Relies heavily on purchase and return feedback loops from customer review forms.
  - Uses collaborative filtering: "Customers who bought size M kept it, while size L was returned."
  - Provides a generic measurement pop-up, but 90% of brand charts on Myntra are broad marketplace templates supplied by distributors rather than precise technical packs from garment manufacturers.
- **Where Data is Insufficient:**
  - Marketplace-supplied charts are notoriously inaccurate and copy-pasted across SKUs.
  - Collaborative filtering fails completely for new product drops, niche indie brands, or users with non-average body proportions (e.g., broad shoulders with slim waist).
  - Platform lock-in: Myntra recommendations do not travel with the user when shopping on AJIO, brand D2C websites (Snitch, Bewakoof), or physical stores.
- **How Fit / WearID Differentiates:**
  - Sovereign, portable identity that belongs to the user, not the retailer platform.
  - Deterministic physics & ease modeling that works on day one for any garment without needing thousands of historical purchase data points.
  - Multi-profile management (self, partner, parents) enabling gift buying.

---

### 2.4 True Fit (Global Leader)
- **Claim:** Connects 80M+ active members across hundreds of global brands via their Fashion Genome data collective.
- **Actual Capability & Reality:**
  - Uses machine learning models trained on millions of cross-brand transactions and returns.
  - Prompts users for reference garments: "What size do you wear in Levi's jeans and Nike tees?"
  - Computes statistical size affinity curves.
- **Where Data is Insufficient:**
  - Black-box statistical ML: cannot explain *why* it recommends Size L (e.g., does it have 10cm ease or 4cm ease?).
  - Extremely poor coverage of Indian domestic brands, ethnic wear (Kurtas, Sherwanis, Nehru jackets), and regional D2C labels.
  - Requires deep enterprise integration with retailer backend order systems; unusable by independent shoppers browsing unpartnered sites.
- **How Fit / WearID Differentiates:**
  - 100% explainable recommendation trees: shows exact ease deltas in centimeters and inches.
  - India-first focus with native support for Indian ethnic wear categories and domestic sizing standards.
  - Immediate utility without enterprise retailer lock-in.

---

### 2.5 Sizebay (Global 3D Virtual Fitting Room / SaaS)
- **Claim:** Virtual fitting room tool that models user body silhouettes using 4 inputs (height, weight, age, body shape) and recommends sizes across partner fashion stores.
- **Actual Capability & Reality:**
  - Employs statistical anthropometric tables based on Caucasian/Western body shape distributions.
  - Generates a visual 2D avatar showing tension zones.
- **Where Data is Insufficient:**
  - Weight and age are unreliable proxies for anatomical dimensions; two individuals with identical height and weight can have vastly different chest-to-waist ratios.
  - Anthropometric distribution models do not fit the Indian population, whose torso length, shoulder span, and waist ratios diverge significantly from Western cohorts.
  - High friction and cognitive load during onboarding.
- **How Fit / WearID Differentiates:**
  - Rejects weight as the primary sizing determinant; prioritizes real anatomical benchmarks (tape, well-fitting garment anchor, or AR/paper trace).
  - Based on empirical Indian anthropometric data (NIFT INDIAsize baseline).
  - Editorial, distraction-free UI designed for speed and clarity.

---

## 3. Comparative Matrix

| Feature / Dimension | Fit / WearID | StyleAi / SizeOS | FitCheck | Myntra Fit | True Fit | Sizebay |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Data Layer Segregation (1–4)** | **Yes (Strict)** | No | No | No | No | Partial |
| **Garment Specs (Layer 3)** | **Yes** | No | No | No | Sometimes | Rarely |
| **Explainable Ease Trees** | **Yes (Exact cm)**| No | Binary (In/Out) | No (Rating only)| No (Black box) | Visual only |
| **India-First / Ethnic Wear** | **Yes (Native)** | Claimed | No | Partial | No | No |
| **Mobile PWA First** | **Yes** | Web app | Desktop only | App only | Embed only | Embed only |
| **Multi-Profile (Gift / Family)**| **Yes (Up to 3)**| No | No | No | No | No |
| **Tailor / Export Feature** | **Yes (WhatsApp/QR)**| No | No | No | No | No |
| **Zero Machine Learning Blackbox**| **Yes (Deterministic)**| Unclear | Yes (Rules) | No (ML) | No (ML) | No (Statistical)|

---

## 4. Key Takeaways & Strategic Moat
1. **Separation of the 4 Data Layers** is the single greatest competitive advantage. No competitor cleanly separates anatomical body dimensions from finished textile specifications.
2. **Deterministic Ease Engine** builds user trust because every recommendation includes clear, verifiable rationale rather than opaque probabilities.
3. **Sovereignty & Portability** ensures that users curate their fit identity once and carry it to every brand, tailor, and gift recipient.
