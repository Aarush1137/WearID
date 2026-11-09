# API Architecture & Route Map

> **WearID — Universal Clothing Size Profile**  
> Complete API specification for the Next.js App Router backend, deterministic sizing engine, and developer integration endpoints.

---

## 1. Authentication, Security & Error Standards

### 1.1 Authentication & Role-Based Access Control (RBAC)
All private API routes enforce server-side authentication using JSON Web Tokens (JWT) mapped to Supabase `auth.uid()`. Role-based permissions are validated on each request:
- **`public`**: Unauthenticated read access to verified catalog items (brands, size charts, published garments).
- **`customer`** (or `user`): Authenticated consumer with read/write access strictly scoped to their own profile resources via PostgreSQL Row Level Security (RLS).
- **`contributor`**: Authenticated community member permitted to submit staged garment specifications.
- **`admin`**: System administrator permitted to verify contributions, manage brands, and review audit logs.
- **`portability_client`**: B2B merchant client authenticated via scoped API Bearer token for zero-knowledge recommendations.

### 1.2 Error Handling Standard (RFC 7807 Problem Details)
All error responses adhere to the **RFC 7807 Problem Details for HTTP APIs** specification:
```json
{
  "type": "https://wearid.in/errors/insufficient-data",
  "title": "Insufficient Measurement Data",
  "status": 400,
  "detail": "Chest measurement (Layer 1) is required to evaluate sizing for category 't-shirt'.",
  "instance": "/api/sizing/match",
  "invalid_params": [
    {
      "name": "profile_id",
      "reason": "Profile #3a2b lacks chest_mm"
    }
  ]
}
```

---

## 2. API Endpoints Map (16 Core Next.js App Router Endpoints)

| # | HTTP Method | Route Path | Purpose | Security & Auth |
|---|:---|:---|:---|:---|
| **1** | `GET` | `/api/profiles` (or `/api/v1/profiles`) | List all profiles owned by user | Bearer JWT (`auth.uid()`, role: `customer`) |
| **2** | `POST` | `/api/profiles` (or `/api/v1/profiles`) | Create new profile (self/family) | Bearer JWT (`auth.uid()`, role: `customer`) |
| **3** | `GET` | `/api/profiles/[id]` | Get single profile details | Bearer JWT (Owner check: `customer`) |
| **4** | `PUT` | `/api/profiles/[id]` | Update profile metadata | Bearer JWT (Owner check: `customer`) |
| **5** | `DELETE` | `/api/profiles/[id]` | Cascade delete profile and measurements | Bearer JWT (Owner check: `customer`) |
| **6** | `POST` | `/api/profiles/[id]/measurements` | Record new Layer 1 body measurements | Bearer JWT (Owner check: `customer`) |
| **7** | `GET` | `/api/profiles/[id]/measurements/history` | Audit timeline of measurement changes | Bearer JWT (Owner check: `customer`) |
| **8** | `GET` | `/api/profiles/[id]/preferences` | Get Layer 4 category fit preferences | Bearer JWT (Owner check: `customer`) |
| **9** | `PUT` | `/api/profiles/[id]/preferences` | Set/update fit preference for category | Bearer JWT (Owner check: `customer`) |
| **10** | `GET` | `/api/brands` | Search and list verified brands | Public |
| **11** | `GET` | `/api/brands/[slug]` | Get brand details & Layer 2 charts | Public |
| **12** | `GET` | `/api/products` | Browse product catalog | Public |
| **13** | `GET` | `/api/products/[slug]` | Get product specs & Layer 3 flat dims | Public |
| **14** | `POST` | `/api/sizing/match` (or `/api/v1/recommendations`) | Deterministic Sizing Recommendation | Bearer JWT (Owner check: `customer`) |
| **15** | `POST` | `/api/contributions` | Submit staged community garment spec | Bearer JWT (`contributor` / `customer`) |
| **16** | `POST` | `/api/portability/recommend` | Zero-Knowledge Retailer Match Endpoint | Token Scoped Header |

---

## 3. Deep Endpoint Specifications

### 3.1 Profiles & Biometrics (Endpoints 1–9)

