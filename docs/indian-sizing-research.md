# docs/indian-sizing-research.md — Indian Anthropometrics & Apparel Sizing Landscape

> **Fit / WearID — Universal Clothing Size Profile**  
> Empirical research into Indian body measurements, the NIFT INDIAsize initiative, sizing discrepancies, and regulatory/licensing standards.

---

## 1. The Indian Anthropometric Reality

For decades, the Indian apparel industry relied on sizing charts imported directly from the United Kingdom (British Standards Institution BSI), United States (ASTM), or European Union (EN 13402). 

However, extensive anthropometric studies demonstrate that Indian bodies possess distinct proportional differences compared to Western cohorts:
- **Torso vs. Leg Proportion:** On average, Indian adults exhibit slightly longer torsos relative to inseam length compared to Northern European populations.
- **Waist-to-Hip Ratios:** Tendency toward a higher waist-to-hip ratio and central adiposity, causing garments designed for Western hourglass or athletic inverted-triangle silhouettes to pinch at the waist or billow excessively at the shoulders.
- **Shoulder Width & Arm Length:** Standard Western sleeve lengths and shoulder spans frequently run 20–40mm too long for standard Indian size tags (e.g., standard UK 40 chest often features a 640mm sleeve crown-to-cuff, whereas the average Indian male 40 chest requires 610–620mm).

As a consequence, an Indian consumer wearing an international brand’s Size L often finds the sleeves too long and the hem excessive, while a domestic brand's Size L may fit tight across the chest.

---

## 2. NIFT INDIAsize Programme & The IN Tag System

### 2.1 Study Scope & Methodology
- Initiated by the **Ministry of Textiles, Government of India**, and executed by the **National Institute of Fashion Technology (NIFT)**.
- Measured **26,324 individual subjects** across six geographical regions of India (North, South, East, West, Central, and Northeast).
- Utilized 3D whole-body non-contact optical scanners extracting over 100 anthropometric data points per participant across demographic, age, and income cohorts.

### 2.2 Standardized Output: 14 Male and 13 Female Body Size Charts
- Established **14 distinct male size charts** and **13 female size charts**, categorized by height intervals (Short, Regular, Tall) and girth increments.
- **IN Tag System:** The official standard assigns size tags reflecting primary body girths (e.g., Chest circumference in cm for upper body, Waist circumference in cm for lower body) rather than vague alpha labels (S/M/L).
- Introduced standardized secondary identifiers: e.g., `IN M 96-R` (Chest 96cm, Regular height).

### 2.3 INDIAsize Portal & Launch Timeline
- The official portal and public release became active from **2 January 2026**.
- Brands in India are transitioning toward voluntary adoption of the IN Tag standard across domestic collections.

### 2.4 Licensing, Copyright & Permitted Use
- **Status:** **RESTRICTED / PENDING EXPLICIT CONFIRMATION.**
- Data generated under the Ministry of Textiles and NIFT is subject to government copyright and licensing frameworks.
- **Hard Rule for WearID:** As encoded in `AGENTS.md` and the `indiasize_reference` table schema:
  ```sql
  CONSTRAINT indiasize_empty CHECK (false)
  ```
  **Under no circumstances will raw INDIAsize tables be seeded or ingested into the production catalog without formal, written licensing confirmation from NIFT / Ministry of Textiles.**
- **Permitted Use:** WearID utilizes public high-level statistical findings as domain knowledge to model realistic ease tolerances and distribution curves, but does not redistribute proprietary tables.

---

## 3. Comparison of Regional Sizing Systems

| Dimension | India (IN Tag) | United Kingdom (UK) | United States (US) | European Union (EU) |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Unit** | Centimetres (cm) | Inches (in) / Alpha | Inches (in) / Alpha | Centimetres (cm) |
| **Men's Chest Standard** | 92cm, 96cm, 100cm, 104cm | 36in, 38in, 40in, 42in | 36in, 38in, 40in, 42in | 46 (92cm), 48 (96cm), 50 (100cm) |
| **Grading Step (Chest)** | 4.0 cm (~1.57 in) | 2.0 in (~5.08 cm) | 2.0 in (~5.08 cm) | 4.0 cm (~1.57 in) |
| **Drop (Chest - Waist)** | 10–12 cm (Modest taper) | 12–15 cm (Athletic) | 12–15 cm (Standard) | 12–16 cm (Tailored) |
| **Women's Sizing Base** | Bust / Waist in cm | Dual numbers (8, 10, 12) | Even numbers (4, 6, 8) | Dual numbers (36, 38, 40) |

---

## 4. How Indian Apparel Brands Currently Approach Sizing

Our research identifies four distinct operational strategies currently used by Indian fashion brands:

1. **International Franchise Direct Importers (e.g., Zara, H&M, Uniqlo):**
   - Retain their global master pattern blocks with minimal regional adjustments.
   - Uniqlo provides physical garment measurements (Layer 3) on their Indian web store (e.g., pit-to-pit flat in cm), making their sizing the most transparent and predictable.
   - Zara and H&M primarily offer generic body-fit ranges (Layer 2) which run 1–2 sizes larger than domestic Indian labels.

2. **Legacy Heritage Brands (e.g., Raymond, Van Heusen, Peter England, Louis Philippe):**
   - Utilize British collar-and-chest tailoring traditions.
   - Sizing is predominantly numeric: Shirts graded by collar size (38cm, 39cm, 40cm, 42cm) and trousers by waist circumference in inches (30, 32, 34, 36).
   - High consistency across their own lines, but significant deviation when compared to modern casualwear.

3. **Value Retail Giants (e.g., Westside, Max Fashion, Zudio, Reliance Trends):**
   - Calibrate toward generous, relaxed cuts with high wearing ease (+12cm to +18cm on chests) to accommodate broad demographic distributions.
   - A Size M in Westside frequently matches a Size L in fast-fashion brands.

4. **Modern D2C Brands (e.g., Snitch, The Souled Store, Bewakoof):**
   - Heavily skewed toward youth and streetwear trends: relaxed, boxy, and oversized fits.
   - An "Oversized M" at Snitch may feature a 116cm finished chest circumference, which is physically larger than a standard Size XL slim-fit shirt from Van Heusen.
   - This reinforces the non-negotiable rule: **Garment dimensions and fit intent must be modeled separately from body size.**

---

## 5. Collaboration Potential with NIFT

There is high strategic value in pursuing institutional collaboration with NIFT:
- **Academic & Industry Partnership:** Presenting WearID as the consumer-facing implementation layer of the IN Tag standard.
- **Standardization Advocacy:** Supporting the digital dissemination of IN Tag compliance to D2C merchants through WearID’s verified catalog and developer APIs.
- **Formal Application:** Preparing a formal outreach proposal for data licensing once Phase 1 proof-of-concept validation gates are achieved.
