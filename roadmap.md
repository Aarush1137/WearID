# roadmap.md — Agent Execution Roadmap

> **WearID** — *Your clothing identity, everywhere.*  
> Isolated chronological milestones, vertical slice specifications, and phase exit criteria.

---

## 1. Roadmap Architecture & Execution Invariants

To keep autonomous agents focused and prevent out-of-order refactoring:
1. **Vertical Slice Progression:** Agents must only work on tasks within the currently active phase. Never start work on future phases until the current phase's exit criteria are verified.
2. **Test-First Completion:** A task or phase is not considered complete until all corresponding tests in [tests.md](file:///e:/Projects/WearID/tests.md) pass.
3. **Invariant Check:** Every milestone completion requires an audit against the 10 core invariants in [AGENTS.md](file:///e:/Projects/WearID/AGENTS.md).

---

## 2. Chronological Milestones

```mermaid
flowchart LR
    P1["Phase 1: Canonical Core & Sizing Engine"] --> P2["Phase 2: Persistence & Sovereign Auth"]
    P2 --> P3["Phase 3: Client Canvas & Explainability UI"]
    P3 --> P4["Phase 4: Retailer Widget (WearID Connect)"]
    P4 --> P5["Phase 5: Hardening & Multi-Source Staging"]
```

---

### Phase 1: Canonical Core & Deterministic Sizing Engine
- **Goal:** Establish the mathematical and algorithmic foundation of universal sizing in canonical units (`mm`, `g`) with zero database or network dependencies.
- **Assigned Agents:** `sizing-engine`, `qa-verification`
- **Milestone Slices:**
  - [x] **1.1 Scaffolding & Types:** TypeScript project setup with strict compiler options, linting rules, and directory layout (`src/core/`, `tests/`).
  - [x] **1.2 Domain Models:** Define `AnatomicalProfile`, `GarmentDimensions`, `EaseModel`, and `FabricSpec` with strict structural segregation.
  - [x] **1.3 Unit Normalizer:** Implement canonical conversion engine (`inches` $\leftrightarrow$ `mm`, `cm` $\leftrightarrow$ `mm`, `lbs` $\leftrightarrow$ `g`) with sub-millimeter precision.
  - [ ] **1.4 Ease & Fit Calculator:** Implement deterministic fit scoring based on wearing ease, design ease, fabric stretch, and negative ease penalties.
  - [ ] **1.5 Explainability Tree Generator:** Build the generator that creates human-readable and structured JSON explainability breakdowns.
  - [ ] **1.6 Verification:** Complete test suites `TC-U-001` through `TC-U-005`, `TC-D-001` through `TC-D-003`, and `TC-S-001` through `TC-S-005` in [tests.md](file:///e:/Projects/WearID/tests.md).
- **Phase Exit Criteria:** All core unit tests pass with >= 95% coverage; zero invented size charts; canonical `mm` enforced everywhere.

---

### Phase 2: Data Persistence, Provenance Pipeline & Sovereign Identity API
- **Goal:** Build the secure data storage, cryptographic passport identity, and provenance-tracked brand size chart ingestion layer.
- **Assigned Agents:** `backend-engineer`, `security-privacy`, `qa-verification`
- **Milestone Slices:**
  - [ ] **2.1 Database Schema & Migrations:** Implement tables for `users`, `anatomical_profiles`, `garments`, `garment_dimensions`, `brand_charts`, and `staged_contributions`.
  - [ ] **2.2 Biometric Privacy Layer:** Encrypt anatomical profiles at rest using AES-256; enforce private-by-default database queries.
  - [ ] **2.3 Provenance Ingestion Service:** Service that stores external sizing data with source URI, verification checksums, and license attribution.
  - [ ] **2.4 Contributor Staging Queue:** Implement `draft` $\rightarrow$ `pending_review` $\rightarrow$ `verified_published` workflow. Rejects unverified submissions from recommendation queries.
  - [ ] **2.5 Sovereign Sizing Token API:** Generate scoped, time-bound tokens for size matching without exposing raw biometric dimensions.
  - [ ] **2.6 Verification:** Execute test suites `TC-P-001` through `TC-P-003` and `TC-SEC-001` through `TC-SEC-003`.
- **Phase Exit Criteria:** Clean schema migrations; zero biometric leakage in API responses; provenance validation tests passing 100%.

---

### Phase 3: Client Canvas, Sizing Visualizer & Explainability UI
- **Goal:** Deliver an intuitive, responsive user interface allowing users to manage their WearID, input measurements with visual guidance, and inspect explainable sizing results.
- **Assigned Agents:** `frontend-engineer`, `sizing-engine`
- **Milestone Slices:**
  - [ ] **3.1 UI Design System & Component Library:** Tailwind-based responsive components following clean typography and accessible contrast (WCAG 2.1 AA).
  - [ ] **3.2 Interactive Measurement Input Canvas:** Step-by-step anatomical measurement input with visual body diagrams and instant unit conversion (`cm`/`in` display, canonical `mm` storage).
  - [ ] **3.3 Garment Fit & Ease Visualizer:** Interactive fit radar / zone gauge displaying ease deltas (chest, waist, sleeve, inseam) with color-coded tension zones.
  - [ ] **3.4 Explainability Panel:** Renders the `ExplanationTree` in clear, conversational prose with expandable technical breakdowns.
  - [ ] **3.5 Privacy & Sovereignty Dashboard:** Settings to control third-party permissions, generate WearID portable links, and execute full data export or deletion.
- **Phase Exit Criteria:** UI renders correctly across mobile/desktop; unit conversions in the UI preserve sub-millimeter precision; accessibility checks pass.

---

### Phase 4: Retailer Integration Widget ("WearID Connect")
- **Goal:** Enable third-party apparel websites to embed a one-click "Fit with WearID" button and receive instant, zero-knowledge sizing recommendations.
- **Assigned Agents:** `backend-engineer`, `frontend-engineer`, `security-privacy`
- **Milestone Slices:**
  - [ ] **4.1 Embeddable Client SDK:** Lightweight vanilla JS / iframe embed script (<25KB) for product pages.
  - [ ] **4.2 Zero-Knowledge Handshake Protocol:** Secure exchange between retailer product SKU and user WearID token.
  - [ ] **4.3 Retailer Sandbox & Mock Testbed:** Comprehensive mock storefront simulating live size recommendation interactions.
  - [ ] **4.4 Webhook Notification System:** Optional webhook for order fulfillment size confirmation without passing body measurements.
- **Phase Exit Criteria:** Embedded widget displays recommendations in <100ms; zero raw anatomical data transferred; mock retailer test suite passes.

---

### Phase 5: Hardening, Consensus Verification & Production Readiness
- **Goal:** Final security audits, multi-source corroboration consensus engine, and high-throughput performance optimization.
- **Assigned Agents:** `qa-verification`, `security-privacy`, `coordinator`
- **Milestone Slices:**
  - [ ] **5.1 Multi-Source Consensus Engine:** Algorithm to verify community garment submissions when corroborated by $\ge 3$ independent sources within 2% tolerance.
  - [ ] **5.2 Security & Penetration Audit:** Automated SAST scanning, rate-limiting, CSRF, and injection prevention.
  - [ ] **5.3 Performance & Load Testing:** Benchmarking sizing engine to guarantee <15ms execution time for single garment fit calculation.
  - [ ] **5.4 Final Invariant Certification:** Complete audit certifying all 10 invariants in `AGENTS.md` are enforced across all layers.
- **Phase Exit Criteria:** 100% test matrix passing; zero security vulnerabilities; full invariant certification signed off.
