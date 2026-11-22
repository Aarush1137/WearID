import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateLandmarkTrend,
  calculateProfileTrends,
  formatDelta,
} from "@/core/sizing/trendCalculation";
import { MeasurementSnapshot, useProfileStore } from "@/core/state/profileStore";

describe("Measurement History & Trend Tracker Suite (Milestone 6 Feature 4)", () => {
  beforeEach(() => {
    useProfileStore.getState().resetToSampleData();
  });

  const mockSnapshots: MeasurementSnapshot[] = [
    {
      id: "snap_3",
      profileId: "prof_1",
      recordedAt: "2026-03-01T08:00:00Z", // Latest
      source: "calibrated_garment",
      measurements: {
        chestMm: 990, // +30mm from baseline
        waistMm: 810, // -20mm from baseline
        hipsMm: 962,  // +2mm (stable)
        shoulderWidthMm: 450,
      },
    },
    {
      id: "snap_1",
      profileId: "prof_1",
      recordedAt: "2025-09-01T08:00:00Z", // Baseline (oldest)
      source: "physical_tape",
      measurements: {
        chestMm: 960,
        waistMm: 830,
        hipsMm: 960,
        shoulderWidthMm: 440,
      },
    },
    {
      id: "snap_2",
      profileId: "prof_1",
      recordedAt: "2025-12-01T08:00:00Z", // Middle
      source: "tailor",
      measurements: {
        chestMm: 975,
        waistMm: 825,
        hipsMm: 960,
        shoulderWidthMm: 445,
      },
    },
  ];

  describe("Chronological Sorting & Delta Calculations", () => {
    it("handles empty snapshots list gracefully", () => {
      expect(calculateLandmarkTrend([], "chestMm")).toBeNull();
    });

    it("handles single snapshot as stable baseline", () => {
      const single = [mockSnapshots[1]];
      const trend = calculateLandmarkTrend(single, "chestMm");

      expect(trend).not.toBeNull();
      expect(trend?.baselineMm).toBe(960);
      expect(trend?.latestMm).toBe(960);
      expect(trend?.netDeltaMm).toBe(0);
      expect(trend?.direction).toBe("stable");
      expect(trend?.percentageChange).toBe(0);
      expect(trend?.historyPoints.length).toBe(1);
    });

    it("sorts snapshots chronologically regardless of input ordering", () => {
      const trend = calculateLandmarkTrend(mockSnapshots, "chestMm");

      expect(trend).not.toBeNull();
      expect(trend?.baselineMm).toBe(960); // 2025-09-01
      expect(trend?.latestMm).toBe(990);   // 2026-03-01
      expect(trend?.netDeltaMm).toBe(30);

      // Verify history point dates are sorted ascending
      const dates = trend?.historyPoints.map((p) => p.date) || [];
      expect(dates[0]).toBe("2025-09-01T08:00:00Z");
      expect(dates[1]).toBe("2025-12-01T08:00:00Z");
      expect(dates[2]).toBe("2026-03-01T08:00:00Z");
    });
  });

  describe("Directional Categorization (Invariant 4: Canonical mm)", () => {
    it("categorizes > +5mm shift as 'increasing'", () => {
      const trend = calculateLandmarkTrend(mockSnapshots, "chestMm");
      expect(trend?.netDeltaMm).toBe(30);
      expect(trend?.direction).toBe("increasing");
      expect(trend?.percentageChange).toBe(3.1);
    });

    it("categorizes < -5mm shift as 'decreasing'", () => {
      const trend = calculateLandmarkTrend(mockSnapshots, "waistMm");
      expect(trend?.netDeltaMm).toBe(-20); // 830 -> 810
      expect(trend?.direction).toBe("decreasing");
      expect(trend?.percentageChange).toBe(-2.4);
    });

    it("categorizes within [-5mm, +5mm] as 'stable'", () => {
      const trend = calculateLandmarkTrend(mockSnapshots, "hipsMm");
      expect(trend?.netDeltaMm).toBe(2); // 960 -> 962
      expect(trend?.direction).toBe("stable");
    });
  });

  describe("formatDelta Presentation Helper", () => {
    it("formats cm deltas with proper sign", () => {
      expect(formatDelta(30, "cm")).toBe("+3.0 cm");
      expect(formatDelta(-20, "cm")).toBe("-2.0 cm");
      expect(formatDelta(0, "cm")).toBe("0.0 cm");
    });

    it("formats inch deltas with proper sign", () => {
      expect(formatDelta(25.4, "in")).toBe("+1.0\"");
      expect(formatDelta(-12.7, "in")).toBe("-0.5\"");
    });
  });

  describe("Profile-wide Trends & Store Integration", () => {
    it("computes trends across all measured landmarks", () => {
      const profileTrends = calculateProfileTrends(mockSnapshots, "prof_1");

      expect(profileTrends.profileId).toBe("prof_1");
      expect(profileTrends.totalSnapshots).toBe(3);
      expect(profileTrends.dateRange.start).toBe("2025-09-01T08:00:00Z");
      expect(profileTrends.dateRange.end).toBe("2026-03-01T08:00:00Z");
      expect(profileTrends.trends["chestMm"]).toBeDefined();
      expect(profileTrends.trends["waistMm"]).toBeDefined();
      expect(profileTrends.trends["hipsMm"]).toBeDefined();
      expect(profileTrends.trends["shoulderWidthMm"]).toBeDefined();
    });

    it("supports adding and deleting snapshots in profileStore", () => {
      const store = useProfileStore.getState();
      const profileId = "profile_self_primary";

      store.addMeasurementSnapshot(profileId, {
        source: "tailor",
        notes: "Test snapshot",
        measurements: {
          chestMm: 985,
          waistMm: 815,
        },
      });

      const updated = useProfileStore.getState().getActiveProfile();
      expect(updated.measurementHistory?.length).toBeGreaterThan(0);

      const added = updated.measurementHistory?.[updated.measurementHistory.length - 1];
      expect(added?.measurements.chestMm).toBe(985);

      store.deleteMeasurementSnapshot(profileId, added!.id);
      const afterDelete = useProfileStore.getState().getActiveProfile();
      expect(afterDelete.measurementHistory?.some((s) => s.id === added!.id)).toBe(false);
    });
  });
});
