# Measurement Data Flow & Sizing Engine Architecture

> **WearID — Universal Clothing Size Profile**  
> Complete specification of domain segregation, data transformation rules, fallback mechanisms, zero-knowledge portability, and privacy boundaries across Layers 1 to 4.

---

## 1. Architectural Foundation: The 4 Non-Conflated Layers (Measurement Data Flow)

In strict adherence to **`AGENTS.md` (Invariant 3)** and **`MASTER_PROMPT.md` Product Rule 3**, body measurements and finished garment dimensions belong to completely distinct domains and must never share interchangeable columns, types, or storage entities.

```mermaid
flowchart TD
    subgraph L1 ["Layer 1: User Anatomical Profile"]
        BodyChest["Chest Girth (e.g., 980 mm)"]
        BodyShoulder["Shoulder Width (e.g., 440 mm)"]
        BodyTorso["Torso Length (e.g., 710 mm)"]
        BodyWaist["Waist Girth (e.g., 840 mm)"]
    end

    subgraph L4 ["Layer 4: User Fit Intent"]
        Pref["Category Preference (e.g., T-Shirt: 'Regular Fit')"]
    end

    subgraph SizingEngine ["Deterministic Sizing Evaluation Engine"]
        EaseCalc["1. Ease Arithmetic: Garment Spec - Body Dimension"]
        Gaussian["2. Gaussian Ease Score Evaluation"]
        FabricRules["3. Fabric Elasticity & Negative Ease Penalties"]
        RefCalib["4. Reference Garment Calibration (+/- 0.15 Delta)"]
        Borderline["5. Borderline Boundary Check (|s0 - s1| < 0.08)"]
    end

    subgraph L3 ["Layer 3: Finished Garment Specs (Preferred)"]
        G_Chest["Flat Pit-to-Pit x 2 (e.g., 550 mm x 2 = 1100 mm)"]
        G_Shoulder["Across Shoulder (e.g., 455 mm)"]
        G_Length["Back Length from HPS (e.g., 730 mm)"]
    end

    subgraph L2 ["Layer 2: Brand Size Chart (Fallback)"]
        B_Range["Brand Recommended Body Range (e.g., Size L: 1040 - 1120 mm)"]
    end

    L1 --> SizingEngine
    L4 --> SizingEngine
    L3 ==>|Preferred Primary Source| SizingEngine
    L2 -.->|Fallback when L3 Missing| SizingEngine

    SizingEngine --> OutputDTO["Recommendation DTO + ExplanationTree"]
```

---

## 2. End-to-End Recommendation Sequence Flow

The following sequence diagram illustrates the lifecycle of a size recommendation request:

