# docs/brand-data-audit.md — Brand Data Access Audit (Phase 1 Pilot)

> **Fit / WearID — Universal Clothing Size Profile**  
> Empirical audit of the 8 Phase 1 pilot brands for size chart access, format, robots.txt policies, Terms of Service restrictions, and data layer classification.

---

## 1. Audit Framework & Invariants

In strict adherence to **Rule 6 and Rule 8 of `AGENTS.md` and `MASTER_PROMPT.md`**:
- **Never bypass access controls:** Scraping tools must strictly respect `robots.txt` disallows, rate limits (max 1 req / 3 sec), and terms of service.
- **Zero auto-publishing:** All ingested data must enter a staging queue with source provenance and pass human review.
- **Strict Layer Classification:** Explicitly distinguish between Layer 2 (body-fit ranges) and Layer 3 (finished garment measurements laid flat).

---

## 2. Pilot Brands Audit Matrix

| Brand | Official India URL | Public Size Guide Page? | Chart Format | robots.txt Status | ToS Automated Access | Available Data Layers |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Uniqlo India** | `uniqlo.com/in` | Yes (Product modals & dedicated guide) | HTML Table (Dynamic JSON API) | Permitted on product pages; rate-limited | Prohibits aggressive scraping; standard crawling permitted | **Layer 3 (Garment flat specs)** + Layer 2 |
| **2. H&M India** | `hm.com/en_in` | Yes (Size Guide modal) | HTML Table | Permitted on `/size-guide`; Disallows cart/checkout | Standard commercial restrictions | **Layer 2 (Body fit ranges)** only |
| **3. Zara India** | `zara.com/in` | Yes ("Size Assistant" & Guide) | Dynamic JS / SPA Modal | Restrictive on search; `/help/size-guide` permitted | Requires headless browser; no bypass | **Layer 2 (Body fit ranges)** only |
| **4. Levi's India** | `levi.in` | Yes (Size Chart per product) | HTML Table | Allowed with standard user-agent | Prohibits commercial automated scraping | **Layer 2 (Body fit ranges)** + Inseam/Waist |
| **5. Van Heusen (ABFRL)** | `vanheusenindia.abfrl.in`| Yes (Size guide accordion) | HTML Table / Embedded Data | Permitted on product catalogue | ABFRL terms require non-disruptive access | **Layer 2 (Collar/Chest numeric)** |
| **6. Westside (Tata Trent)** | `westside.com` | Yes (Size chart tab) | HTML Table | Allowed on standard PDPs | Tata Trent standard web terms | **Layer 2 (Body fit ranges)** |
| **7. Max Fashion (Landmark)** | `maxfashion.in` | Yes (Size modal) | HTML Table | Allowed on catalog pages | Landmark Group standard terms | **Layer 2 (Body fit ranges)** |
| **8. Snitch** | `snitch.co.in` | Yes (Shopify PDP modal) | HTML Table + Images | Standard Shopify `robots.txt` (allowed on PDP) | Prohibits DDoS / scraping without consent | **Layer 3 (Garment flat specs)** on select drops + Layer 2 |

---

## 3. Detailed Brand Analysis

### 3.1 Uniqlo India (`uniqlo.com/in`)
- **Size Chart Location:** Dedicated size chart tab on every product display page (PDP).
- **Format:** High-fidelity structured HTML tables backed by a clean JSON payload in the page state.
- **Data Layers Identified:** **Layer 3 (Garment Dimensions)**. Uniqlo is the gold standard among retail brands for providing exact garment specifications (body length, body width / chest flat, sleeve length from back of neck to cuff).
- **Robots.txt & ToS:** Product pages are crawlable; bot rate limiting of $\ge 3$ seconds per request must be enforced with `User-Agent: FitSizeBot/1.0 (+https://fit.in/bot)`.
- **Extraction Strategy:** Headless Playwright script extracting table attributes directly into Pydantic models.

