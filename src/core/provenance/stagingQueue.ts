import { GarmentDimensionRecord, SubmissionStatus } from "../persistence/schema";

export interface CorroborationResult {
  promoted: boolean;
  status?: SubmissionStatus;
  reason?: string;
  contributorCount: number;
  consensusDimension?: {
    garmentId: string;
    sizeLabel: string;
    chestFlatMm: number;
    shoulderMm?: number;
    lengthMm?: number;
  };
}

export class StagingQueueService {
  private stagedSubmissions: GarmentDimensionRecord[] = [];

  public addSubmission(submission: GarmentDimensionRecord): void {
    this.stagedSubmissions.push(submission);
  }

  public getSubmissions(garmentId: string, sizeLabel?: string): GarmentDimensionRecord[] {
    return this.stagedSubmissions.filter(
      (s) => s.garmentId === garmentId && (!sizeLabel || s.sizeLabel === sizeLabel)
    );
  }

  /**
   * Multi-Source Consensus Corroboration Engine (Invariant 5 & TC-P-003)
   * Promotes staged community submissions to 'multi_source_corroborated'
   * when >= 3 independent contributors submit measurements matching within 2% tolerance.
   */
  public evaluateCorroboration(
    garmentId: string,
    sizeLabel: string,
    toleranceFraction = 0.02 // 2% tolerance
  ): CorroborationResult {
    const candidates = this.stagedSubmissions.filter(
      (s) =>
        s.garmentId === garmentId &&
        s.sizeLabel === sizeLabel &&
        (s.status === "draft" || s.status === "pending_review")
    );

    // Group by distinct contributor ID (must be independent contributors)
    const contributorMap = new Map<string, GarmentDimensionRecord>();
    for (const item of candidates) {
      if (item.contributorId) {
        // Keep the latest submission from each unique contributor
        contributorMap.set(item.contributorId, item);
      }
    }

    const uniqueSubmissions = Array.from(contributorMap.values());
    const contributorCount = uniqueSubmissions.length;

    // Rule: Must have at least 3 independent contributors
    if (contributorCount < 3) {
      return {
        promoted: false,
        reason: `Insufficient independent contributors: found ${contributorCount}, minimum 3 required.`,
        contributorCount,
      };
    }

    // Evaluate Chest Flat tolerance (primary key dimension)
    const chestValues = uniqueSubmissions.map((s) => s.chestFlatMm);
    const meanChest = chestValues.reduce((a, b) => a + b, 0) / chestValues.length;

    const chestWithinTolerance = chestValues.every((val) => {
      const delta = Math.abs(val - meanChest);
      return delta / meanChest <= toleranceFraction;
    });

    if (!chestWithinTolerance) {
      return {
        promoted: false,
        reason: `Measurement variance exceeds ${(toleranceFraction * 100).toFixed(0)}% tolerance threshold.`,
        contributorCount,
      };
    }

    // Evaluate Shoulder width tolerance if present in all 3
    const shoulderValues = uniqueSubmissions
      .map((s) => s.shoulderMm)
      .filter((s): s is number => typeof s === "number");

    let meanShoulder: number | undefined;
    if (shoulderValues.length === uniqueSubmissions.length) {
      meanShoulder = Math.round(shoulderValues.reduce((a, b) => a + b, 0) / shoulderValues.length);
      const shoulderWithinTolerance = shoulderValues.every((val) => {
        const delta = Math.abs(val - meanShoulder!);
        return delta / meanShoulder! <= toleranceFraction;
      });

      if (!shoulderWithinTolerance) {
        return {
          promoted: false,
          reason: `Shoulder width variance exceeds ${(toleranceFraction * 100).toFixed(0)}% tolerance threshold.`,
          contributorCount,
        };
      }
    }

    // Promote all matched submissions to 'multi_source_corroborated'
    uniqueSubmissions.forEach((sub) => {
      sub.status = "multi_source_corroborated";
    });

    const consensusDimension = {
      garmentId,
      sizeLabel,
      chestFlatMm: Math.round(meanChest),
      shoulderMm: meanShoulder,
    };

    return {
      promoted: true,
      status: "multi_source_corroborated",
      contributorCount,
      consensusDimension,
    };
  }

  public clear(): void {
    this.stagedSubmissions = [];
  }
}
