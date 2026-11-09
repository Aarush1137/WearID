import crypto from "crypto";
import {
  GarmentRecord,
  GarmentDimensionRecord,
  MissingProvenanceError,
  ProvenanceMetadata,
  SubmissionStatus,
} from "../persistence/schema";

export interface IngestGarmentInput {
  id?: string;
  brandId: string;
  name: string;
  category: string;
  sourceUri?: string;
  retrievedAt?: string;
  sourceType?: ProvenanceMetadata["sourceType"];
  licenseOrPermission?: string;
  rawContent: string | Buffer;
}

export interface IngestDimensionInput {
  id?: string;
  garmentId: string;
  sizeLabel: string;
  chestFlatMm: number;
  shoulderMm?: number;
  lengthMm?: number;
  sleeveMm?: number;
  sourceUri?: string;
  retrievedAt?: string;
  sourceType?: ProvenanceMetadata["sourceType"];
  rawContent: string | Buffer;
  contributorId?: string;
  isCommunityContributor?: boolean;
}

export class ProvenanceIngestionService {
  private garments = new Map<string, GarmentRecord>();
  private dimensions = new Map<string, GarmentDimensionRecord>();

  /**
   * Computes an immutable SHA-256 cryptographic hash of raw HTTP response payload.
   * AGENTS.md Invariant 2 requirement: real content checksums.
   */
  public computeVerificationHash(rawContent: string | Buffer): string {
    const hash = crypto.createHash("sha256").update(rawContent).digest("hex");
    return `sha256-${hash}`;
  }

  /**
   * Ingests a new garment item with mandatory source provenance.
   * TC-P-001: Ingestion without source_uri throws MissingProvenanceError.
   */
  public ingestGarment(input: IngestGarmentInput): GarmentRecord {
    if (!input.sourceUri || input.sourceUri.trim() === "") {
      throw new MissingProvenanceError(
        "Ingestion rejected: Missing mandatory source_uri provenance metadata (AGENTS.md Invariant 2)."
      );
    }

    if (!input.retrievedAt || input.retrievedAt.trim() === "") {
      throw new MissingProvenanceError(
        "Ingestion rejected: Missing mandatory retrieved_at ISO 8601 timestamp (AGENTS.md Invariant 2)."
      );
    }

    const verificationHash = this.computeVerificationHash(input.rawContent);
    const garmentId = input.id || `garment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const provenance: ProvenanceMetadata = {
      sourceUri: input.sourceUri,
      sourceType: input.sourceType || "brand_official",
      retrievedAt: input.retrievedAt,
      verificationHash,
      licenseOrPermission: input.licenseOrPermission || "official_retail_pdp",
    };

    const record: GarmentRecord = {
      id: garmentId,
      brandId: input.brandId,
      name: input.name,
      category: input.category,
      status: input.sourceType === "brand_official" ? "verified_published" : "pending_review",
      provenance,
    };

    this.garments.set(record.id, record);
    return record;
  }

  /**
   * Ingests physical garment dimensions with strict staging isolation for community submissions.
   * TC-P-002: Community submissions land in staging (draft / pending_review), never live catalog.
   */
  public ingestDimensions(input: IngestDimensionInput): GarmentDimensionRecord {
    if (!input.sourceUri || input.sourceUri.trim() === "") {
      throw new MissingProvenanceError(
        "Ingestion rejected: Missing mandatory source_uri for garment dimension record."
      );
    }

    if (!input.retrievedAt || input.retrievedAt.trim() === "") {
      throw new MissingProvenanceError(
        "Ingestion rejected: Missing mandatory retrieved_at for garment dimension record."
      );
    }

    // Invariant 4 validation: Canonical integer millimeters
    if (
      !Number.isInteger(input.chestFlatMm) ||
      input.chestFlatMm <= 0 ||
      (input.shoulderMm !== undefined && (!Number.isInteger(input.shoulderMm) || input.shoulderMm <= 0))
    ) {
      throw new Error("Validation Error: All dimensions must be positive non-negative integer millimeters (mm).");
    }

    const verificationHash = this.computeVerificationHash(input.rawContent);
    const dimId = input.id || `dim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Invariant 5 & TC-P-002: Community submissions strictly land in 'pending_review' or 'draft'
    const status: SubmissionStatus = input.isCommunityContributor ? "pending_review" : "verified_published";

    const record: GarmentDimensionRecord = {
      id: dimId,
      garmentId: input.garmentId,
      sizeLabel: input.sizeLabel,
      chestFlatMm: input.chestFlatMm,
      shoulderMm: input.shoulderMm,
      lengthMm: input.lengthMm,
      sleeveMm: input.sleeveMm,
      status,
      contributorId: input.contributorId,
      provenance: {
        sourceUri: input.sourceUri,
        sourceType: input.sourceType || (input.isCommunityContributor ? "contributor_verified" : "brand_official"),
        retrievedAt: input.retrievedAt,
        verificationHash,
        licenseOrPermission: input.isCommunityContributor ? "user_submitted_physical" : "official_retail_pdp",
      },
      createdAt: new Date().toISOString(),
    };

    this.dimensions.set(record.id, record);
    return record;
  }

  /**
   * Query catalog dimensions.
   * Only returns items with status 'verified_published' or 'multi_source_corroborated'.
   * Invariant 5: Staged/pending records are quarantined from live recommendation queries.
   */
  public getLiveCatalogDimensions(garmentId: string): GarmentDimensionRecord[] {
    return Array.from(this.dimensions.values()).filter(
      (d) =>
        d.garmentId === garmentId &&
        (d.status === "verified_published" || d.status === "multi_source_corroborated")
    );
  }

  public getStagingDimensions(garmentId?: string): GarmentDimensionRecord[] {
    return Array.from(this.dimensions.values()).filter(
      (d) =>
        (!garmentId || d.garmentId === garmentId) &&
        (d.status === "draft" || d.status === "pending_review")
    );
  }

  public clear(): void {
    this.garments.clear();
    this.dimensions.clear();
  }
}
