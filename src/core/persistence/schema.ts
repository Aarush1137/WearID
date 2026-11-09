import { z } from "zod";

/**
 * Phase 2 Governance Error Classes
 */
export class MissingProvenanceError extends Error {
  constructor(message = "Ingestion rejected: Missing mandatory source_uri or retrieved_at provenance metadata.") {
    super(message);
    this.name = "MissingProvenanceError";
  }
}

export class RobotsPolicyViolationError extends Error {
  constructor(message = "Access denied: Crawling path is disallowed by target domain's robots.txt policy.") {
    super(message);
    this.name = "RobotsPolicyViolationError";
  }
}

export class UnauthorizedProfileAccessError extends Error {
  constructor(message = "Forbidden: Profile is private by default. Access denied to unauthorized party.") {
    super(message);
    this.name = "UnauthorizedProfileAccessError";
  }
}

/**
 * Provenance Record Schema (Invariant 2)
 */
export const ProvenanceMetadataSchema = z.object({
  sourceUri: z.string().url("source_uri must be a valid URL"),
  sourceType: z.enum([
    "brand_official",
    "retailer_api",
    "curated_dataset",
    "user_measured_physical",
    "contributor_verified",
  ]),
  retrievedAt: z.string().datetime("retrieved_at must be an ISO 8601 timestamp"),
  verificationHash: z.string().min(64, "verification_hash must be a valid SHA-256 hex string (64 characters)"),
  licenseOrPermission: z.string().default("official_retail_pdp"),
});

export type ProvenanceMetadata = z.infer<typeof ProvenanceMetadataSchema>;

/**
 * Staged Submission Lifecycle Statuses (Invariant 5)
 */
export type SubmissionStatus =
  | "draft"
  | "pending_review"
  | "multi_source_corroborated"
  | "verified_published"
  | "rejected";

/**
 * User Profile Persistence Record (Invariant 7)
 */
export interface UserProfileRecord {
  id: string;
  userId: string;
  name: string;
  visibility: "private" | "public"; // Invariant 7: default 'private'
  encryptedMeasurements?: string;   // AES-256 encrypted payload at rest
  createdAt: string;
  updatedAt: string;
}

/**
 * Ingested Garment Record
 */
export interface GarmentRecord {
  id: string;
  brandId: string;
  name: string;
  category: string;
  status: SubmissionStatus;
  provenance: ProvenanceMetadata;
}

/**
 * Ingested Garment Dimension Record
 */
export interface GarmentDimensionRecord {
  id: string;
  garmentId: string;
  sizeLabel: string;
  chestFlatMm: number;
  shoulderMm?: number;
  lengthMm?: number;
  sleeveMm?: number;
  status: SubmissionStatus;
  contributorId?: string;
  provenance: ProvenanceMetadata;
  createdAt: string;
}
