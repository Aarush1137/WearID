# tests.md — Verification & Test Matrix

> **WearID** — *Your clothing identity, everywhere.*  
> Quality engineering, autonomous test verification protocols, and mathematical validation matrix.

---

## 1. Quality Gates & Autonomous Verification Rules

Every Antigravity agent executing code within the WearID repository must satisfy these mandatory quality gates before marking a task as complete:

1. **Compilation & Static Analysis:** Zero TypeScript / compiler errors and zero linter warnings (`lint:check`).
2. **Deterministic Arithmetic:** Sub-millimeter precision across all unit transformations; zero floating-point accumulation errors.
3. **Core Test Coverage:** >= 95% line coverage on core sizing modules (`src/core/`, `src/sizing/`) and 100% branch coverage on ease/grading algorithms.
4. **Invariant Assertion:** All test suites must explicitly assert satisfaction of the 10 rules from [AGENTS.md](file:///e:/Projects/WearID/AGENTS.md).
5. **No Skipped or Flaky Tests:** No `.skip`, `.only`, or nondeterministic timeouts in committed test suites.

---

## 2. Test Suites Matrix

### Matrix A: Measurement & Unit Conversion Suite
*Target: `tests/unit/measurements/`*

| Test ID | Test Scenario | Input Specification | Expected Outcome | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `TC-U-001` | Imperial to Canonical mm Conversion | `38.5 inches` | `977.9 mm` (or integer `978 mm` based on rounding mode) | Absolute difference < 0.01 mm |
| `TC-U-002` | Centimeter to Canonical mm Conversion | `102.4 cm` | `1024 mm` | Exact integer match |
| `TC-U-003` | Negative or Zero Dimension Rejection | `-15 mm`, `0 mm` for chest/waist | Validation Error thrown: `InvalidDimensionError` | Schema rejection at parsing boundary |
| `TC-U-004` | Mass / Weight Canonical Conversion | `165.5 lbs`, `75.2 kg` | Canonical grams (`g`): `75070 g`, `75200 g` | Precision within 1 gram |
| `TC-U-005` | Floating Point Round-Trip Integrity | `1000 iterations` of mm -> inch -> mm | Accumulated error <= 0.05 mm | Sub-millimeter stability |

---

### Matrix B: Anatomical vs. Garment Domain Segregation
*Target: `tests/unit/domain/`*

| Test ID | Test Scenario | Input Specification | Expected Outcome | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `TC-D-001` | Type Discrimination at Compile Time | Attempting to pass `GarmentDimensions` into `AnatomicalProfile` slot | TypeScript compilation fails | Zero type-coercion bypass |
| `TC-D-002` | Runtime Schema Validation | JSON payload mixing `pit_to_pit_flat` into `AnatomicalProfile` | Zod/Pydantic validation failure | Rejection with descriptive schema path error |
| `TC-D-003` | Explicit Ease Coupling Requirement | Direct comparison between body chest and garment chest without Ease Model | Method invocation rejected or forces `EaseModel` parameter | Cannot compare raw anatomical to garment directly |

---

### Matrix C: Sizing & Fit Matching Algorithm Suite
*Target: `tests/unit/sizing/`*

| Test ID | Test Scenario | Input Specification | Expected Outcome | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `TC-S-001` | Rigid Fabric Negative Ease Penalty | Chest: `1000 mm`, Shirt Pit-to-Pit: `490 mm` (Garment Chest = `980 mm`), Fabric: `100% Cotton (0% elastane)` | Fit Status: `Too Tight` (Fit Score: 0/100, Negative ease penalty applied) | Recommends size up; reports negative ease in explanation |
| `TC-S-002` | Stretch Knit Negative Ease Allowance | Chest: `1000 mm`, Base Layer Chest: `920 mm`, Fabric: `15% Spandex (stretch factor 1.25)` | Fit Status: `Fitted / Compression Fit` (Fit Score: 92/100) | Valid compression fit recognized; explanation details stretch utilization |
| `TC-S-003` | Boundary Crossover Determination | User Chest: `1020 mm`, Size M max: `1015 mm`, Size L min: `1020 mm` | Size L recommended with `Tailored` fit; Size M flagged as borderline | Boundary margin documented in explanation |
| `TC-S-004` | Fit Intent Modulation | User preference: `relaxed`; standard garment ease: `+40 mm` | Recommendation shifts up one size to achieve target `+80 mm` ease | Fit intent directly shifts score ranking |
| `TC-S-005` | Inseam & Rise Proportionality | Long torso / short leg ratio vs standard garment | Flags leg length discrepancy; offers hem/cuff advisory | Explanation highlights rise/inseam differential |

---

### Matrix D: Explainability Engine Suite
*Target: `tests/unit/explainability/`*

| Test ID | Test Scenario | Input Specification | Expected Outcome | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `TC-E-001` | Structured Explanation Generation | Any sizing match output | Output must include `ExplanationTree` with `breakdownByMeasurement`, `easeDelta`, `recommendationRationale` | Zero empty explanations; valid JSON and markdown summary |
| `TC-E-002` | Plain-English Readability | Size recommendation: Size L for Jacket | Human-readable string containing actual numbers: e.g. "Chest: 104cm with 8cm ease..." | Explanation contains verified numbers, no generic placeholders |

---

### Matrix E: Data Provenance & Contributor Staging Suite
*Target: `tests/integration/provenance/`*

| Test ID | Test Scenario | Input Specification | Expected Outcome | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `TC-P-001` | Rejection of Sizing Table Without Source | Ingestion payload lacking `source_uri` or `retrieved_at` | Ingestion pipeline throws `MissingProvenanceError` | Data not stored in database |
| `TC-P-002` | Unverified Contributor Isolation | Community contributor submits garment measurements | Item created with status `draft`/`pending_review` | Excluded from public recommendation queries |
| `TC-P-003` | Multi-Source Corroboration Promotion | 3 independent verified submissions match within 2% tolerance | Item promoted to `multi_source_corroborated` | Eligible for public recommendation pipeline |

---

### Matrix F: Security & Biometric Privacy Suite
*Target: `tests/integration/security/`*

| Test ID | Test Scenario | Input Specification | Expected Outcome | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `TC-SEC-001` | Private Profile Default | New user registration | `profile.visibility` defaults to `private` | Public query returns 403 Forbidden |
| `TC-SEC-002` | Third-Party Sizing Token Privacy Leak Check | Retailer calls `/api/v1/portability/match` with user sizing token | Response contains recommended size + fit confidence score; raw chest/waist/hip omitted | Zero raw anatomical values in payload |
| `TC-SEC-003` | Scraping Boundary Enforcement | Ingestion crawler encountering `Disallow: /sizing` in `robots.txt` | Crawler aborts with `RobotsPolicyViolationError` | Never attempts bypass |

---

## 3. Standard Verification Commands

Agents must run these standard commands to verify changes:

```bash
# 1. Type checking and linting
npm run typecheck
npm run lint

# 2. Complete unit test execution
npm test

# 3. Targeted sizing engine verification with coverage
npm test -- tests/unit/sizing --coverage

# 4. Invariant compliance validation
npm test -- tests/integration/invariants
```

---

## 4. Definition of Done (DoD) Checklist

Before committing changes or declaring a task complete, verify:
- [ ] All relevant test matrix items pass.
- [ ] No regression across existing tests.
- [ ] No hardcoded synthetic measurements or dummy reviews.
- [ ] All new functions and models adhere to canonical units (`mm`, `g`).
- [ ] All API contracts updated and documented in `architecture.md`.
- [ ] Changes align with current phase in `roadmap.md`.