#### 1. `GET /api/profiles`
- **Purpose:** Retrieve all sizing profiles created by the authenticated account (e.g., self, partner, children).
- **Auth:** `Bearer <JWT>`
- **Query Parameters:** `?include_measurements=true|false` (default: `true`)
- **Response `200 OK`:**
  ```json
  [
    {
      "id": "7f8b3c2a-9e1d-4a5f-8b2c-3d4e5f6a7b8c",
      "user_id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "profile_name": "Aarush (Self)",
      "relation": "self",
      "gender": "male",
      "is_default": true,
      "consent_granted": true,
      "current_measurements": {
        "chest_mm": 980,
        "waist_mm": 840,
        "shoulder_width_mm": 440,
        "height_mm": 1780,
        "weight_g": 74000,
        "recorded_at": "2026-11-01T10:00:00Z"
      }
    }
  ]
  ```
- **Errors:** `401 Unauthorized`

#### 2. `POST /api/profiles`
- **Purpose:** Create a new sizing profile. Non-self profiles mandate consent verification.
- **Auth:** `Bearer <JWT>`
- **Request Body:**
  ```json
  {
    "profile_name": "Priya (Partner)",
    "relation": "partner",
    "gender": "female",
    "is_default": false,
    "consent_granted": true
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "id": "8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f",
    "profile_name": "Priya (Partner)",
    "relation": "partner",
    "gender": "female",
    "is_default": false,
    "consent_granted": true,
    "created_at": "2026-11-09T21:00:00Z"
  }
  ```
- **Errors:** `400 Bad Request` (Validation error), `401 Unauthorized`

