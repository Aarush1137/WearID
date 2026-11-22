/**
 * Measurement History & Trend Tracker Calculation Engine
 * Computes chronological landmark deltas, percentage shifts, and directionality.
 *
 * Invariant 4: All internal dimensions and calculations are strictly in canonical millimeters (mm).
 * Invariant 2: Retains measurement provenance and chronological timestamps.
 */

import { MeasurementSnapshot } from "../state/profileStore";

export type TrackedLandmark =
  | "chestMm"
  | "waistMm"
  | "hipsMm"
  | "shoulderWidthMm"
  | "heightMm"
  | "inseamMm"
  | "neckMm";

export const LANDMARK_LABELS: Record<TrackedLandmark, string> = {
  chestMm: "Chest Circumference",
  waistMm: "Natural Waist",
  hipsMm: "High Hips",
  shoulderWidthMm: "Shoulder Breadth (Bi-Acromial)",
  heightMm: "Stature / Height",
  inseamMm: "Inseam to Floor",
  neckMm: "Neck Circumference",
};

export interface HistoryPoint {
  date: string;
  valueMm: number;
  deltaFromPrevMm: number;
}

export interface LandmarkTrend {
  landmark: TrackedLandmark;
  landmarkLabel: string;
  baselineMm: number;
  latestMm: number;
  netDeltaMm: number;
  percentageChange: number;
  direction: "increasing" | "decreasing" | "stable";
  historyPoints: HistoryPoint[];
}

export interface ProfileMeasurementTrends {
  profileId: string;
  totalSnapshots: number;
  dateRange: {
    start: string;
    end: string;
  };
  trends: Record<string, LandmarkTrend>;
}

/**
 * Calculates trend metrics for a specific anatomical landmark over time.
 * Directional threshold: > +5mm is "increasing", < -5mm is "decreasing", otherwise "stable".
 */
export function calculateLandmarkTrend(
  snapshots: MeasurementSnapshot[],
  landmark: TrackedLandmark
): LandmarkTrend | null {
  if (!snapshots || snapshots.length === 0) {
    return null;
  }

  // Filter snapshots that contain this landmark and sort chronologically (oldest first)
  const validSnapshots = snapshots
    .filter((s) => typeof s.measurements?.[landmark] === "number" && (s.measurements[landmark] as number) > 0)
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

  if (validSnapshots.length === 0) {
    return null;
  }

  const baselineMm = Math.round(validSnapshots[0].measurements[landmark] as number);
  const latestMm = Math.round(
    validSnapshots[validSnapshots.length - 1].measurements[landmark] as number
  );
  const netDeltaMm = latestMm - baselineMm;

  const percentageChange =
    baselineMm > 0 ? Math.round(((latestMm - baselineMm) / baselineMm) * 1000) / 10 : 0;

  let direction: "increasing" | "decreasing" | "stable" = "stable";
  if (netDeltaMm > 5) {
    direction = "increasing";
  } else if (netDeltaMm < -5) {
    direction = "decreasing";
  }

  const historyPoints: HistoryPoint[] = [];
  let prevVal = baselineMm;

  for (let i = 0; i < validSnapshots.length; i++) {
    const snap = validSnapshots[i];
    const val = Math.round(snap.measurements[landmark] as number);
    const deltaFromPrevMm = i === 0 ? 0 : val - prevVal;
    historyPoints.push({
      date: snap.recordedAt,
      valueMm: val,
      deltaFromPrevMm,
    });
    prevVal = val;
  }

  return {
    landmark,
    landmarkLabel: LANDMARK_LABELS[landmark] || landmark,
    baselineMm,
    latestMm,
    netDeltaMm,
    percentageChange,
    direction,
    historyPoints,
  };
}

/**
 * Computes trends across all tracked anatomical landmarks for a profile's history.
 */
export function calculateProfileTrends(
  snapshots: MeasurementSnapshot[],
  profileId: string = "default"
): ProfileMeasurementTrends {
  const trackedLandmarks: TrackedLandmark[] = [
    "chestMm",
    "waistMm",
    "hipsMm",
    "shoulderWidthMm",
    "heightMm",
    "inseamMm",
    "neckMm",
  ];

  const sortedSnapshots = [...(snapshots || [])].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  const totalSnapshots = sortedSnapshots.length;
  const start = totalSnapshots > 0 ? sortedSnapshots[0].recordedAt : new Date().toISOString();
  const end =
    totalSnapshots > 0
      ? sortedSnapshots[totalSnapshots - 1].recordedAt
      : new Date().toISOString();

  const trends: Record<string, LandmarkTrend> = {};

  for (const landmark of trackedLandmarks) {
    const trend = calculateLandmarkTrend(sortedSnapshots, landmark);
    if (trend) {
      trends[landmark] = trend;
    }
  }

  return {
    profileId,
    totalSnapshots,
    dateRange: { start, end },
    trends,
  };
}

/**
 * Formats a millimeter delta into user-facing presentation (+1.0 cm, -0.4 in, etc.)
 */
export function formatDelta(deltaMm: number, unit: "cm" | "in" = "cm"): string {
  if (deltaMm === 0) {
    return unit === "cm" ? "0.0 cm" : "0.0\"";
  }

  const sign = deltaMm > 0 ? "+" : "";

  if (unit === "cm") {
    const cm = (deltaMm / 10).toFixed(1);
    return `${sign}${cm} cm`;
  } else {
    const inches = (deltaMm / 25.4).toFixed(1);
    return `${sign}${inches}\"`;
  }
}
