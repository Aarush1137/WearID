"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProfileStore, MeasurementSnapshot } from "@/core/state/profileStore";
import {
  calculateProfileTrends,
  calculateLandmarkTrend,
  formatDelta,
  TrackedLandmark,
  LANDMARK_LABELS,
} from "@/core/sizing/trendCalculation";
import { formatMeasurement } from "@/core/formatters";

export default function MeasurementHistoryPage() {
  const {
    getActiveProfile,
    displayUnit,
    addMeasurementSnapshot,
    deleteMeasurementSnapshot,
  } = useProfileStore();

  const activeProfile = getActiveProfile();
  const history = activeProfile.measurementHistory || [];

  const [activeLandmark, setActiveLandmark] = useState<TrackedLandmark>("chestMm");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for logging a new snapshot
  const [newSource, setNewSource] = useState<
    "physical_tape" | "calibrated_garment" | "tailor" | "manual"
  >("physical_tape");
  const [newChest, setNewChest] = useState<string>(
    displayUnit === "cm"
      ? (activeProfile.measurements?.chestMm / 10).toString()
      : ((activeProfile.measurements?.chestMm || 980) / 25.4).toFixed(1)
  );
  const [newWaist, setNewWaist] = useState<string>(
    displayUnit === "cm"
      ? ((activeProfile.measurements?.waistMm || 820) / 10).toString()
      : ((activeProfile.measurements?.waistMm || 820) / 25.4).toFixed(1)
  );
  const [newHips, setNewHips] = useState<string>(
    displayUnit === "cm"
      ? ((activeProfile.measurements?.hipsMm || 960) / 10).toString()
      : ((activeProfile.measurements?.hipsMm || 960) / 25.4).toFixed(1)
  );
  const [newNotes, setNewNotes] = useState<string>("");

  const profileTrends = calculateProfileTrends(history, activeProfile.id);
  const selectedTrend = calculateLandmarkTrend(history, activeLandmark);

  const handlePopulateSampleHistory = () => {
    // Populate realistic 6-month calibration checkpoints for testing & demonstration
    const checkpoints: Omit<MeasurementSnapshot, "id" | "profileId">[] = [
      {
        recordedAt: "2025-10-15T09:00:00Z",
        source: "physical_tape",
        notes: "Autumn baseline measurement session",
        measurements: {
          chestMm: 960,
          waistMm: 830,
          hipsMm: 955,
          shoulderWidthMm: 445,
          heightMm: 1780,
          inseamMm: 790,
          neckMm: 385,
        },
      },
      {
        recordedAt: "2026-01-10T10:00:00Z",
        source: "tailor",
        notes: "Fitted by master tailor for bespoke blazer",
        measurements: {
          chestMm: 970,
          waistMm: 825,
          hipsMm: 958,
          shoulderWidthMm: 450,
          heightMm: 1780,
          inseamMm: 790,
          neckMm: 388,
        },
      },
      {
        recordedAt: "2026-03-01T08:00:00Z",
        source: "calibrated_garment",
        notes: "Calibrated against Uniqlo Supima benchmark",
        measurements: {
          chestMm: 980,
          waistMm: 820,
          hipsMm: 960,
          shoulderWidthMm: 450,
          heightMm: 1780,
          inseamMm: 790,
          neckMm: 390,
        },
      },
    ];

    for (const cp of checkpoints) {
      addMeasurementSnapshot(activeProfile.id, cp);
    }
  };

  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert display unit inputs into canonical millimeters (mm)
    const factor = displayUnit === "cm" ? 10 : 25.4;
    const chestMm = Math.round(parseFloat(newChest || "0") * factor);
    const waistMm = Math.round(parseFloat(newWaist || "0") * factor);
    const hipsMm = Math.round(parseFloat(newHips || "0") * factor);

    if (chestMm <= 0) return;

    addMeasurementSnapshot(activeProfile.id, {
      source: newSource,
      notes: newNotes || undefined,
      measurements: {
        chestMm,
        waistMm: waistMm > 0 ? waistMm : undefined,
        hipsMm: hipsMm > 0 ? hipsMm : undefined,
      },
    });

    setShowAddModal(false);
    setNewNotes("");
  };

  return (
    <div data-testid="measurement-history-page" className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb & Navigation */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500">
        <Link href="/app" className="hover:underline">
          Dashboard
        </Link>
        <span>/</span>
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
          Measurement History & Trend Tracker
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-block rounded-full bg-[#1B2A4A] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
            Invariant 4: Canonical Millimeters
          </span>
          <h1 className="mt-2 font-serif text-3xl font-bold text-[#1B2A4A] dark:text-white">
            Measurement History & Trends
          </h1>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            Chronological anatomical tracking for {activeProfile.name || "Primary Profile"} (
            {history.length} {history.length === 1 ? "session" : "sessions"} logged)
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {history.length < 2 && (
            <button
              type="button"
              onClick={handlePopulateSampleHistory}
              data-testid="populate-history-btn"
              className="rounded-xl border border-[#1B2A4A] bg-white px-3.5 py-2 text-xs font-semibold text-[#1B2A4A] hover:bg-neutral-50 dark:border-blue-400 dark:bg-neutral-900 dark:text-blue-400"
            >
              + Seed Calibration History
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            data-testid="log-snapshot-btn"
            className="rounded-xl bg-[#1B2A4A] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#253966] dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            + Log New Snapshot
          </button>
        </div>
      </div>

      {/* Summary Metric Cards for Primary Landmarks */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["chestMm", "waistMm", "hipsMm", "shoulderWidthMm"] as TrackedLandmark[]).map(
          (landmark) => {
            const trend = profileTrends.trends[landmark];
            const latestVal = trend
              ? formatMeasurement(trend.latestMm, displayUnit)
              : formatMeasurement(activeProfile.measurements?.[landmark] as number, displayUnit);
            const deltaFormatted = trend ? formatDelta(trend.netDeltaMm, displayUnit) : "—";
            const direction = trend ? trend.direction : "stable";

            return (
              <div
                key={landmark}
                onClick={() => setActiveLandmark(landmark)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  activeLandmark === landmark
                    ? "border-[#1B2A4A] bg-[#FAF8F5] shadow-sm dark:border-blue-500 dark:bg-neutral-800"
                    : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
                }`}
              >
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  {LANDMARK_LABELS[landmark].split(" ")[0]}
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-neutral-900 dark:text-white">
                    {latestVal}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      direction === "increasing"
                        ? "text-blue-600 dark:text-blue-400"
                        : direction === "decreasing"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {direction === "increasing" && "↑ "}
                    {direction === "decreasing" && "↓ "}
                    {direction === "stable" && "→ "}
                    {deltaFormatted}
                  </span>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Selected Landmark Trend Detail Card */}
      {selectedTrend && (
        <div
          data-testid="landmark-trend-detail"
          className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1B2A4A] dark:text-white">
                {selectedTrend.landmarkLabel} Trend Analysis
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Baseline: {formatMeasurement(selectedTrend.baselineMm, displayUnit)} → Current:{" "}
                {formatMeasurement(selectedTrend.latestMm, displayUnit)} (Net Shift:{" "}
                {formatDelta(selectedTrend.netDeltaMm, displayUnit)}, {selectedTrend.percentageChange}%)
              </p>
            </div>

            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                selectedTrend.direction === "increasing"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  : selectedTrend.direction === "decreasing"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
              }`}
            >
              Status: {selectedTrend.direction.toUpperCase()}
            </span>
          </div>

          {/* Chronological Checkpoints Progression */}
          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Chronological Checkpoints
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {selectedTrend.historyPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-neutral-100 bg-[#FAF8F5] p-3 dark:border-neutral-800 dark:bg-neutral-800/50"
                >
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {new Date(pt.date).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-base font-bold text-[#1B2A4A] dark:text-neutral-100">
                      {formatMeasurement(pt.valueMm, displayUnit)}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {idx === 0 ? "Baseline" : formatDelta(pt.deltaFromPrevMm, displayUnit)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Snapshots Table */}
      <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="font-serif text-lg font-semibold text-[#1B2A4A] dark:text-white">
          Snapshot Timeline Ledger
        </h3>
        <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">
          Immutable historical log of all measurement events with provenance attribution
        </p>

        {history.length === 0 ? (
          <p className="text-xs text-neutral-500">No measurement history recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Method / Source</th>
                  <th className="pb-3 font-semibold">Chest</th>
                  <th className="pb-3 font-semibold">Waist</th>
                  <th className="pb-3 font-semibold">Hips</th>
                  <th className="pb-3 font-semibold">Notes</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {history.map((snap) => (
                  <tr key={snap.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="py-3 font-medium text-neutral-800 dark:text-neutral-200">
                      {new Date(snap.recordedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3">
                      <span className="inline-block rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] capitalize text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        {snap.source.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-[#1B2A4A] dark:text-blue-300">
                      {formatMeasurement(snap.measurements.chestMm, displayUnit)}
                    </td>
                    <td className="py-3 text-neutral-700 dark:text-neutral-300">
                      {formatMeasurement(snap.measurements.waistMm, displayUnit)}
                    </td>
                    <td className="py-3 text-neutral-700 dark:text-neutral-300">
                      {formatMeasurement(snap.measurements.hipsMm, displayUnit)}
                    </td>
                    <td className="py-3 text-neutral-500 dark:text-neutral-400">
                      {snap.notes || "—"}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteMeasurementSnapshot(activeProfile.id, snap.id)}
                        className="text-neutral-400 hover:text-red-500"
                        title="Delete snapshot"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Snapshot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="font-serif text-lg font-semibold text-[#1B2A4A] dark:text-white">
              Log Measurement Snapshot
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Record verified biometric measurements in {displayUnit}.
            </p>

            <form onSubmit={handleSaveSnapshot} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Measurement Source / Provenance
                </label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value as any)}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white p-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  <option value="physical_tape">Physical Measuring Tape</option>
                  <option value="calibrated_garment">Calibrated Garment Benchmark</option>
                  <option value="tailor">Professional Tailor Session</option>
                  <option value="manual">Manual Entry</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Chest ({displayUnit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newChest}
                    onChange={(e) => setNewChest(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-neutral-300 p-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Waist ({displayUnit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-neutral-300 p-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Hips ({displayUnit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newHips}
                    onChange={(e) => setNewHips(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-neutral-300 p-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Notes / Context (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Measured after workout / New bespoke suit"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 p-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1B2A4A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#253966] dark:bg-blue-600"
                >
                  Save Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