#### 3. `GET /api/profiles/[id]`
- **Purpose:** Retrieve full profile metadata, including Layer 1 biometrics and Layer 4 preferences.
- **Auth:** `Bearer <JWT>` (Owner validation)
- **Path Parameter:** `id: UUID`
- **Response `200 OK`:** Complete profile object with `current_measurements`, `fit_preferences`, and `completeness_score` (0–100%).
- **Errors:** `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### 4. `PUT /api/profiles/[id]`
- **Purpose:** Update profile name, relation, or default status.
- **Auth:** `Bearer <JWT>` (Owner validation)
- **Path Parameter:** `id: UUID`
- **Request Body:** `{ "profile_name": "Aarush M.", "is_default": true }`
- **Response `200 OK`:** Updated profile object.
- **Errors:** `400 Bad Request`, `403 Forbidden`, `404 Not Found`

#### 5. `DELETE /api/profiles/[id]`
- **Purpose:** Permanently delete a profile and cascade-delete all associated body measurements, preferences, and recommendation history.
- **Auth:** `Bearer <JWT>` (Owner validation)
- **Path Parameter:** `id: UUID`
- **Response `200 OK`:** `{ "success": true, "deleted_id": "8c9d0e1f-..." }`
- **Errors:** `403 Forbidden`, `404 Not Found`

#### 6. `POST /api/profiles/[id]/measurements`
- **Purpose:** Record new Layer 1 body measurements. Preserves history by setting previous measurements to `is_current = false`.
- **Auth:** `Bearer <JWT>` (Owner validation)
- **Path Parameter:** `id: UUID`
- **Request Body (Values strictly in integer mm and grams):**
  ```json
  {
    "chest_mm": 990,
    "waist_mm": 845,
    "shoulder_width_mm": 445,
    "torso_length_mm": 710,
    "height_mm": 1780,
    "weight_g": 74500,
    "measurement_method": {
      "path": "tape",
      "tool": "fabric_measuring_tape"
    },
    "notes": "Post-workout morning check"
  }
  ```
- **Response `201 Created`:** Created measurement record with assigned UUID.
- **Errors:** `400 InvalidDimensionError` (Dimensions $\le 0$ or unrealistic), `403 Forbidden`

#### 7. `GET /api/profiles/[id]/measurements/history`
- **Purpose:** Retrieve the append-only chronological history of measurements for trend analysis.
- **Auth:** `Bearer <JWT>` (Owner validation)
- **Path Parameter:** `id: UUID`
- **Response `200 OK`:** Array of historical measurement entries sorted by `recorded_at DESC`.
- **Errors:** `403 Forbidden`, `404 Not Found`

#### 8. `GET /api/profiles/[id]/preferences`
- **Purpose:** Retrieve user fit intent across categories (e.g., T-Shirts: Relaxed, Jeans: Slim).
- **Auth:** `Bearer <JWT>` (Owner validation)
- **Path Parameter:** `id: UUID`
- **Response `200 OK`:** Array of `{ category, fit_type, notes, updated_at }`.
- **Errors:** `403 Forbidden`, `404 Not Found`

#### 9. `PUT /api/profiles/[id]/preferences`
- **Purpose:** Upsert fit preference intent for a given category.
- **Auth:** `Bearer <JWT>` (Owner validation)
- **Path Parameter:** `id: UUID`
- **Request Body:**
  ```json
  {
    "category": "t-shirt",
    "fit_type": "relaxed",
    "notes": "Prefer generous drape in summer"
  }
  ```
- **Response `200 OK`:** Updated preference entry.
- **Errors:** `400 Bad Request` (Invalid `fit_type`), `403 Forbidden`

---

### 3.2 Catalog & Brands (Endpoints 10–13)

#### 10. `GET /api/brands`
- **Purpose:** List verified apparel brands with catalog counts and data quality badges.
- **Auth:** Public
- **Query Parameters:** `?country=IN&category=t-shirt&search=uniqlo`
- **Response `200 OK`:**
  ```json
  [
    {
      "id": "2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a",
      "name": "Uniqlo India",
      "slug": "uniqlo-in",
      "country": "IN",
      "verified_status": "brand_official",
      "has_layer3_specs": true,
      "product_count": 28
    }
  ]
  ```

#### 11. `GET /api/brands/[slug]`
- **Purpose:** Get full brand details, size guide documentation, and Layer 2 body-fit charts.
- **Auth:** Public
- **Path Parameter:** `slug: string` (e.g., `westside`)
- **Response `200 OK`:**
  ```json
  {
    "id": "3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b",
    "name": "Westside",
    "slug": "westside",
    "official_url": "https://westside.com",
    "verified_status": "brand_official",
    "size_charts": [
      {
        "category": "t-shirt",
        "size_label": "M",
        "size_system": "IN",
        "chest_min_mm": 960,
        "chest_max_mm": 1040,
        "source_url": "https://westside.com/pages/size-guide"
      }
    ]
  }
  ```
- **Errors:** `404 Not Found` (Brand slug not recognized)

#### 12. `GET /api/products`
- **Purpose:** Browse apparel catalog with filters for category, brand, and fit style.
- **Auth:** Public
- **Query Parameters:** `?brand_slug=uniqlo-in&category=t-shirt&limit=20&page=1`
- **Response `200 OK`:** Paginated list of products with textile specifications.

#### 13. `GET /api/products/[slug]`
- **Purpose:** Retrieve complete product details, material composition, elastane percentage, and verified Layer 3 garment dimensions.
- **Auth:** Public
- **Path Parameter:** `slug: string` (e.g., `uniqlo-supima-crew-neck-tshirt`)
- **Response `200 OK`:**
  ```json
  {
    "id": "5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d",
    "name": "Supima Cotton Crew Neck T-Shirt",
    "slug": "uniqlo-supima-crew-neck-tshirt",
    "brand_name": "Uniqlo India",
    "category": "t-shirt",
    "material_composition": "100% Cotton",
    "elastane_percentage": 0.0,
    "stretch_level": "low",
    "garment_measurements": [
      {
        "size_label": "M",
        "chest_flat_mm": 520,
        "shoulder_mm": 440,
        "length_mm": 700,
        "measurement_method": "laid_flat",
        "confidence": 0.95
      },
      {
        "size_label": "L",
        "chest_flat_mm": 550,
        "shoulder_mm": 455,
        "length_mm": 730,
        "measurement_method": "laid_flat",
        "confidence": 0.95
      }
    ]
  }
  ```
- **Errors:** `404 Not Found`

---

### 3.3 Sizing Engine, Contributions & Portability (Endpoints 14–16)

#### 14. `POST /api/sizing/match` (Core Recommendation Endpoint)
- **Purpose:** Execute the pure deterministic sizing algorithm, evaluating Layer 1 anatomical measurements against Layer 3 garment dimensions (or Layer 2 fallback), Layer 4 preferences, and reference garment calibrations.
- **Auth:** `Bearer <JWT>` (Must own profile)
- **Request Body:**
  ```json
  {
    "profile_id": "7f8b3c2a-9e1d-4a5f-8b2c-3d4e5f6a7b8c",
    "product_id": "5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d",
    "override_fit_type": "regular"
  }
  ```
- **Response `200 OK` (`ExplanationTree` DTO):**
  ```json
  {
    "recommended_size": "L",
    "alternative_size": "M",
    "fit_score": 94,
    "confidence": 0.95,
    "confidence_label": "high",
    "fit_type_used": "regular",
    "is_borderline": false,
    "borderline_tradeoff": null,
    "summary_text": "We recommend Size L based on a +120mm chest ease for your regular fit preference.",
    "dimension_breakdown": [
      {
        "dimension": "chest",
        "body_measurement_mm": 980,
        "garment_spec_mm": 1100,
        "ease_delta_mm": 120,
        "ease_target_mm": { "min": 80, "max": 140 },
        "status": "ideal",
        "rationale": "Ease of +120mm is within your desired regular target (+80mm to +140mm)."
      },
      {
        "dimension": "shoulder",
        "body_measurement_mm": 440,
        "garment_spec_mm": 455,
        "ease_delta_mm": 15,
        "ease_target_mm": { "min": 0, "max": 30 },
        "status": "ideal",
        "rationale": "Shoulder width delta is +15mm."
      }
    ],
    "fabric_considerations": {
      "material": "100% Cotton",
      "elastane_percentage": 0.0,
      "stretch_level": "low",
      "note": "100% rigid cotton will experience ~2% minor shrinkage on first wash."
    },
    "data_sources": {
      "layer_used": "Layer3_Garment",
      "provenance": "Verified physical garment specification"
    }
  }
  ```
- **Errors:** 
  - `400 Bad Request`: `InsufficientDataError` when mandatory body measurements are missing.
  - `403 Forbidden`: Attempting to query an unowned profile.
  - `404 Not Found`: Product ID invalid.

#### 15. `POST /api/contributions`
- **Purpose:** Submit user-measured physical garment dimensions into the staged verification queue (`community_contributions`).
- **Auth:** `Bearer <JWT>` (`contributor` role or authenticated `user`)
- **Request Body:**
  ```json
  {
    "product_id": "5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d",
    "submission_type": "garment_measurement",
    "payload_json": {
      "size_label": "XL",
      "chest_flat_mm": 580,
      "length_mm": 750,
      "shoulder_mm": 470,
      "measurement_method": "laid_flat"
    },
    "proof_image_url": "https://storage.wearid.in/proofs/user_4092_tape.jpg"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "contribution_id": "9d0e1f2a-3b4c-5d6e-7f8a-9b0c1d2e3f4a",
    "status": "pending_review",
    "message": "Submission received and queued for verifier review."
  }
  ```
- **Errors:** `400 Bad Request` (Invalid dimensions), `401 Unauthorized`

#### 16. `POST /api/portability/recommend` (Zero-Knowledge B2B Endpoint)
- **Purpose:** Enable third-party e-commerce checkouts and retailer embed widgets to request sizing recommendations without accessing the user's raw anatomical biometrics.
- **Auth:** Header: `Authorization: Bearer <SizingToken>`
- **Request Body:**
  ```json
  {
    "retailer_sku": "UQ-TEE-4092-WHT",
    "brand_slug": "uniqlo-in"
  }
  ```
- **Response `200 OK` (Zero Biometric Leakage):**
  ```json
  {
    "recommended_size": "L",
    "fit_confidence": 0.94,
    "fit_tag": "regular_fit",
    "explanation_snippet": "Matches your regular fit preference with comfortable chest drape.",
    "is_borderline": false
  }
  ```
- **Errors:** `401 InvalidTokenError` (Expired or tampered token), `404 SkuNotFound`