```mermaid
sequenceDiagram
    autonumber
    actor User as Mobile Shopper
    participant PWA as WearID PWA Client
    participant API as Match Route (/api/sizing/match)
    participant DB as Supabase PostgreSQL (RLS Enforced)
    participant Engine as Deterministic Sizing Engine
    
    User->>PWA: Click "Check My Size" on Product (e.g., Uniqlo Supima Crew Tee)
    PWA->>API: POST /api/sizing/match { profile_id, product_id }
    
    API->>DB: Query Layer 1 Body Measurements for profile_id
    Note over API,DB: RLS verifies auth.uid() == profile.user_id
    DB-->>API: Return Body Measurements (Chest: 980mm, Shoulder: 440mm, Torso: 710mm)
    
    API->>DB: Query Layer 4 Fit Preference for profile_id and category 't-shirt'
    DB-->>API: Return Fit Intent ("regular")
    
    API->>DB: Query Layer 3 Garment Measurements for product_id (All Sizes)
    DB-->>API: Return Garment Dimensions (Sizes S, M, L, XL, XXL)
    
    alt Layer 3 Garment Specs Available
        API->>Engine: Evaluate Layer 3 Match (BodyProfile, GarmentSpecs, FitIntent, FabricSpec)
    else Layer 3 Garment Specs Absent (Fallback Mode)
        API->>DB: Query Layer 2 Brand Size Chart for Brand ID & Category
        DB-->>API: Return Brand Size Chart Ranges (Min/Max mm)
        API->>Engine: Evaluate Layer 2 Fallback Match (BodyProfile, BrandSizeChart)
    end
    
    rect rgb(240, 248, 240)
        Note over Engine: Pure Functional Mathematical Pipeline
        Engine->>Engine: 1. Convert Flat Dims to Circumference: GarmentChest = chest_flat_mm * 2
        Engine->>Engine: 2. Calculate Actual Ease = GarmentChest - BodyChest (1100 - 980 = +120mm)
        Engine->>Engine: 3. Fetch Category Ease Target (Regular T-Shirt: [80mm, 140mm], ideal: 110mm)
        Engine->>Engine: 4. Evaluate Gaussian Score per dimension
        Engine->>Engine: 5. Apply Fabric Elasticity Penalties (0% elastane rigid check)
        Engine->>Engine: 6. Apply Reference Garment Calibration (+/- 0.15)
        Engine->>Engine: 7. Check Borderline Condition (|score_0 - score_1| < 0.08)
        Engine->>Engine: 8. Construct ExplanationTree JSON & Conversational Markdown
    end
    
    Engine-->>API: Return MatchResult { RecommendedSize: "L", FitScore: 94, ExplanationTree }
    API->>DB: Cache recommendation in size_recommendations table
    API-->>PWA: Return 200 OK with ExplanationTree DTO
    PWA-->>User: Render Recommended Size Badge, Tension Radar & Explanation Tree
```

---

## 3. Data Transformation Rules & Mathematical Invariants

### 3.1 Canonical Unit Normalization
- **Rule:** All internal storage, database constraints, and engine calculations operate exclusively in **non-negative integer millimeters (`mm`)** for lengths and **integer grams (`g`)** for masses.
- **Ingestion Transformation:**
  - Inches to Millimeters: $\text{Value (mm)} = \text{round}(\text{Value (in)} \times 25.4)$
  - Centimeters to Millimeters: $\text{Value (mm)} = \text{round}(\text{Value (cm)} \times 10)$
- **Presentation Transformation:**
  - Millimeters to Centimeters: $\text{Display (cm)} = \frac{\text{Value (mm)}}{10}$
  - Millimeters to Inches: $\text{Display (in)} = \frac{\text{Value (mm)}}{25.4}$

### 3.2 Flat Dimension to Circumference Transformation
Finished garment specifications are recorded laid flat across the textile.
$$\text{Garment Chest Circumference (mm)} = \text{chest\_flat\_mm} \times 2$$
$$\text{Garment Waist Circumference (mm)} = \text{waist\_flat\_mm} \times 2$$

### 3.3 Dynamic Ease Arithmetic (Ease Formula)
The foundational Ease Formula calculates the difference between garment spec and anatomical body dimension:
$$\text{Ease Formula: Ease} = \text{Garment Dimension} - \text{Body Dimension}$$
$$\text{Actual Chest Ease (mm)} = \text{Garment Chest Circumference (mm)} - \text{Body Chest Girth (mm)}$$
$$\text{Actual Shoulder Delta (mm)} = \text{Garment Shoulder Width (mm)} - \text{Body Biacromial Width (mm)}$$

### 3.4 Category Target Ease Ranges (Men's T-Shirts)
Ease intervals are calibrated based on apparel pattern engineering standards:

| Fit Intent | Min Ease | Max Ease | Ideal Midpoint ($\mu$) | Standard Deviation ($\sigma$) |
|:---|:---:|:---:|:---:|:---:|
| **Slim Fit** | `40 mm` (`4.0 cm`) | `80 mm` (`8.0 cm`) | `60 mm` (`6.0 cm`) | `15 mm` |
| **Regular Fit** | `80 mm` (`8.0 cm`) | `140 mm` (`14.0 cm`) | `110 mm` (`11.0 cm`) | `20 mm` |
| **Relaxed Fit** | `140 mm` (`14.0 cm`) | `200 mm` (`20.0 cm`) | `170 mm` (`17.0 cm`) | `25 mm` |
| **Oversized Fit** | `200 mm` (`20.0 cm`) | `300 mm` (`30.0 cm`) | `250 mm` (`25.0 cm`) | `35 mm` |

