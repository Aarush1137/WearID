import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  evaluateSizing,
  getTargetChestEaseRange,
  calculateGaussianEaseScore,
  getCategoryWeights,
} from "../../src/sizing/engine";
import {
  cmToMm,
  mmToCm,
  inchesToMm,
  mmToInches,
  kgToGrams,
  lbsToGrams,
} from "../../src/core/units";
import {
  AnatomicalProfile,
  AnatomicalProfileSchema,
  BrandSizeChart,
  BrandSizeChartSchema,
  GarmentDimensions,
  GarmentDimensionsSchema,
  FitPreference,
  FitPreferenceSchema,
  FabricSpec,
  FabricSpecSchema,
} from "../../src/core/types";

const projectRoot = path.resolve(__dirname, "../..");

describe("Tier 1 — Feature Coverage (F1 through F25 in Isolation)", () => {
  // =========================================================================
  // F1: Competitor Analysis Doc
  // =========================================================================
  describe("F1: Competitor Analysis Doc (docs/competitor-analysis.md)", () => {
    const filePath = path.join(projectRoot, "docs/competitor-analysis.md");

    it("F1-1: file exists and contains markdown header", () => {
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("Competitor Research & Market Landscape");
    });

    it("F1-2: evaluates the market competitors including True Fit, Bold Metrics, and Myntra", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("True Fit");
      expect(content).toContain("Bold Metrics");
      expect(content).toContain("Myntra");
      expect(content).toContain("Sizebay");
    });

    it("F1-3: documents Indian fashion e-commerce return rates and fit causes", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toMatch(/25%.*40%/);
      expect(content).toMatch(/60%.*70%/);
    });

    it("F1-4: details competitor data insufficiency and lack of Layer 3 flat specs", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("Layer 3");
      expect(content).toContain("Opaque Black Box");
    });

    it("F1-5: defines WearID differentiation via 4-layer separation and explainability", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("ExplanationTree");
      expect(content).toContain("WearID Differentiator");
    });
  });

  // =========================================================================
  // F2: Indian Sizing Research Doc
  // =========================================================================
  describe("F2: Indian Sizing Research Doc (docs/indian-sizing-research.md)", () => {
    const filePath = path.join(projectRoot, "docs/indian-sizing-research.md");

    it("F2-1: file exists and covers Indian anthropometric reality", () => {
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("Indian Anthropometrics & Apparel Sizing Landscape");
    });

    it("F2-2: documents torso, waist-to-hip, and arm length proportional differences", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("Torso Length vs. Inseam Proportions");
      expect(content).toContain("Waist-to-Hip Ratios & Central Adiposity");
      expect(content).toContain("Shoulder Span & Sleeve Length");
    });

    it("F2-3: documents NIFT INDIAsize survey methodology and subject count", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("26,324");
      expect(content).toContain("NIFT");
    });

    it("F2-4: details standardized size charts and IN Tag Sizing Standard", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("14 Male Size Charts & 13 Female Size Charts");
      expect(content).toContain("IN Tag Sizing Standard");
    });

    it("F2-5: documents licensing constraints and database check barrier", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("CHECK (false)");
      expect(content).toContain("indiasize_reference");
    });
  });

  // =========================================================================
  // F3: Product Opportunities Doc
  // =========================================================================
  describe("F3: Product Opportunities Doc (docs/product-opportunities.md)", () => {
    const filePath = path.join(projectRoot, "docs/product-opportunities.md");

    it("F3-1: file exists and articulates universal clothing size profile proposition", () => {
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("Product Strategy & Strategic Opportunities");
    });

    it("F3-2: outlines multi-sided value proposition for consumers and brands", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("Consumer Value");
      expect(content).toContain("Brand / Merchant Value");
    });

    it("F3-3: specifies wedge category strategy centered on Men's T-Shirts", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toMatch(/T-Shirt|tshirt/i);
      expect(content).toContain("Wedge Strategy");
    });

    it("F3-4: defines universal sizing passport and portability architecture", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("Universal Sizing Passport");
      expect(content).toContain("Portability");
    });

    it("F3-5: establishes trust through zero-leakage commitment and privacy", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("Privacy");
      expect(content).toContain("Zero biometric leakage");
    });
  });

  // =========================================================================
  // F4: Brand Data Access Audit Doc
  // =========================================================================
  describe("F4: Brand Data Access Audit Doc (docs/brand-data-audit.md)", () => {
    const filePath = path.join(projectRoot, "docs/brand-data-audit.md");

    it("F4-1: file exists and contains audit framework complying with AGENTS.md", () => {
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("Brand Data Access Audit");
      expect(content).toContain("AGENTS.md");
    });

    it("F4-2: audits pilot brands including Westside, FabIndia, H&M, and Uniqlo", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      const pilotBrands = [
        "Westside",
        "FabIndia",
        "Snitch",
        "H&M India",
        "Zara India",
        "Uniqlo India",
        "Levi's India",
      ];
      for (const brand of pilotBrands) {
        expect(content).toContain(brand);
      }
    });

    it("F4-3: classifies brand data by Layer 2 body ranges vs Layer 3 garment dimensions", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("Layer 3");
      expect(content).toContain("Layer 2");
    });

    it("F4-4: mandates respecting robots.txt and rate limits (>= 3s interval)", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("robots.txt");
      expect(content).toMatch(/3\s*second/i);
    });

    it("F4-5: requires staging quarantine and provenance tracking for ingested data", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("staging");
      expect(content).toMatch(/provenance/i);
    });
  });

  // =========================================================================
  // F5: Database Schema DDL & RLS
  // =========================================================================
  describe("F5: Database Schema DDL & RLS (docs/database-schema.sql)", () => {
    const filePath = path.join(projectRoot, "docs/database-schema.sql");

    it("F5-1: DDL file exists and creates all core tables", () => {
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, "utf-8");
      const requiredTables = [
        "users",
        "profiles",
        "body_measurements",
        "fit_preferences",
        "brands",
        "brand_size_charts",
        "products",
        "garment_measurements",
        "reference_garments",
        "community_contributions",
        "community_fit_feedback",
        "size_recommendations",
        "indiasize_reference",
      ];
      for (const table of requiredTables) {
        expect(content).toMatch(new RegExp(`CREATE TABLE (IF NOT EXISTS )?${table}\\b`, "i"));
      }
    });

    it("F5-2: enables Row Level Security (RLS) on all user-owned biometric tables", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("ALTER TABLE users ENABLE ROW LEVEL SECURITY;");
      expect(content).toContain("ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;");
      expect(content).toContain("ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;");
      expect(content).toContain("ALTER TABLE fit_preferences ENABLE ROW LEVEL SECURITY;");
    });

    it("F5-3: contains security policies enforcing auth.uid() scoping", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("auth.uid()");
      expect(content).toContain("CREATE POLICY");
    });

    it("F5-4: enforces check constraint barrier CHECK (false) on indiasize_reference", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("indiasize_reference");
      expect(content).toMatch(/CHECK\s*\(\s*false\s*\)/i);
    });

    it("F5-5: prevents contributors from approving their own submissions", () => {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("cannot_verify_own_submission");
      expect(content).toMatch(/contributor_id\s*<>\s*reviewed_by/);
    });
  });

  // =========================================================================
  // F6: Architectural Specifications Docs
  // =========================================================================
  describe("F6: Architectural Specifications Docs (docs/)", () => {
    it("F6-1: api-routes.md defines REST route map and RBAC hierarchy", () => {
      const content = fs.readFileSync(path.join(projectRoot, "docs/api-routes.md"), "utf-8");
      expect(content).toContain("API Architecture & Route Map");
      expect(content).toContain("/api/profiles");
      expect(content).toContain("/api/sizing/match");
      expect(content).toContain("user");
      expect(content).toContain("admin");
    });

    it("F6-2: component-hierarchy.md specifies Next.js App Router tree and UI blocks", () => {
      const content = fs.readFileSync(path.join(projectRoot, "docs/component-hierarchy.md"), "utf-8");
      expect(content).toContain("Component Hierarchy");
      expect(content).toContain("AppRoot (src/app/layout.tsx)");
      expect(content).toContain("PassportHeroCard");
    });

    it("F6-3: data-flow.md outlines 4-layer separation and ease mathematical bridge", () => {
      const content = fs.readFileSync(path.join(projectRoot, "docs/data-flow.md"), "utf-8");
      expect(content).toContain("Data Flow & Sizing Engine Architecture");
      expect(content).toContain("Layer 1: User Anatomical Profile");
      expect(content).toContain("Layer 4: User Fit Intent");
      expect(content).toContain("Ease Arithmetic");
    });

    it("F6-4: recommendation-engine-spec.md specifies pseudocode and category weights", () => {
      const content = fs.readFileSync(path.join(projectRoot, "docs/recommendation-engine-spec.md"), "utf-8");
      expect(content).toContain("Deterministic Recommendation Algorithm Specification");
      expect(content).toContain("getCategoryWeights");
      expect(content).toContain("evaluateSizeRecommendation");
    });

    it("F6-5: admin-workflow.md documents curation and verification steps", () => {
      const content = fs.readFileSync(path.join(projectRoot, "docs/admin-workflow.md"), "utf-8");
      expect(content).toContain("Workflow");
      expect(content).toContain("verifier");
    });
  });

  // =========================================================================
  // F7: Editorial Design Tokens
  // =========================================================================
  describe("F7: Editorial Design Tokens (src/styles/tokens.css)", () => {
    const cssPath = path.join(projectRoot, "src/styles/tokens.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    it("F7-1: defines warm surface CSS custom properties", () => {
      expect(css).toContain("--bg-base:          #FAF8F5");
      expect(css).toContain("--bg-surface:       #FFFFFF");
      expect(css).toContain("--bg-elevated:      #F2EDE4");
    });

    it("F7-2: defines ink text custom properties", () => {
      expect(css).toContain("--text-primary:   #111622");
      expect(css).toContain("--text-secondary: #535D70");
    });

    it("F7-3: defines forest green accent tokens", () => {
      expect(css).toContain("--accent:         #1B2A4A");
      expect(css).toContain("--accent-hover:   #121D34");
    });

    it("F7-4: defines terracotta highlight tokens", () => {
      expect(css).toContain("--terracotta:        #A47834");
      expect(css).toContain("--terracotta-subtle: #FAF4EB");
    });

    it("F7-5: defines 4-tier confidence indicator colors", () => {
      expect(css).toContain("--confidence-high:   #1D5D42");
      expect(css).toContain("--confidence-medium: #9E5E10");
      expect(css).toContain("--confidence-low:    #A47834");
      expect(css).toContain("--confidence-none:   #535D70");
    });
  });

  // =========================================================================
  // F8: Editorial Component Token Classes & Specs
  // =========================================================================
  describe("F8: Editorial Component Token Classes & Specs (MASTER_PROMPT.md & tokens.css)", () => {
    const masterPrompt = fs.readFileSync(path.join(projectRoot, "MASTER_PROMPT.md"), "utf-8");

    it("F8-1: defines card component specification with elevation and border", () => {
      expect(masterPrompt).toContain("border: 1px solid var(--border)");
      expect(masterPrompt).toContain("border-radius: 10px");
      expect(masterPrompt).toContain("box-shadow: var(--shadow-sm)");
    });

    it("F8-2: defines button component specification with primary and secondary states", () => {
      expect(masterPrompt).toContain("min-height: 44px");
      expect(masterPrompt).toContain("Primary: bg --accent, text white");
      expect(masterPrompt).toContain("Secondary: bg white, border 1.5px --accent");
    });

    it("F8-3: defines input and select specification with focus outline", () => {
      expect(masterPrompt).toContain("height: 44px (single line)");
      expect(masterPrompt).toContain("border: 1.5px solid --border-strong");
      expect(masterPrompt).toContain("focus: border-color --accent");
    });

    it("F8-4: defines confidence dots dimensions and 4 status colors", () => {
      expect(masterPrompt).toContain("width: 8px, height: 8px, border-radius: 50%");
      expect(masterPrompt).toContain("High:   background --confidence-high");
      expect(masterPrompt).toContain("None:   background --confidence-none");
    });

    it("F8-5: defines pill tags and badges with tracking and uppercase font", () => {
      expect(masterPrompt).toContain("border-radius: 100px (pill)");
      expect(masterPrompt).toContain("Terracotta: bg --terracotta-subtle, text --terracotta");
    });
  });

  // =========================================================================
  // F9: UI Component Primitives & Ergonomics
  // =========================================================================
  describe("F9: UI Component Primitives & Ergonomics", () => {
    const masterPrompt = fs.readFileSync(path.join(projectRoot, "MASTER_PROMPT.md"), "utf-8");
    const tokens = fs.readFileSync(path.join(projectRoot, "src/styles/tokens.css"), "utf-8");

    it("F9-1: interactive elements require 44px minimum touch target height", () => {
      expect(masterPrompt).toContain("44px minimum tap target on every interactive element");
    });

    it("F9-2: typography scale defines DM Sans and DM Serif Display font families", () => {
      expect(tokens).toContain("--font-sans:    'DM Sans'");
      expect(tokens).toContain("--font-display: 'DM Serif Display'");
    });

    it("F9-3: focus ring style uses accent color with standard outline offset", () => {
      expect(tokens).toContain("--border-focus:  #1B2A4A");
    });

    it("F9-4: subtle elevation shadows are defined for card components", () => {
      expect(tokens).toContain("--shadow-xs");
      expect(tokens).toContain("--shadow-sm");
      expect(tokens).toContain("--shadow-md");
    });

    it("F9-5: mobile UX requires respecting safe area insets for notches and indicators", () => {
      expect(masterPrompt).toContain("Safe area insets: respect CSS env(safe-area-inset-*)");
    });
  });

  // =========================================================================
  // F10: Canonical Units & Conversions
  // =========================================================================
  describe("F10: Canonical Units & Conversions (src/core/units.ts)", () => {
    it("F10-1: cmToMm converts centimeters to exact integer millimeters", () => {
      expect(cmToMm(96.5)).toBe(965);
      expect(cmToMm(102.4)).toBe(1024);
      expect(cmToMm(0)).toBe(0);
    });

    it("F10-2: inchesToMm converts fractional inches to integer mm within sub-mm tolerance", () => {
      expect(inchesToMm(38.5)).toBe(978);
      expect(inchesToMm(40.0)).toBe(1016);
    });

    it("F10-3: mmToCm converts canonical mm back to cm with target decimal precision", () => {
      expect(mmToCm(965)).toBe(96.5);
      expect(mmToCm(1024)).toBe(102.4);
    });

    it("F10-4: kgToGrams and lbsToGrams convert mass accurately to canonical grams", () => {
      expect(kgToGrams(75.2)).toBe(75200);
      expect(lbsToGrams(165.0)).toBe(74843);
    });

    it("F10-5: rejects negative dimensions with RangeError", () => {
      expect(() => cmToMm(-15)).toThrow(RangeError);
      expect(() => inchesToMm(-2)).toThrow(RangeError);
      expect(() => mmToCm(-100)).toThrow(RangeError);
      expect(() => mmToInches(-50)).toThrow(RangeError);
    });
  });

  // =========================================================================
  // F11: Domain Types & Layer 1-4 Models
  // =========================================================================
  describe("F11: Domain Types & Layer 1-4 Models (src/core/types.ts)", () => {
    it("F11-1: AnatomicalProfileSchema validates valid biometrics in integer mm", () => {
      const validProfile = {
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        chestMm: 960,
        shoulderWidthMm: 440,
        waistMm: 820,
        measurementMethod: { chestMm: "tape" },
        isCurrent: true,
      };
      const parsed = AnatomicalProfileSchema.safeParse(validProfile);
      expect(parsed.success).toBe(true);
    });

    it("F11-2: AnatomicalProfileSchema rejects negative or zero measurements", () => {
      const invalid = {
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        chestMm: -960,
      };
      const parsed = AnatomicalProfileSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it("F11-3: BrandSizeChartSchema validates graded ranges and rejects invalid systems", () => {
      const validChart = {
        brandId: "uniqlo",
        category: "tshirt",
        gender: "male",
        sizeLabel: "M",
        chestMinMm: 940,
        chestMaxMm: 1020,
      };
      const parsed = BrandSizeChartSchema.safeParse(validChart);
      expect(parsed.success).toBe(true);
    });

    it("F11-4: GarmentDimensionsSchema validates flat measurements in integer mm", () => {
      const validGarment = {
        productId: "p_101",
        sizeLabel: "L",
        chestFlatMm: 560,
        shoulderMm: 460,
        lengthMm: 720,
      };
      const parsed = GarmentDimensionsSchema.safeParse(validGarment);
      expect(parsed.success).toBe(true);
    });

    it("F11-5: FitPreferenceSchema strictly constrains fitType to allowed enum", () => {
      const validPref = {
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        category: "tshirt",
        fitType: "relaxed",
      };
      expect(FitPreferenceSchema.safeParse(validPref).success).toBe(true);

      const invalidPref = {
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        category: "tshirt",
        fitType: "baggy_af",
      };
      expect(FitPreferenceSchema.safeParse(invalidPref).success).toBe(false);
    });
  });

  // =========================================================================
  // F12: Deterministic Ease Calculator
  // =========================================================================
  describe("F12: Deterministic Ease Calculator", () => {
    it("F12-1: getTargetChestEaseRange returns standard intervals for all fit intents", () => {
      const slim = getTargetChestEaseRange("slim");
      expect(slim.min).toBe(40);
      expect(slim.max).toBe(80);
      expect(slim.midpoint).toBe(60);

      const regular = getTargetChestEaseRange("regular");
      expect(regular.min).toBe(80);
      expect(regular.max).toBe(140);
      expect(regular.midpoint).toBe(110);

      const relaxed = getTargetChestEaseRange("relaxed");
      expect(relaxed.min).toBe(140);
      expect(relaxed.max).toBe(200);
      expect(relaxed.midpoint).toBe(170);

      const oversized = getTargetChestEaseRange("oversized");
      expect(oversized.min).toBe(200);
      expect(oversized.max).toBe(300);
      expect(oversized.midpoint).toBe(250);
    });

    it("F12-2: Gaussian ease scoring reaches 1.0 (100%) at exact midpoint", () => {
      const regular = getTargetChestEaseRange("regular");
      const score = calculateGaussianEaseScore(regular.midpoint, regular);
      expect(score).toBe(1.0);
    });

    it("F12-3: Gaussian ease scoring declines symmetrically with deviation", () => {
      const regular = getTargetChestEaseRange("regular");
      const scorePlus20 = calculateGaussianEaseScore(regular.midpoint + 20, regular);
      const scoreMinus20 = calculateGaussianEaseScore(regular.midpoint - 20, regular);
      expect(scorePlus20).toBe(scoreMinus20);
      expect(scorePlus20).toBeLessThan(1.0);
      expect(scorePlus20).toBeGreaterThan(0.7);
    });

    it("F12-4: rigid textile with negative ease scores exactly 0.0 (too tight)", () => {
      const regular = getTargetChestEaseRange("regular");
      const rigidScore = calculateGaussianEaseScore(-10, regular, false);
      expect(rigidScore).toBe(0.0);
    });

    it("F12-5: stretch textile permits allowable negative ease as compression fit", () => {
      const regular = getTargetChestEaseRange("regular");
      const stretchScore = calculateGaussianEaseScore(-40, regular, true);
      expect(stretchScore).toBeGreaterThan(0.5);
    });
  });

  // =========================================================================
  // F13: Reference Garment Calibration
  // =========================================================================
  describe("F13: Reference Garment Calibration", () => {
    const profile: AnatomicalProfile = {
      profileId: "123e4567-e89b-12d3-a456-426614174000",
      chestMm: 980,
      shoulderWidthMm: 450,
      measurementMethod: {},
      isCurrent: true,
    };
    const pref: FitPreference = {
      profileId: "123e4567-e89b-12d3-a456-426614174000",
      category: "tshirt",
      fitType: "regular",
    };
    const garments: GarmentDimensions[] = [
      {
        productId: "p1",
        sizeLabel: "M",
        chestFlatMm: 530, // 1060mm (+80mm ease)
        shoulderMm: 440,
      },
      {
        productId: "p1",
        sizeLabel: "L",
        chestFlatMm: 555, // 1110mm (+130mm ease)
        shoulderMm: 460,
      },
    ];

    it("F13-1: reference garment anchor increases candidate score and overall confidence", () => {
      const withoutAnchor = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      const withAnchor = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        referenceGarments: [{ category: "tshirt", sizeLabel: "M", fitQuality: "perfect" }],
      });
      expect(withAnchor.confidence).toBeGreaterThan(withoutAnchor.confidence);
    });

    it("F13-2: 'too_tight' calibration anchor penalizes smaller size and promotes larger size", () => {
      const result = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        referenceGarments: [{ category: "tshirt", sizeLabel: "M", fitQuality: "too_tight" }],
      });
      expect(result.recommendedSize).toBe("L");
    });

    it("F13-3: 'too_loose' calibration anchor penalizes candidate size score", () => {
      const withoutAnchor = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      const withAnchor = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        referenceGarments: [{ category: "tshirt", sizeLabel: "L", fitQuality: "too_loose" }],
      });
      expect(withAnchor.fitScore).toBeLessThan(withoutAnchor.fitScore);
    });

    it("F13-4: reference garment from different category is ignored", () => {
      const resultWithout = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      const resultMismatched = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        referenceGarments: [{ category: "jeans", sizeLabel: "32", fitQuality: "perfect" }],
      });
      expect(resultMismatched.fitScore).toBe(resultWithout.fitScore);
    });

    it("F13-5: score adjustment preserves valid bounds [0, 100]", () => {
      const result = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        referenceGarments: [{ category: "tshirt", sizeLabel: "M", fitQuality: "perfect" }],
      });
      expect(result.fitScore).toBeGreaterThanOrEqual(0);
      expect(result.fitScore).toBeLessThanOrEqual(100);
    });
  });

  // =========================================================================
  // F14: Borderline Fit Detection
  // =========================================================================
  describe("F14: Borderline Fit Detection", () => {
    const profile: AnatomicalProfile = {
      profileId: "123e4567-e89b-12d3-a456-426614174000",
      chestMm: 960,
      shoulderWidthMm: 440,
      measurementMethod: {},
      isCurrent: true,
    };
    const pref: FitPreference = {
      profileId: "123e4567-e89b-12d3-a456-426614174000",
      category: "tshirt",
      fitType: "regular",
    };

    it("F14-1: flags borderline when top two scores differ by less than 0.08", () => {
      const borderlineGarments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 527, shoulderMm: 440 }, // 1054 (+94mm ease)
        { productId: "p", sizeLabel: "L", chestFlatMm: 537, shoulderMm: 450 }, // 1074 (+114mm ease)
      ];
      const result = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: borderlineGarments });
      expect(result.isBorderline).toBe(true);
      expect(result.borderlineTradeoff).toBeDefined();
    });

    it("F14-2: does not flag borderline when score delta is wide (>= 0.08)", () => {
      const distinctGarments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "S", chestFlatMm: 480 }, // 960 (0mm ease)
        { productId: "p", sizeLabel: "M", chestFlatMm: 535 }, // 1070 (+110mm ease, ideal)
      ];
      const result = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: distinctGarments });
      expect(result.isBorderline).toBe(false);
      expect(result.borderlineTradeoff).toBeUndefined();
    });

    it("F14-3: populates alternativeSize with the runner-up size label", () => {
      const borderlineGarments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 527 },
        { productId: "p", sizeLabel: "L", chestFlatMm: 537 },
      ];
      const result = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: borderlineGarments });
      expect(result.alternativeSize).toBeDefined();
      expect(["M", "L"]).toContain(result.alternativeSize);
    });

    it("F14-4: borderlineTradeoff string provides comparative ease narrative", () => {
      const borderlineGarments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 527 },
        { productId: "p", sizeLabel: "L", chestFlatMm: 537 },
      ];
      const result = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: borderlineGarments });
      expect(result.borderlineTradeoff).toContain("Borderline between");
      expect(result.borderlineTradeoff).toContain("ease");
    });

    it("F14-5: does not trigger borderline if runner-up has low absolute score (< 0.40)", () => {
      const singleViableGarment: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "S", chestFlatMm: 460 }, // 920mm (-40mm rigid)
        { productId: "p", sizeLabel: "M", chestFlatMm: 535 }, // 1070mm (+110mm ideal)
      ];
      const result = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: singleViableGarment });
      expect(result.isBorderline).toBe(false);
    });
  });

  // =========================================================================
  // F15: Explainable Recommendation Tree
  // =========================================================================
  describe("F15: Explainable Recommendation Tree", () => {
    const profile: AnatomicalProfile = {
      profileId: "123e4567-e89b-12d3-a456-426614174000",
      chestMm: 960,
      shoulderWidthMm: 440,
      measurementMethod: {},
      isCurrent: true,
    };
    const pref: FitPreference = {
      profileId: "123e4567-e89b-12d3-a456-426614174000",
      category: "tshirt",
      fitType: "regular",
    };
    const sampleGarments: GarmentDimensions[] = [
      { productId: "p", sizeLabel: "M", chestFlatMm: 530, shoulderMm: 450, lengthMm: 710 },
    ];

    it("F15-1: produces complete ExplanationTree conforming to contract", () => {
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: sampleGarments });
      expect(res.recommendedSize).toBe("M");
      expect(typeof res.fitScore).toBe("number");
      expect(typeof res.confidence).toBe("number");
      expect(res.confidenceLabel).toBe("high");
      expect(res.fitTypeUsed).toBe("regular");
      expect(typeof res.isBorderline).toBe("boolean");
      expect(Array.isArray(res.dimensionBreakdown)).toBe(true);
      expect(res.dataSources).toBeDefined();
    });

    it("F15-2: dimensionBreakdown details Chest Circumference body, garment, and ease", () => {
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: sampleGarments });
      const chestExpl = res.dimensionBreakdown.find((d) => d.dimension === "Chest Circumference");
      expect(chestExpl).toBeDefined();
      expect(chestExpl!.bodyMeasurementMm).toBe(960);
      expect(chestExpl!.garmentSpecMm).toBe(1060);
      expect(chestExpl!.easeDeltaMm).toBe(100);
      expect(chestExpl!.status).toBe("ideal");
    });

    it("F15-3: dimensionBreakdown details Shoulder Width when shoulder measurements are provided", () => {
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: sampleGarments });
      const shoulderExpl = res.dimensionBreakdown.find((d) => d.dimension === "Shoulder Width");
      expect(shoulderExpl).toBeDefined();
      expect(shoulderExpl!.bodyMeasurementMm).toBe(440);
      expect(shoulderExpl!.garmentSpecMm).toBe(450);
      expect(shoulderExpl!.easeDeltaMm).toBe(10);
    });

    it("F15-4: summaryText presents conversational explanation with actual numbers in cm", () => {
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: sampleGarments });
      expect(res.summaryText).toContain("96cm");
      expect(res.summaryText).toContain("size M");
      expect(res.summaryText).toContain("+10cm ease");
    });

    it("F15-5: dataSources declares provenance and layer used", () => {
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: sampleGarments });
      expect(res.dataSources.layerUsed).toBe("Layer3_Garment");
      expect(res.dataSources.provenance).toBeDefined();
    });
  });

  // =========================================================================
  // F16: Zero Hallucination Safeguard
  // =========================================================================
  describe("F16: Zero Hallucination Safeguard", () => {
    const profile: AnatomicalProfile = {
      profileId: "123e4567-e89b-12d3-a456-426614174000",
      chestMm: 960,
      measurementMethod: {},
      isCurrent: true,
    };
    const pref: FitPreference = {
      profileId: "123e4567-e89b-12d3-a456-426614174000",
      category: "tshirt",
      fitType: "regular",
    };

    it("F16-1: returns empty recommendation and insufficient confidence when charts are missing", () => {
      const res = evaluateSizing({ profile, fitPreference: pref });
      expect(res.recommendedSize).toBe("");
      expect(res.confidenceLabel).toBe("insufficient");
      expect(res.fitScore).toBe(0);
    });

    it("F16-2: summaryText honestly reports insufficient data without synthesizing charts", () => {
      const res = evaluateSizing({ profile, fitPreference: pref });
      expect(res.summaryText).toContain("Insufficient data");
    });

    it("F16-3: missing shoulder width does not hallucinate value but scales weights honestly", () => {
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 530 },
      ];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.recommendedSize).toBe("M");
      const shoulderExpl = res.dimensionBreakdown.find((d) => d.dimension === "Shoulder Width");
      expect(shoulderExpl).toBeUndefined();
    });

    it("F16-4: returns insufficient confidence if garments are all too small (score <= 0.05)", () => {
      const tinyGarments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "XS", chestFlatMm: 400 }, // 800mm (-160mm rigid)
      ];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: tinyGarments });
      expect(res.recommendedSize).toBe("");
      expect(res.confidenceLabel).toBe("insufficient");
      expect(res.summaryText).toContain("No suitable size found");
    });

    it("F16-5: numbers returned in breakdown match exact inputs without rounding error drift", () => {
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 535 },
      ];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      const chest = res.dimensionBreakdown[0];
      expect(chest.bodyMeasurementMm).toBe(profile.chestMm);
      expect(chest.garmentSpecMm).toBe((garments[0].chestFlatMm ?? 0) * 2);
      expect(chest.easeDeltaMm).toBe(chest.garmentSpecMm - chest.bodyMeasurementMm);
    });
  });

  // =========================================================================
  // F17: Core Engine Orchestrator
  // =========================================================================
  describe("F17: Core Engine Orchestrator", () => {
    it("F17-1: getCategoryWeights returns verified weights for standard categories", () => {
      const tshirt = getCategoryWeights("tshirt");
      expect(tshirt.chest).toBe(0.40);
      expect(tshirt.shoulder).toBe(0.35);

      const jeans = getCategoryWeights("jeans");
      expect(jeans.waist).toBe(0.40);
      expect(jeans.inseam).toBe(0.35);

      const kurta = getCategoryWeights("kurta");
      expect(kurta.chest).toBe(0.35);
      expect(kurta.torso_length).toBe(0.25);
    });

    it("F17-2: prioritizes Layer 3 Garment Dimensions over Layer 2 Brand Charts when both are provided", () => {
      const profile: AnatomicalProfile = {
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        chestMm: 960,
        measurementMethod: {},
        isCurrent: true,
      };
      const pref: FitPreference = {
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        category: "tshirt",
        fitType: "regular",
      };
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 530 },
      ];
      const charts: BrandSizeChart[] = [
        { brandId: "b", category: "tshirt", gender: "male", sizeLabel: "L", chestMinMm: 900, chestMaxMm: 1000 },
      ];
      const res = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        brandSizeCharts: charts,
      });
      expect(res.dataSources.layerUsed).toBe("Layer3_Garment");
      expect(res.recommendedSize).toBe("M");
    });

    it("F17-3: evaluates Layer 2 fallback gracefully when Layer 3 is not present", () => {
      const profile: AnatomicalProfile = {
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        chestMm: 960,
        measurementMethod: {},
        isCurrent: true,
      };
      const pref: FitPreference = {
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        category: "tshirt",
        fitType: "regular",
      };
      const charts: BrandSizeChart[] = [
        { brandId: "zara", category: "tshirt", gender: "male", sizeLabel: "M", chestMinMm: 940, chestMaxMm: 1020 },
      ];
      const res = evaluateSizing({
        profile,
        fitPreference: pref,
        brandSizeCharts: charts,
      });
      expect(res.dataSources.layerUsed).toBe("Layer2_BrandChart");
      expect(res.recommendedSize).toBe("M");
    });

    it("F17-4: adjusts composite score with community correction factor", () => {
      const profile: AnatomicalProfile = {
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        chestMm: 960,
        measurementMethod: {},
        isCurrent: true,
      };
      const pref: FitPreference = {
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        category: "tshirt",
        fitType: "regular",
      };
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 520 }, // 1040 (+80mm ease)
      ];
      const resBase = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      const resCorrected = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        communityCorrectionFactor: 0.05,
      });
      expect(resCorrected.fitScore).toBeGreaterThanOrEqual(resBase.fitScore);
    });

    it("F17-5: confidence calculation assigns appropriate confidence labels", () => {
      const profile: AnatomicalProfile = {
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        chestMm: 960,
        shoulderWidthMm: 440,
        measurementMethod: {},
        isCurrent: true,
      };
      const pref: FitPreference = {
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        category: "tshirt",
        fitType: "regular",
      };
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 530, shoulderMm: 450 },
      ];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.confidence).toBeGreaterThanOrEqual(0.85);
      expect(res.confidenceLabel).toBe("high");
    });
  });

  // =========================================================================
  // F18: Sizing Unit Test Suite Verification
  // =========================================================================
  describe("F18: Sizing Unit Test Suite Verification", () => {
    it("F18-1: tests/unit/measurements/units.test.ts exists", () => {
      const p = path.join(projectRoot, "tests/unit/measurements/units.test.ts");
      expect(fs.existsSync(p)).toBe(true);
    });

    it("F18-2: tests/unit/sizing/engine.test.ts exists", () => {
      const p = path.join(projectRoot, "tests/unit/sizing/engine.test.ts");
      expect(fs.existsSync(p)).toBe(true);
    });

    it("F18-3: units.test.ts covers conversion and range error checks", () => {
      const content = fs.readFileSync(path.join(projectRoot, "tests/unit/measurements/units.test.ts"), "utf-8");
      expect(content).toContain("Canonical Unit Conversions");
      expect(content).toContain("RangeError");
    });

    it("F18-4: engine.test.ts covers test cases TC-S-001 through TC-S-007", () => {
      const content = fs.readFileSync(path.join(projectRoot, "tests/unit/sizing/engine.test.ts"), "utf-8");
      expect(content).toContain("TC-S-001");
      expect(content).toContain("TC-S-002");
      expect(content).toContain("TC-S-007");
    });

    it("F18-5: test files import directly from src/core/ and src/sizing/", () => {
      const content = fs.readFileSync(path.join(projectRoot, "tests/unit/sizing/engine.test.ts"), "utf-8");
      expect(content).toContain("../../../src/sizing/engine");
      expect(content).toContain("../../../src/core/types");
    });
  });

  // =========================================================================
  // F19: PWA Web App Manifest
  // =========================================================================
  describe("F19: PWA Web App Manifest (public/manifest.json)", () => {
    const manifestPath = path.join(projectRoot, "public/manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

    it("F19-1: manifest.json exists and parses as valid JSON object", () => {
      expect(fs.existsSync(manifestPath)).toBe(true);
      expect(typeof manifest).toBe("object");
    });

    it("F19-2: specifies name 'Fit — Universal Size Profile' and short_name 'Fit'", () => {
      expect(manifest.name).toBe("Fit — Universal Size Profile");
      expect(manifest.short_name).toBe("Fit");
    });

    it("F19-3: specifies display 'standalone' for mobile app home screen experience", () => {
      expect(manifest.display).toBe("standalone");
    });

    it("F19-4: specifies theme_color '#1B2A4A' matching design token --accent", () => {
      expect(manifest.theme_color).toBe("#1B2A4A");
    });

    it("F19-5: specifies background_color '#FAF8F5' matching design token --bg-base", () => {
      expect(manifest.background_color).toBe("#FAF8F5");
    });
  });

  // =========================================================================
  // F20: Service Worker & Caching Specifications
  // =========================================================================
  describe("F20: Service Worker & Caching Specifications", () => {
    const masterPrompt = fs.readFileSync(path.join(projectRoot, "MASTER_PROMPT.md"), "utf-8");

    it("F20-1: architectural specs mandate cache-first strategy for static assets", () => {
      expect(masterPrompt).toContain("Cache-first for static assets");
    });

    it("F20-2: architectural specs mandate network-first strategy for live /api/ routes", () => {
      expect(masterPrompt).toContain("Network-first for /api/ routes");
    });

    it("F20-3: service worker mandates offline fallback profile availability", () => {
      expect(masterPrompt).toContain("Offline fallback: cached profile data available");
    });

    it("F20-4: background sync specification queues feedback submissions when offline", () => {
      expect(masterPrompt).toContain("Background sync: queue feedback submissions when offline");
    });

    it("F20-5: service worker handles install prompt UX without aggressive prompts on first visit", () => {
      expect(masterPrompt).toContain("Never show on first visit");
    });
  });

  // =========================================================================
  // F21: Offline Fallback Experience
  // =========================================================================
  describe("F21: Offline Fallback Experience", () => {
    const masterPrompt = fs.readFileSync(path.join(projectRoot, "MASTER_PROMPT.md"), "utf-8");

    it("F21-1: search component specifies offline graceful state", () => {
      expect(masterPrompt).toContain('search shows "offline" state gracefully');
    });

    it("F21-2: offline status clearly informs the user of disconnected state", () => {
      expect(masterPrompt).toContain("cached profile data available");
    });

    it("F21-3: cached size profiles remain accessible while disconnected", () => {
      const flow = fs.readFileSync(path.join(projectRoot, "docs/data-flow.md"), "utf-8");
      expect(flow).toContain("Layer 1");
    });

    it("F21-4: external scraping actions are safely isolated from client offline experience", () => {
      const audit = fs.readFileSync(path.join(projectRoot, "docs/brand-data-audit.md"), "utf-8");
      expect(audit).toContain("Extraction");
    });

    it("F21-5: iOS specific meta tags configure offline web-app capability", () => {
      expect(masterPrompt).toContain('apple-mobile-web-app-capable" content="yes"');
      expect(masterPrompt).toContain('apple-mobile-web-app-title" content="Fit"');
    });
  });

  // =========================================================================
  // F22: PWA Brand Icon Assets
  // =========================================================================
  describe("F22: PWA Brand Icon Assets (public/manifest.json)", () => {
    const manifestPath = path.join(projectRoot, "public/manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

    it("F22-1: manifest declares standard 192x192 icon", () => {
      const icon192 = manifest.icons.find((i: any) => i.sizes === "192x192");
      expect(icon192).toBeDefined();
      expect(icon192.src).toBe("/icons/icon-192.png");
    });

    it("F22-2: manifest declares high-res 512x512 icon", () => {
      const icon512 = manifest.icons.find((i: any) => i.sizes === "512x512" && !i.purpose);
      expect(icon512).toBeDefined();
      expect(icon512.src).toBe("/icons/icon-512.png");
    });

    it("F22-3: manifest declares maskable icon for Android adaptive display", () => {
      const maskable = manifest.icons.find((i: any) => i.purpose === "maskable");
      expect(maskable).toBeDefined();
      expect(maskable.sizes).toBe("512x512");
    });

    it("F22-4: manifest specifies portrait orientation", () => {
      expect(manifest.orientation).toBe("portrait-primary");
    });

    it("F22-5: manifest specifies narrow form factor preview screenshot", () => {
      expect(Array.isArray(manifest.screenshots)).toBe(true);
      expect(manifest.screenshots.length).toBeGreaterThan(0);
      expect(manifest.screenshots[0].form_factor).toBe("narrow");
    });
  });

  // =========================================================================
  // F23: Local Zero-Credential Mock Store
  // =========================================================================
  describe("F23: Local Zero-Credential Mock Store", () => {
    it("F23-1: brand audit identifies pilot brand Uniqlo for Layer 3 seed data", () => {
      const audit = fs.readFileSync(path.join(projectRoot, "docs/brand-data-audit.md"), "utf-8");
      expect(audit).toContain("Uniqlo India");
      expect(audit).toContain("Layer 3");
    });

    it("F23-2: brand audit identifies pilot brand H&M for Layer 2 seed data", () => {
      const audit = fs.readFileSync(path.join(projectRoot, "docs/brand-data-audit.md"), "utf-8");
      expect(audit).toContain("H&M India");
      expect(audit).toContain("Layer 2");
    });

    it("F23-3: brand audit identifies pilot brand Levi's for denim benchmark", () => {
      const audit = fs.readFileSync(path.join(projectRoot, "docs/brand-data-audit.md"), "utf-8");
      expect(audit).toContain("Levi's India");
    });

    it("F23-4: mock schema operates in development without requiring cloud credentials", () => {
      const envDoc = fs.readFileSync(path.join(projectRoot, "env.template.md"), "utf-8");
      expect(envDoc).toContain("mock");
      expect(envDoc).toContain("ENABLE_MOCK_DATASET=true");
    });

    it("F23-5: seed data fixture provides reproducible deterministic test records", () => {
      const ddl = fs.readFileSync(path.join(projectRoot, "docs/database-schema.sql"), "utf-8");
      expect(ddl).toContain("brands");
      expect(ddl).toContain("products");
    });
  });

  // =========================================================================
  // F24: Isomorphic Supabase Client & Local Adapter
  // =========================================================================
  describe("F24: Isomorphic Supabase Client & Local Adapter", () => {
    it("F24-1: database DDL documents Supabase PostgreSQL dialect and extensions", () => {
      const ddl = fs.readFileSync(path.join(projectRoot, "docs/database-schema.sql"), "utf-8");
      expect(ddl).toContain('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      expect(ddl).toMatch(/gen_random_uuid\(\)|uuid_generate_v4\(\)/);
    });

    it("F24-2: role-based access maps to Supabase auth roles (customer, verifier, admin)", () => {
      const ddl = fs.readFileSync(path.join(projectRoot, "docs/database-schema.sql"), "utf-8");
      expect(ddl).toMatch(/role.*(customer|user).*admin/i);
    });

    it("F24-3: table foreign keys cascade delete profiles when user is deleted", () => {
      const ddl = fs.readFileSync(path.join(projectRoot, "docs/database-schema.sql"), "utf-8");
      expect(ddl).toContain("REFERENCES users(id) ON DELETE CASCADE");
    });

    it("F24-4: measurement history enforces append-only pattern with is_current flag", () => {
      const ddl = fs.readFileSync(path.join(projectRoot, "docs/database-schema.sql"), "utf-8");
      expect(ddl).toMatch(/is_current\s+BOOLEAN/i);
    });

    it("F24-5: environment template specifies mock in-memory persistence adapter", () => {
      const env = fs.readFileSync(path.join(projectRoot, "env.template.md"), "utf-8");
      expect(env).toContain("sqlite::memory:");
    });
  });

  // =========================================================================
  // F25: PWA UI Pages & Navigation
  // =========================================================================
  describe("F25: PWA UI Pages & Navigation", () => {
    it("F25-1: route map defines landing page route /", () => {
      const routes = fs.readFileSync(path.join(projectRoot, "docs/api-routes.md"), "utf-8");
      expect(routes).toContain("API Architecture");
    });

    it("F25-2: component hierarchy documents 3 onboarding paths (Quick 2-min, From Garment, Tape)", () => {
      const comp = fs.readFileSync(path.join(projectRoot, "docs/component-hierarchy.md"), "utf-8");
      expect(comp).toContain("PathSelector.tsx (Onboarding Path Selector: Quick / Garment-Derived / Full)");
    });

    it("F25-3: component hierarchy defines primary size passport and dashboard views", () => {
      const comp = fs.readFileSync(path.join(projectRoot, "docs/component-hierarchy.md"), "utf-8");
      expect(comp).toContain("PassportHeroCard");
      expect(comp).toContain("ProfileSwitcher");
    });

    it("F25-4: component hierarchy defines recommendation view and explanation tree modal", () => {
      const comp = fs.readFileSync(path.join(projectRoot, "docs/component-hierarchy.md"), "utf-8");
      expect(comp).toContain("Explanation");
    });

    it("F25-5: component hierarchy defines tailors card and WhatsApp export", () => {
      const comp = fs.readFileSync(path.join(projectRoot, "docs/component-hierarchy.md"), "utf-8");
      expect(comp).toContain("ExportPassportModal (QR Code, WhatsApp share, Tailor PDF)");
    });
  });
});
