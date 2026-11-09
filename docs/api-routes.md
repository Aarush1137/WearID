# docs/api-routes.md — API Architecture & Route Map

> **Fit / WearID — Universal Clothing Size Profile**  
> Complete API route map for the Next.js App Router backend and developer integration endpoints.

---

## 1. Authentication & Role Enforcement Middleware

All API routes enforce role-based access control (RBAC) server-side.
Never trust client-side role claims.

```
Role Hierarchy:
customer     < contributor < verifier < brand_rep < admin
(developer role has scoped read-only API key access)
```

---

## 2. API Endpoints Map

### 2.1 Profiles & Biometrics (Layer 1 & Layer 4)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/profiles` | `customer` | List all profiles belonging to the authenticated user. |
| `POST` | `/api/v1/profiles` | `customer` | Create a new profile (`self`, `partner`, `parent`, etc.). Enforces consent flag for non-self. |
| `GET` | `/api/v1/profiles/[id]` | `customer` (owner) | Retrieve a profile with completeness score. |
| `PATCH`| `/api/v1/profiles/[id]` | `customer` (owner) | Update profile details (shopping preferences, name). |
| `DELETE`| `/api/v1/profiles/[id]`| `customer` (owner) | Cascade-delete profile and all associated measurements. |
| `POST` | `/api/v1/profiles/[id]/measurements` | `customer` (owner) | Append new body measurements (sets `is_current = true`, archives old). |
| `GET` | `/api/v1/profiles/[id]/measurements/history` | `customer` (owner) | Audit timeline of measurement drift over time. |
| `PUT` | `/api/v1/profiles/[id]/preferences` | `customer` (owner) | Set fit intent per category (`slim`, `regular`, `relaxed`, `oversized`). |
| `GET` | `/api/v1/profiles/[id]/tailor-card` | `customer` (owner) | Generate tailor export data (cm + in) and QR payload. |

### 2.2 Catalog & Brands (Layer 2 & Layer 3)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/brands` | Public | List verified & available apparel brands with data quality badges. |
| `GET` | `/api/v1/brands/[slug]` | Public | Retrieve brand profile, available categories, and size system support. |
| `GET` | `/api/v1/brands/[slug]/categories/[cat]/chart` | Public | Retrieve structured Layer 2 body-fit chart. |
| `GET` | `/api/v1/products` | Public | Search products by brand, category, subcategory. |
| `GET` | `/api/v1/products/[id]/dimensions` | Public | Retrieve verified Layer 3 garment flat measurements per size. |

### 2.3 Deterministic Sizing & Recommendations

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/recommendations/evaluate` | `customer` | Computes deterministic size recommendation for a product/brand using active profile. Returns `ExplanationTree`. |
| `POST` | `/api/v1/recommendations/feedback` | `customer` | "Did this fit?" submission for real-world outcome calibration. |
| `POST` | `/api/v1/portability/match` | API Key / Bearer | Zero-knowledge retailer size match (returns size tag + confidence, zero raw biometrics). |

### 2.4 Community Contributions & Staging Queue

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/contributions/submit` | `contributor` | Submit brand, size chart, or physical garment measurement. |
| `GET` | `/api/v1/contributions/my-history`| `contributor` | View status of submitted contributions and awarded reputation points. |
| `GET` | `/api/v1/admin/verification-queue`| `verifier` / `admin` | List pending submissions awaiting moderation. |
| `POST` | `/api/v1/admin/verification-queue/[id]/review` | `verifier` / `admin` | Approve/reject submission. Enforces check: `contributor_id != reviewer_id`. |

### 2.5 Privacy, Export & Compliance (India DPDP Act)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/account/export` | `customer` | Full JSON export of all personal profiles, measurements, and feedback. |
| `DELETE`| `/api/v1/account/delete` | `customer` | Permanent account purge with cascading deletion across all tables. |