---

## 4. Fallback Hierarchy & Graceful Degradation

```mermaid
flowchart TD
    Req["Recommendation Request"] --> CheckL3{"Layer 3 Garment Flat Specs Available?"}
    
    CheckL3 -->|"Yes (Preferred)"| ExecL3["Execute Layer 3 Match<br/>• Finished garment dimensions<br/>• Full ExplanationTree<br/>• High Confidence (0.85 - 0.98)"]
    
    CheckL3 -->|"No"| CheckL2{"Layer 2 Brand Size Chart Available?"}
    
    CheckL2 -->|"Yes (Fallback)"| ExecL2["Execute Layer 2 Match<br/>• Brand body-fit ranges<br/>• Interval overlap score<br/>• Medium Confidence (0.60 - 0.75)"]
    
    CheckL2 -->|"No"| Insufficient["Return InsufficientDataError<br/>• Never fabricate or synthesize data<br/>• Confidence = 0.00<br/>• Prompt user for garment measurements"]
```

1. **Primary Evaluation (Layer 3):** When physical garment specifications are present, the engine executes Gaussian ease scoring against finished dimensions. Yields highest confidence ($0.85 - 0.98$).
2. **Secondary Fallback (Layer 2):** When physical garment specs are absent, the engine falls back to brand body-fit ranges. Scores are calculated based on where the user's measurement falls within the brand's recommended range:
   $$\text{Score} = 1.0 - \frac{|\text{BodyChest} - \text{RangeMidpoint}|}{\text{RangeMax} - \text{RangeMin}}$$
   Confidence is capped at $0.75$, and the UI explicitly indicates: *"Based on brand generic size guide; physical garment dimensions unavailable."*
3. **Data Absence Guardrail:** If neither Layer 3 nor Layer 2 data exists, or if the user's mandatory chest measurement is absent, the engine aborts calculation. In strict adherence to **`AGENTS.md` Invariant 1**, the engine **never fabricates or guesses plausible-looking dimensions**.

---

## 5. Zero-Knowledge Retailer Portability & Privacy Boundaries

WearID enforces strict cryptographic boundaries between private biometric profiles and external commercial entities:

```mermaid
sequenceDiagram
    autonumber
    actor User as Shopper on Partner Store
    participant Partner as Retailer Checkout / Widget
    participant Gateway as WearID Portability Gateway
    participant DB as WearID Sovereign Database
    
    User->>Partner: Click "Find My Size with WearID"
    Partner->>Gateway: POST /api/portability/recommend (with Scoped Sizing Token & SKU)
    Gateway->>DB: Validate Token & Resolve Active Profile (Internal Only)
    DB-->>Gateway: Return Internal Profile ID
    
    Gateway->>Gateway: Compute Deterministic Match for SKU
    Note over Gateway: PRIVACY SHIELD: Strip all millimeter body measurements
    
    Gateway-->>Partner: Return { recommended_size: "L", confidence: 0.94, fit_tag: "regular" }
    Partner-->>User: Display "Size L is your best fit"
    Note over Partner,User: Zero raw anatomical measurements exposed to retailer
```

### Privacy & Governance Guarantees:
1. **Private by Default (`AGENTS.md` Invariant 7):** Human body dimensions are sensitive biometrics. Raw measurements are accessible only by the authenticated owner (`auth.uid() = user_id`).
2. **Zero Biometric Leakage:** Retailer integration endpoints (`/api/portability/recommend`) transmit exclusively high-level sizing advice (recommended size tag, confidence score, qualitative drape tag). Raw chest, waist, shoulder, or height millimeters are completely stripped.
3. **Consent-Gated Profiles:** Secondary family profiles (partner, children, parents) require explicit consent flags (`consent_granted = true`) before sizing matches can be generated.
4. **Permanent Purge Support (DPDP Compliance):** Account deletion triggers an immediate cascade delete across all personal biometric tables, ensuring right-to-be-forgotten compliance.
