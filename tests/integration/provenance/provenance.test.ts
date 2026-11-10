import { describe, it, expect, beforeEach } from "vitest";
import { ProvenanceIngestionService } from "@/core/provenance/ingestionService";
import { StagingQueueService } from "@/core/provenance/stagingQueue";
import { MissingProvenanceError } from "@/core/persistence/schema";

describe("Matrix E: Data Provenance & Contributor Staging Suite", () => {
  let ingestionService: ProvenanceIngestionService;
  let stagingQueue: StagingQueueService;

  beforeEach(() => {
    ingestionService = new ProvenanceIngestionService();
    stagingQueue = new StagingQueueService();
  });

  // =========================================================================
  // TC-P-001: Rejection of Sizing Table Without Source
  // =========================================================================
  describe("TC-P-001: Ingestion without source_uri throws MissingProvenanceError", () => {
    it("throws MissingProvenanceError when sourceUri is undefined or empty for garment", () => {
      const rawHtml = "<table><tr><td>Size M</td><td>Chest 104cm</td></tr></table>";

      expect(() =>
        ingestionService.ingestGarment({
          brandId: "uniqlo",
          name: "AIRism Tee",
          category: "t_shirt",
          retrievedAt: new Date().toISOString(),
          rawContent: rawHtml,
          // sourceUri omitted
        })
      ).toThrow(MissingProvenanceError);
    });

    it("throws MissingProvenanceError when retrievedAt is missing for garment", () => {
      const rawHtml = "<table><tr><td>Size M</td><td>Chest 104cm</td></tr></table>";

      expect(() =>
        ingestionService.ingestGarment({
          brandId: "uniqlo",
          name: "AIRism Tee",
          category: "t_shirt",
          sourceUri: "https://www.uniqlo.com/in/en/products/E425974",
          rawContent: rawHtml,
          // retrievedAt omitted
        })
      ).toThrow(MissingProvenanceError);
    });

    it("throws MissingProvenanceError when sourceUri is missing for dimension record", () => {
      expect(() =>
        ingestionService.ingestDimensions({
          garmentId: "garment_123",
          sizeLabel: "M",
          chestFlatMm: 560,
          rawContent: "pit_to_pit: 56cm",
          retrievedAt: new Date().toISOString(),
          // sourceUri omitted
        })
      ).toThrow(MissingProvenanceError);
    });

    it("computes an actual, verifiable SHA-256 checksum on raw content payload", () => {
      const rawHtml = "<section>Size L Chest 108cm</section>";
      const record = ingestionService.ingestGarment({
        brandId: "uniqlo",
        name: "Supima Crew",
        category: "t_shirt",
        sourceUri: "https://www.uniqlo.com/in/en/products/E422990",
        retrievedAt: "2026-03-01T12:00:00Z",
        rawContent: rawHtml,
      });

      // Verify that the hash is a real sha256 hex string, not a hardcoded placeholder
      expect(record.provenance.verificationHash).toMatch(/^sha256-[a-f0-9]{64}$/);
      expect(record.provenance.verificationHash).toBe(
        ingestionService.computeVerificationHash(rawHtml)
      );
    });
  });

  // =========================================================================
  // TC-P-002: Unverified Contributor Isolation
  // =========================================================================
  describe("TC-P-002: Community submissions land in staging (not live catalog)", () => {
    it("assigns status 'pending_review' to community contributor submissions", () => {
      const communitySubmission = ingestionService.ingestDimensions({
        garmentId: "garment_westside_1",
        sizeLabel: "M",
        chestFlatMm: 540,
        shoulderMm: 460,
        sourceUri: "https://wearid.in/contribute/photo-tape-123.jpg",
        retrievedAt: new Date().toISOString(),
        rawContent: "photo-checksum-data",
        isCommunityContributor: true,
        contributorId: "user_contributor_aarush",
      });

      expect(communitySubmission.status).toBe("pending_review");
    });

    it("excludes unverified community submissions from public recommendation catalog queries", () => {
      const garmentId = "garment_snitch_oversized";

      // Official verified entry
      ingestionService.ingestDimensions({
        garmentId,
        sizeLabel: "S",
        chestFlatMm: 535,
        sourceUri: "https://snitch.co.in/products/oversized-t-shirt",
        retrievedAt: new Date().toISOString(),
        rawContent: "official-spec-data",
        isCommunityContributor: false,
      });

      // Community submission (pending review)
      ingestionService.ingestDimensions({
        garmentId,
        sizeLabel: "M",
        chestFlatMm: 565,
        sourceUri: "https://wearid.in/contribute/user_sub_456.jpg",
        retrievedAt: new Date().toISOString(),
        rawContent: "user-photo-data",
        isCommunityContributor: true,
        contributorId: "user_anonymous_9",
      });

      // Query live catalog
      const liveDimensions = ingestionService.getLiveCatalogDimensions(garmentId);

      // Only the official verified record must be in live catalog
      expect(liveDimensions.length).toBe(1);
      expect(liveDimensions[0].sizeLabel).toBe("S");
      expect(liveDimensions[0].status).toBe("verified_published");

      // Verify that the community submission is isolated in staging
      const stagingDimensions = ingestionService.getStagingDimensions(garmentId);
      expect(stagingDimensions.length).toBe(1);
      expect(stagingDimensions[0].sizeLabel).toBe("M");
      expect(stagingDimensions[0].status).toBe("pending_review");
    });
  });

  // =========================================================================
  // TC-P-003: Multi-Source Corroboration Promotion
  // =========================================================================
  describe("TC-P-003: 3-source corroboration promotes to multi_source_corroborated", () => {
    it("promotes staged garment when 3 independent contributors match within 2% tolerance", () => {
      const garmentId = "garment_curated_denim_jacket";
      const sizeLabel = "L";

      // 3 independent contributors submit physical measurements:
      // Contributor 1: 580mm
      // Contributor 2: 585mm (delta from mean is < 1%)
      // Contributor 3: 578mm (delta from mean is < 1%)
      const sub1 = ingestionService.ingestDimensions({
        garmentId,
        sizeLabel,
        chestFlatMm: 580,
        shoulderMm: 480,
        sourceUri: "https://wearid.in/submissions/1",
        retrievedAt: new Date().toISOString(),
        rawContent: "tape-photo-1",
        isCommunityContributor: true,
        contributorId: "contributor_user_alpha",
      });

      const sub2 = ingestionService.ingestDimensions({
        garmentId,
        sizeLabel,
        chestFlatMm: 585,
        shoulderMm: 482,
        sourceUri: "https://wearid.in/submissions/2",
        retrievedAt: new Date().toISOString(),
        rawContent: "tape-photo-2",
        isCommunityContributor: true,
        contributorId: "contributor_user_beta",
      });

      const sub3 = ingestionService.ingestDimensions({
        garmentId,
        sizeLabel,
        chestFlatMm: 578,
        shoulderMm: 479,
        sourceUri: "https://wearid.in/submissions/3",
        retrievedAt: new Date().toISOString(),
        rawContent: "tape-photo-3",
        isCommunityContributor: true,
        contributorId: "contributor_user_gamma",
      });

      stagingQueue.addSubmission(sub1);
      stagingQueue.addSubmission(sub2);
      stagingQueue.addSubmission(sub3);

      const result = stagingQueue.evaluateCorroboration(garmentId, sizeLabel, 0.02);

      expect(result.promoted).toBe(true);
      expect(result.status).toBe("multi_source_corroborated");
      expect(result.contributorCount).toBe(3);
      expect(result.consensusDimension).toBeDefined();
      expect(result.consensusDimension?.chestFlatMm).toBe(581); // Math.round(mean: 581)

      // Verified submissions must now have updated status
      expect(sub1.status).toBe("multi_source_corroborated");
      expect(sub2.status).toBe("multi_source_corroborated");
      expect(sub3.status).toBe("multi_source_corroborated");
    });

    it("rejects promotion if fewer than 3 independent contributors submit data", () => {
      const garmentId = "garment_sample_tee";
      const sizeLabel = "M";

      const sub1 = ingestionService.ingestDimensions({
        garmentId,
        sizeLabel,
        chestFlatMm: 520,
        sourceUri: "https://wearid.in/submissions/10",
        retrievedAt: new Date().toISOString(),
        rawContent: "sub-10",
        isCommunityContributor: true,
        contributorId: "contributor_1",
      });

      const sub2 = ingestionService.ingestDimensions({
        garmentId,
        sizeLabel,
        chestFlatMm: 520,
        sourceUri: "https://wearid.in/submissions/11",
        retrievedAt: new Date().toISOString(),
        rawContent: "sub-11",
        isCommunityContributor: true,
        contributorId: "contributor_2",
      });

      stagingQueue.addSubmission(sub1);
      stagingQueue.addSubmission(sub2);

      const result = stagingQueue.evaluateCorroboration(garmentId, sizeLabel);
      expect(result.promoted).toBe(false);
      expect(result.reason).toContain("Insufficient independent contributors");
    });

    it("rejects promotion if measurements diverge by more than 2% tolerance", () => {
      const garmentId = "garment_inconsistent_cut";
      const sizeLabel = "M";

      // Contributor 1: 500mm
      // Contributor 2: 502mm
      // Contributor 3: 540mm (8% variance, exceeds 2% threshold)
      const sub1 = ingestionService.ingestDimensions({
        garmentId,
        sizeLabel,
        chestFlatMm: 500,
        sourceUri: "https://wearid.in/submissions/21",
        retrievedAt: new Date().toISOString(),
        rawContent: "sub-21",
        isCommunityContributor: true,
        contributorId: "contributor_1",
      });

      const sub2 = ingestionService.ingestDimensions({
        garmentId,
        sizeLabel,
        chestFlatMm: 502,
        sourceUri: "https://wearid.in/submissions/22",
        retrievedAt: new Date().toISOString(),
        rawContent: "sub-22",
        isCommunityContributor: true,
        contributorId: "contributor_2",
      });

      const sub3 = ingestionService.ingestDimensions({
        garmentId,
        sizeLabel,
        chestFlatMm: 540,
        sourceUri: "https://wearid.in/submissions/23",
        retrievedAt: new Date().toISOString(),
        rawContent: "sub-23",
        isCommunityContributor: true,
        contributorId: "contributor_3",
      });

      stagingQueue.addSubmission(sub1);
      stagingQueue.addSubmission(sub2);
      stagingQueue.addSubmission(sub3);

      const result = stagingQueue.evaluateCorroboration(garmentId, sizeLabel, 0.02);
      expect(result.promoted).toBe(false);
      expect(result.reason).toContain("variance exceeds 2% tolerance");
    });
  });

  // =========================================================================
  // TC-P-007: Verified Multi-Category Catalog Provenance Validation
  // =========================================================================
  describe("TC-P-007: Verified Multi-Category Catalog Provenance Adherence", () => {
    it("ensures all brands in PILOT_BRANDS possess valid official provenance metadata", async () => {
      const { PILOT_BRANDS } = await import("@/core/data/pilotBrands");
      expect(PILOT_BRANDS.length).toBeGreaterThanOrEqual(18);

      const brandIds = new Set(PILOT_BRANDS.map((b) => b.id));
      const requiredBrands = [
        "fabindia",
        "raymond",
        "peter_england",
        "allen_solly",
        "puma",
        "mufti",
        "decathlon",
        "manyavar",
        "uniqlo",
        "levis",
        "marks_and_spencer",
        "nike",
      ];
      for (const reqBrand of requiredBrands) {
        expect(brandIds.has(reqBrand)).toBe(true);
      }

      for (const brand of PILOT_BRANDS) {
        expect(brand.id).toBeDefined();
        expect(brand.name).toBeDefined();
        expect(brand.provenance.sourceType).toMatch(/^(brand_official|curated_dataset|contributor_verified)$/);
        expect(brand.provenance.sourceUrl).toMatch(/^https?:\/\//);
        expect(brand.provenance.retrievedAt).toBeDefined();
        expect(brand.provenance.verificationHash).toMatch(/^sha256-/);
      }
    });

    it("ensures PILOT_PRODUCTS spans intimates, bottoms, outerwear, and tops with full specs", async () => {
      const { PILOT_PRODUCTS } = await import("@/core/data/pilotBrands");
      expect(PILOT_PRODUCTS.length).toBeGreaterThanOrEqual(33);

      const categories = new Set(PILOT_PRODUCTS.map((p) => p.category));
      expect(categories.has("bra")).toBe(true);
      expect(categories.has("sports_bra")).toBe(true);
      expect(categories.has("jeans")).toBe(true);
      expect(categories.has("trousers_chinos")).toBe(true);
      expect(categories.has("jacket")).toBe(true);
      expect(categories.has("shirt_casual")).toBe(true);
      expect(categories.has("joggers")).toBe(true);
      expect(categories.has("shorts")).toBe(true);
      expect(categories.has("kurta")).toBe(true);
      expect(categories.has("blazer")).toBe(true);
      expect(categories.has("polo")).toBe(true);

      for (const prod of PILOT_PRODUCTS) {
        expect(prod.priceInr).toBeGreaterThan(0);
        expect(prod.provenance.sourceUrl).toMatch(/^https?:\/\//);
        expect(prod.fabric.materialComposition).toBeDefined();
        // Either Layer 3 or Layer 2 specs must be present
        const hasLayer3 = prod.layer3Specs && prod.layer3Specs.length > 0;
        const hasLayer2 = prod.layer2Charts && prod.layer2Charts.length > 0;
        expect(hasLayer3 || hasLayer2).toBe(true);

        // Invariant #4: Canonical millimeters (positive integers, realistic dimensions)
        if (prod.layer3Specs) {
          for (const spec of prod.layer3Specs) {
            if (spec.chestFlatMm !== undefined) {
              expect(Number.isInteger(spec.chestFlatMm)).toBe(true);
              expect(spec.chestFlatMm).toBeGreaterThan(200);
              expect(spec.chestFlatMm).toBeLessThan(1200);
            }

            if (spec.shoulderMm !== undefined) {
              expect(Number.isInteger(spec.shoulderMm)).toBe(true);
              expect(spec.shoulderMm).toBeGreaterThan(200);
            }
            if (spec.lengthMm !== undefined) {
              expect(Number.isInteger(spec.lengthMm)).toBe(true);
              expect(spec.lengthMm).toBeGreaterThan(100);
            }
            if (spec.waistFlatMm !== undefined) {
              expect(Number.isInteger(spec.waistFlatMm)).toBe(true);
              expect(spec.waistFlatMm).toBeGreaterThan(200);
            }
            if (spec.inseamMm !== undefined) {
              expect(Number.isInteger(spec.inseamMm)).toBe(true);
              expect(spec.inseamMm).toBeGreaterThan(100);
            }
          }
        }

        if (prod.layer2Charts) {
          for (const chart of prod.layer2Charts) {
            if (chart.chestMinMm !== undefined) {
              expect(Number.isInteger(chart.chestMinMm)).toBe(true);
              expect(chart.chestMinMm).toBeGreaterThan(300);
            }
            if (chart.chestMaxMm !== undefined) {
              expect(Number.isInteger(chart.chestMaxMm)).toBe(true);
              expect(chart.chestMaxMm).toBeGreaterThan(chart.chestMinMm ?? 0);
            }
            if (chart.waistMinMm !== undefined) {
              expect(Number.isInteger(chart.waistMinMm)).toBe(true);
              expect(chart.waistMinMm).toBeGreaterThan(300);
            }
            if (chart.waistMaxMm !== undefined) {
              expect(Number.isInteger(chart.waistMaxMm)).toBe(true);
              expect(chart.waistMaxMm).toBeGreaterThan(chart.waistMinMm ?? 0);
            }
          }
        }
      }
    });
  });
});
