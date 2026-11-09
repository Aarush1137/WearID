# env.template.md — Environment & Secret Mocking Specifications

> **WearID** — *Your clothing identity, everywhere.*  
> Safe environment templates, mock configurations, and credential shielding specifications for autonomous agents.

---

## 1. Credential Shielding & Autonomous Execution Philosophy

Antigravity agents autonomously execute scripts, run test suites, and launch local development servers. To ensure security and prevent secret leakage:
1. **Never Commit Production Secrets:** Real production API keys, production database connection strings, and biometric master keys must never be committed to git or printed in logs.
2. **Mock by Default:** Agents must execute all tests and builds using isolated mock adapters, in-memory databases, or local sandbox endpoints.
3. **Template Conformance:** All environment variables required by the system must be documented below with safe, functional mock values.

---

## 2. Environment Variables Specification

| Variable Name | Required | Default / Mock Value | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `development` / `test` | Runtime environment (`development`, `test`, `production`). |
| `PORT` | No | `3000` | Local HTTP service port. |
| `WEARID_API_URL` | Yes | `http://localhost:3000/api/v1` | Base API gateway URL. |
| `DATABASE_URL` | Yes | `postgresql://wearid_user:mock_pass_local@localhost:5432/wearid_test` | PostgreSQL connection string (or `sqlite::memory:` in unit test mode). |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `http://localhost:54321` | Supabase local development API endpoint. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `mock_supabase_anon_jwt_key_for_testing` | Public client anonymous Supabase key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `mock_supabase_service_role_secret_key` | Server-only Supabase service key. |
| `JWT_SECRET` | Yes | `mock_jwt_secret_key_wearid_sandbox_2026_deterministic` | Secret for user session and identity tokens. |
| `JWT_EXPIRES_IN` | No | `7d` | Default token validity period. |
| `BIOMETRIC_ENCRYPTION_KEY` | Yes | `mock_hex_key_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef` | 256-bit AES key for resting encryption of raw anatomical metrics. |
| `SOVEREIGN_PASSPORT_SALT` | Yes | `mock_passport_salt_wearid_identity_everywhere` | Key derivation salt for sovereign identity hashing. |
| `RETAILER_SANDBOX_API_KEY` | No | `wearid_retailer_sandbox_test_key_abc123` | Mock API key for testing the third-party embed widget. |
| `DATA_PROVENANCE_SIGNING_KEY`| Yes | `mock_provenance_signer_test_key_ed25519` | Key used to sign verified brand sizing table ingestion records. |
| `ENABLE_MOCK_DATASET` | Yes | `true` | When true, seeds verified benchmark garments (e.g., standard t-shirts, selvedge denim) for testing. |

---

## 3. `.env.example` Template Block

Copy this content into `.env.local` or `.env.test` for local agent testing:

```ini
# ==============================================================================
# WearID — Local Development & Autonomous Agent Testing Configuration
# ==============================================================================

NODE_ENV=test
PORT=3000
WEARID_API_URL=http://localhost:3000/api/v1

# Persistence (SQLite in-memory supported for test runs, Postgres for full local stack)
DATABASE_URL=sqlite::memory:
DB_POOL_MIN=1
DB_POOL_MAX=5

# Authentication & Cryptographic Keys (Mocked for Safe Execution)
JWT_SECRET=wearid_test_jwt_secret_dev_32_bytes_min_mock!
JWT_EXPIRES_IN=24h
BIOMETRIC_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
SOVEREIGN_PASSPORT_SALT=wearid_salt_mock_for_testing_purposes_only

# Retailer Partner Integration Mocks
RETAILER_SANDBOX_API_KEY=wearid_partner_test_key_xyz987
RETAILER_WEBHOOK_SECRET=mock_webhook_secret_for_retailer_callbacks

# Feature Flags & Test Fixtures
ENABLE_MOCK_DATASET=true
STRICT_INVARIANT_CHECKS=true
LOG_LEVEL=info
```

---

## 4. Mock Service Adapters

To prevent external network dependency during agent test cycles:

### 4.1 Mock Retailer Catalog Provider
- Location: `src/testing/mocks/mockRetailerCatalog.ts`
- Purpose: Simulates external retailer garment queries without making live HTTP requests to third-party e-commerce stores.
- Behavior: Returns standardized benchmark garments with verifiable dimensions in canonical `mm`.

### 4.2 Mock Provenance Verifier
- Location: `src/testing/mocks/mockProvenanceVerifier.ts`
- Purpose: Simulates digital signatures and source corroboration for test sizing charts without needing live web crawl permissions.

### 4.3 In-Memory Persistence Adapter
- When `DATABASE_URL=sqlite::memory:`, the database repository initializes in-memory tables with automated migrations, guaranteeing isolated, stateless test executions that never corrupt external databases.
