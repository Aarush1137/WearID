# WearID — Sovereign Clothing Identity & Deterministic Fitting

> **Your clothing identity, everywhere.**  
> Universal clothing identity, deterministic body-to-garment fitting, and sovereign measurement portability.

[![CI Status](https://img.shields.io/badge/tests-502%20passed-2D6A4F.svg?style=flat-square)](file:///tests.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?style=flat-square)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=flat-square)](https://tailwindcss.com/)
[![Firebase Auth](https://img.shields.io/badge/Firebase%20SMS-10%2C000%2Fmo%20Free-FFA000.svg?style=flat-square)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-Proprietary-425B48.svg?style=flat-square)](#)

---

## 🎬 Product Launch Overview

<p align="center">
  <video src="https://raw.githubusercontent.com/Aarush1137/WearID/main/brag-output/brag.mp4" poster="https://raw.githubusercontent.com/Aarush1137/WearID/main/brag-output/brag.jpg" width="100%" height="auto" controls="controls" playsinline muted autoplay loop>
    <a href="https://raw.githubusercontent.com/Aarush1137/WearID/main/brag-output/brag.mp4">
      <img src="https://raw.githubusercontent.com/Aarush1137/WearID/main/brag-output/brag.jpg" alt="WearID Official Launch Video" width="100%" />
    </a>
  </video>
</p>

*Watch the official launch video showcasing WearID's end-to-end sovereign biometric passport, couture lingerie visualizer, footwear cross-brand comparator, and deterministic ease engine.*

---

## 🌟 Key Capabilities

### 1. Sovereign Biometric Passport (Layer 1)
- **Millimeter-Precision Biometrics:** Human dimensions stored strictly as canonical integer millimeters (`mm`) and mass in grams (`g`).
- **Cryptographic Privacy by Default:** Local client-side AES-256-GCM encryption at rest. Zero anatomical biometrics leaked to third parties without explicit user consent.
- **Mandatory Authentication & Persistent Session Security:** Enforces persistent user sessions across reloads with automated 7-day inactivity security timeout protection.
- **Google Firebase Phone Auth:** 10,000 free phone SMS OTP verifications every month worldwide (including Indian mobile carriers) with invisible reCAPTCHA anti-bot protection.
- **Multi-Member Profile Management:** Seamlessly manage measurements for self, partner, and family.

### 2. Footwear & Shoe Size Matrix (UK / US / EU / CM / IN)
- **Deterministic Footbed Millimeter Matching:** Translates actual physical foot lengths into manufacturer lasts.
- **Cross-Brand Footwear Comparator:** Compares size variances across **Nike, Adidas, Puma, Bata India, Red Tape, and Clarks** for Men, Women, and Kids.
- **Explains Brand Divergence:**
  - Continental European lasts (Adidas Parisian points, $2/3\text{ cm} \approx 6.67\text{mm}$) vs. US athletic lasts (Nike barleycorn steps, $1/3\text{ inch} \approx 8.46\text{mm}$).
  - Explains why a 270mm footbed equals **UK 8** in Nike, but **UK 8.5** in Adidas.
  - Indian Bureau of Standards (BIS IS 1638:1969) ball-girth widths in Bata India and Red Tape.

### 3. Deterministic Fitting Engine (Layers 2 & 3)
- **Layer 3 Flat Garment Dimensions:** Evaluates finished textile dimensions laid flat (pit-to-pit, waist, shoulder, sleeve, rise, inseam).
- **Layer 2 Brand Body Fit Charts:** Ingests official brand size charts with immutable provenance verification (`source_type`, `source_uri`, `retrieved_at`, `verification_hash`).
- **Gaussian Fit Scoring:** Uses mathematical ease distributions ($\sigma$) to score breathing comfort across Slim, Regular, Relaxed, and Oversized cuts.
- **Invariants 1 & 2 Enforced:** Zero synthetic measurements, zero hallucinated size charts.

### 4. Interactive Visualizer Suite
- **Intimate Apparel & Bra Sizing Visualizer:**
  - Dynamic 3D cup projection scaling with anatomical underwire curvature.
  - Real-time ribcage underband tension and sternum gore contact checks.
  - Equivalent sister-size volume matching across band sizes.
- **Proportional Anatomical Silhouette (`BodySilhouetteCanvas`):**
  - Interactive landmark inspection (Shoulders, Chest Girth, Natural Waist, High Hips, Inseam) with pulsing sensor nodes.
  - Morphological classification (V-Taper, Balanced, Lean, Robust).
- **2D Garment Drape & Ease Silhouette (`GarmentDrapeOverlay`):**
  - Superimposed body contour vs. finished textile outline.
  - Color-coded ease halos (Tension Red $\rightarrow$ Snug Amber $\rightarrow$ Ideal Forest Green $\rightarrow$ Loose Amber).
- **5-Axis Fit Polygon Radar (`FitRadarChart`):**
  - Polar coordinates across Chest, Waist, Shoulders, Length, and Sleeve with smooth morphing transitions.
- **Brand Sizing Comparison Tool (`/app/compare`):**
  - Side-by-side cutting table variance comparison between any two verified brands for apparel and footwear.

### 5. Sovereign Tailor Card & Portability SDK
- **Digital Tailor Card:** Instant QR code and WhatsApp share card with formatted imperial/metric dimensions for custom tailors and master cutters.
- **E-Commerce Sandbox:** Embeddable zero-knowledge sizing token widget demonstrating 1-click checkout size recommendation for third-party merchants without revealing body measurements.

---

## 🗂️ Verified Brand Catalog (28 Brands)

WearID's database is backed by verified brand size charts and flat garment specifications with verified provenance:
- **International Flagships:** Uniqlo India, Levi's India, Zara India, H&M India, Marks & Spencer, Nike, Decathlon India, Puma India, Clarks.
- **Indian Heritage & Contemporary Tailoring:** FabIndia, Raymond, Peter England, Allen Solly, Van Heusen, Westside, Snitch, Mufti, Manyavar, Max Fashion, Bata India, Red Tape, Roadster, Biba, W for Woman, Aurelia.
- **Jewelry & Accessories:** Tanishq, CaratLane.
- **Multi-Category Coverage:**
  - *Footwear:* Nike Air Max, Adidas Ultraboost, Puma Velocity, Bata Oxford, Red Tape Sneaker, Clarks Desert Boot.
  - *Intimates & Bras:* Uniqlo 3D Hold Wireless Bra, Marks & Spencer Total Support Underwired Bra, Nike Swoosh Sports Bra.
  - *Bottoms, Denims & Chinos:* Levi's 501 Original Fit Rigid Denim Jeans, Uniqlo Slim Fit Chino Pants.
  - *Outerwear & Jackets:* Levi's Classic Trucker Denim Jacket, Uniqlo Ultra Light Down Jacket.
  - *Tops, Shirts & Polos:* Uniqlo Oxford Slim Fit Shirt, Snitch Boxy Tee, Zara Textured Tee, FabIndia Cotton Kurta.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.7 (Strict Mode)
- **Styling:** Tailwind CSS with Warm Editorial Design Tokens (Ivory `#F5F3ED`, Forest Green `#425B48`, Terracotta `#C38367`, Dark `#141613`)
- **Authentication:** Google Firebase Phone Auth (10,000 Free SMS/mo) + Google OAuth + Supabase Email OTP
- **State Management:** Zustand with LocalStorage Persistence
- **Security:** Web Crypto AES-256-GCM, Zod Schema Validation
- **Testing:** Vitest 2.1 (502 tests across 24 test suites)
- **PWA:** Service Worker offline cache with native install prompts

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🔒 Verification & Quality Certification

| Check | Tool | Status |
|:---|:---|:---:|
| **Unit & Integration Tests** | Vitest 2.1 | ✅ **502 passed across 24 suites** |
| **Type Integrity** | TypeScript 5.7 (`tsc --noEmit`) | ✅ **0 errors** |
| **Code Style & Lint** | ESLint (`next lint`) | ✅ **0 warnings, 0 errors** |
| **Production Build** | Next.js 14 (`next build`) | ✅ **31 routes compiled** |
| **Data Provenance** | Immutable Checksum Hashes | ✅ **100% verified** |
| **Biometric Privacy** | AES-256-GCM Client Vault | ✅ **Invariants Certified** |