### 3.2 H&M India (`hm.com/en_in`)
- **Size Chart Location:** Universal Size Guide modal accessible from garment pages.
- **Format:** HTML tables categorized by Men's Tops, Trousers, and Shoes.
- **Data Layers Identified:** **Layer 2 (Body Fit Ranges)**. H&M provides body measurements (e.g. Chest 96–104cm = M) rather than garment dimensions.
- **Robots.txt & ToS:** `/en_in/customer-service/size-guide` is accessible.
- **Extraction Strategy:** Static HTML parsing via BeautifulSoup; records tagged as `measurement_type = 'body_fit'`.

### 3.3 Zara India (`zara.com/in`)
- **Size Chart Location:** Size guide pop-up dynamically loaded via React/Angular client bundles.
- **Format:** Client-rendered dynamic tables.
- **Data Layers Identified:** **Layer 2 (Body Fit Ranges)**. Uses international European sizing conversions.
- **Robots.txt & ToS:** Requires Playwright with JavaScript execution. Must never attempt to bypass Akamai bot-manager triggers.
- **Extraction Strategy:** Playwright browser automation waiting for DOM element `#size-guide-modal`.

### 3.4 Levi's India (`levi.in`)
- **Size Chart Location:** "Size & Fit Guide" drawer on denim and t-shirt product pages.
- **Format:** HTML tables with unit toggles (`cm` and `inches`).
- **Data Layers Identified:** **Layer 2** for tops; **Layer 3** for jeans (waist flat, front rise, leg opening).
- **Extraction Strategy:** Parser captures both metric and imperial tables to verify unit conversion precision.

### 3.5 Van Heusen (`vanheusenindia.abfrl.in`)
- **Size Chart Location:** Size guide pop-up under Aditya Birla Fashion and Retail Ltd (ABFRL).
- **Format:** Standard HTML table structured around collar sizes (38, 39, 40, 42) and chest measurements.
- **Data Layers Identified:** **Layer 2 (Body Fit)** with tailored fit designations (Slim, Regular, Custom Fit).
- **Extraction Strategy:** Standard DOM table parser.

### 3.6 Westside (`westside.com`)
- **Size Chart Location:** PDP modal provided on Tata CLiQ / Trent e-commerce engine.
- **Format:** HTML table.
- **Data Layers Identified:** **Layer 2 (Body Fit)**. Generous wearing ease; brands like Ascot, Nuon, and WES have distinct grading rules.
- **Extraction Strategy:** BeautifulSoup extraction.

### 3.7 Max Fashion (`maxfashion.in`)
- **Size Chart Location:** Size Guide link beside size selector buttons.
- **Format:** HTML tables with chest, waist, and length ranges.
- **Data Layers Identified:** **Layer 2 (Body Fit)**.
- **Extraction Strategy:** BeautifulSoup extraction.

### 3.8 Snitch (`snitch.co.in`)
- **Size Chart Location:** "Size Chart" button on product pages.
- **Format:** HTML tables rendered via Shopify apps (e.g., Kiwi Size Chart or custom metafields). Occasionally uses composite infographic images for oversized fits.
- **Data Layers Identified:** Mix of **Layer 2 and Layer 3**. For oversized t-shirts, Snitch often provides chest circumference and length directly on garment.
- **Extraction Strategy:** For HTML tables: automated parser. For graphic images: GPT-4o Vision extraction routed directly to the human admin verification queue.

---

## 4. Ingestion Engineering Requirements for Phase 1 & 2

1. **Layer Tagging:** Every extracted record must be marked `Layer 2 (body_fit)` or `Layer 3 (garment_dimensions)`. If ambiguous, mark as `unknown` and block auto-promotion.
2. **Provenance Mandatory:** Store `source_url`, `collection_method`, `extracted_at`, and raw text hash.
3. **Canonical Normalization:** Ingested numbers must be converted from display units (`cm`/`in`) into integer millimeters (`mm`) for internal storage.
