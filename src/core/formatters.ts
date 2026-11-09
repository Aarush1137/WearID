import { AnatomicalProfile } from "./types";
import { mmToCm, mmToInches } from "./units";

export type DisplayUnit = "cm" | "in";

/**
 * Format canonical millimeter value for user presentation in preferred unit.
 * Storage remains integer mm unconditionally.
 */
export function formatMeasurement(
  mm: number | null | undefined,
  unit: DisplayUnit = "cm",
  includeUnitLabel = true
): string {
  if (mm === null || mm === undefined || isNaN(mm) || mm <= 0) {
    return "—";
  }

  if (unit === "cm") {
    const cmVal = mmToCm(mm);
    const formatted = cmVal.toFixed(1).replace(/\.0$/, "");
    return includeUnitLabel ? `${formatted} cm` : formatted;
  } else {
    const inVal = mmToInches(mm);
    const formatted = inVal.toFixed(1).replace(/\.0$/, "");
    return includeUnitLabel ? `${formatted}"` : formatted;
  }
}

/**
 * Dual presentation format for tailor passport cards.
 * Returns both cm and inches side-by-side without rounding drift.
 */
export function formatDualMeasurement(mm: number | null | undefined): {
  cm: string;
  inches: string;
  formatted: string;
} {
  if (mm === null || mm === undefined || isNaN(mm) || mm <= 0) {
    return { cm: "—", inches: "—", formatted: "—" };
  }

  const cmStr = `${mmToCm(mm).toFixed(1).replace(/\.0$/, "")} cm`;
  const inStr = `${mmToInches(mm).toFixed(1).replace(/\.0$/, "")}"`;
  return {
    cm: cmStr,
    inches: inStr,
    formatted: `${cmStr} (${inStr})`,
  };
}

/**
 * Measurement Completeness Score Calculator
 * Evaluates anatomical dimensions present in profile and returns percentage score.
 */
export function calculateProfileCompleteness(profile: Partial<AnatomicalProfile> | null | undefined): {
  pct: number;
  completedCount: number;
  totalKeyDimensions: number;
  tier: "complete" | "sufficient" | "minimal" | "empty";
  missingLabels: string[];
} {
  if (!profile) {
    return {
      pct: 0,
      completedCount: 0,
      totalKeyDimensions: 6,
      tier: "empty",
      missingLabels: ["Chest", "Waist", "Shoulders", "Height", "Hips", "Inseam"],
    };
  }

  const keys: { key: keyof AnatomicalProfile; label: string; weight: number }[] = [
    { key: "chestMm", label: "Chest", weight: 35 },
    { key: "shoulderWidthMm", label: "Shoulders", weight: 20 },
    { key: "waistMm", label: "Waist", weight: 15 },
    { key: "heightMm", label: "Height", weight: 10 },
    { key: "hipsMm", label: "Hips", weight: 10 },
    { key: "inseamMm", label: "Inseam", weight: 10 },
  ];

  let currentWeight = 0;
  let count = 0;
  const missing: string[] = [];

  for (const item of keys) {
    const val = profile[item.key];
    if (typeof val === "number" && val > 0) {
      currentWeight += item.weight;
      count++;
    } else {
      missing.push(item.label);
    }
  }

  const pct = Math.min(100, Math.round(currentWeight));
  let tier: "complete" | "sufficient" | "minimal" | "empty" = "empty";
  if (pct >= 85) tier = "complete";
  else if (pct >= 55) tier = "sufficient";
  else if (pct > 0) tier = "minimal";

  return {
    pct,
    completedCount: count,
    totalKeyDimensions: keys.length,
    tier,
    missingLabels: missing,
  };
}

/**
 * UI Confidence presentation mapper
 */
export function getConfidenceMeta(confidence: number): {
  label: string;
  pct: number;
  dotColorClass: string;
  badgeBgClass: string;
  badgeTextClass: string;
  prose: string;
} {
  const pct = Math.round(confidence * 100);
  if (confidence >= 0.85) {
    return {
      label: "High Confidence",
      pct,
      dotColorClass: "bg-confidence-high",
      badgeBgClass: "bg-emerald-50",
      badgeTextClass: "text-confidence-high",
      prose: "High fit precision calibrated with verified measurements.",
    };
  } else if (confidence >= 0.65) {
    return {
      label: "Medium Confidence",
      pct,
      dotColorClass: "bg-confidence-medium",
      badgeBgClass: "bg-amber-50",
      badgeTextClass: "text-confidence-medium",
      prose: "Good match based on available size ranges; check shoulder ease.",
    };
  } else if (confidence >= 0.40) {
    return {
      label: "Low Confidence",
      pct,
      dotColorClass: "bg-confidence-low",
      badgeBgClass: "bg-orange-50",
      badgeTextClass: "text-confidence-low",
      prose: "Approximate match; additional body dimensions recommended.",
    };
  } else {
    return {
      label: "Insufficient Data",
      pct,
      dotColorClass: "bg-confidence-none",
      badgeBgClass: "bg-stone-100",
      badgeTextClass: "text-confidence-none",
      prose: "Insufficient measurement data to compute reliable recommendation.",
    };
  }
}
