"use client";

import React, { useState } from "react";
import { AnatomicalProfile, GarmentDimensions, DimensionExplanation, FitType } from "@/core/types";
import { DisplayUnit, formatMeasurement } from "@/core/formatters";
import { Shirt, Sparkles, Layers, CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface GarmentDrapeOverlayProps {
  profile: AnatomicalProfile;
  garmentSpecs: GarmentDimensions;
  dimensionBreakdown: DimensionExplanation[];
  fitIntent: FitType;
  category: string;
  displayUnit: DisplayUnit;
}

export function GarmentDrapeOverlay({
  profile,
  garmentSpecs,
  dimensionBreakdown,
  fitIntent,
  category,
  displayUnit,
}: GarmentDrapeOverlayProps) {
  const [selectedZone, setSelectedZone] = useState<string>("chest");
  const [viewMode, setViewMode] = useState<"overlay" | "crossSection">("overlay");

  const chestItem = dimensionBreakdown.find((d) => d.dimension === "chest");
  const waistItem = dimensionBreakdown.find((d) => d.dimension === "waist");
  const shoulderItem = dimensionBreakdown.find((d) => d.dimension === "shoulders");

  const chestDelta = chestItem?.easeDeltaMm ?? 80;
  const waistDelta = waistItem?.easeDeltaMm ?? 70;
  const shoulderDelta = shoulderItem?.easeDeltaMm ?? 20;

  // Derive ease status colors
  const getZoneStatus = (delta: number, min = 40, max = 120) => {
    if (delta < 0) return { label: "Negative Ease (Tension)", color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50", stroke: "#DC2626" };
    if (delta < min) return { label: "Snug Fit", color: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50", stroke: "#D97706" };
    if (delta > max + 30) return { label: "Generous / Loose", color: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50", stroke: "#D97706" };
    return { label: "Ideal Ease", color: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50", stroke: "#16A34A" };
  };

  const chestStatus = getZoneStatus(chestDelta, chestItem?.easeTargetMm.min, chestItem?.easeTargetMm.max);
  const waistStatus = getZoneStatus(waistDelta, waistItem?.easeTargetMm.min, waistItem?.easeTargetMm.max);

  // Proportional sizing factors for SVG rendering
  // Base body width: 24 at chest. Garment width expands by ease delta ratio
  const bodyChestWidth = 24;
  const easeMultiplier = Math.max(0.95, Math.min(1.4, 1 + chestDelta / 600));
  const garmentChestWidth = bodyChestWidth * easeMultiplier;

  const bodyWaistWidth = 18;
  const waistMultiplier = Math.max(0.95, Math.min(1.4, 1 + waistDelta / 600));
  const garmentWaistWidth = bodyWaistWidth * waistMultiplier;

  return (
    <div className="rounded-card border border-border bg-bg-surface p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Shirt className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-sm text-text-primary">
              2D Garment Drape & Ease Silhouette
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Superimposed body contour vs. finished textile outline — see where the fabric floats or grips
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-bg-elevated p-1 rounded-btn text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewMode("overlay")}
            className={`px-3 py-1.5 rounded-btn transition-colors ${
              viewMode === "overlay"
                ? "bg-bg-surface text-text-primary font-semibold shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            2D Drape Overlay
          </button>
          <button
            type="button"
            onClick={() => setViewMode("crossSection")}
            className={`px-3 py-1.5 rounded-btn transition-colors ${
              viewMode === "crossSection"
                ? "bg-bg-surface text-text-primary font-semibold shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Girth Cross-Section
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Visual Canvas */}
        <div className="md:col-span-6 flex flex-col items-center">
          <div className="relative w-full max-w-[280px] h-72 sm:h-80 bg-bg-elevated/40 rounded-card border border-border flex items-center justify-center p-4">
            {viewMode === "overlay" ? (
              <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xs" role="img">
                <defs>
                  {/* Body fill */}
                  <linearGradient id="bodyFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0.25" />
                  </linearGradient>

                  {/* Garment ease halo gradient */}
                  <radialGradient id="easeHalo" cx="50%" cy="40%" r="50%">
                    <stop offset="70%" stopColor={chestStatus.stroke} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={chestStatus.stroke} stopOpacity="0.05" />
                  </radialGradient>
                </defs>

                {/* Garment Outer Contour (Draped garment boundary) */}
                <path
                  d={`
                    M 36 20
                    L ${50 - garmentChestWidth - 8} 34
                    L ${50 - garmentChestWidth - 2} 50
                    L ${50 - garmentChestWidth + 4} 46
                    L ${50 - garmentWaistWidth} 72
                    L ${50 - garmentWaistWidth - 2} 102
                    L ${50 + garmentWaistWidth + 2} 102
                    L ${50 + garmentWaistWidth} 72
                    L ${50 + garmentChestWidth - 4} 46
                    L ${50 + garmentChestWidth + 2} 50
                    L ${50 + garmentChestWidth + 8} 34
                    L 64 20
                    Q 50 28, 36 20
                    Z
                  `}
                  fill="url(#easeHalo)"
                  stroke={chestStatus.stroke}
                  strokeWidth="1.8"
                  strokeDasharray={chestDelta < 0 ? "3 3" : "0"}
                />

                {/* Inner Body Contour (User Anatomy) */}
                <path
                  d={`
                    M 40 22
                    L ${50 - bodyChestWidth} 32
                    L ${50 - bodyChestWidth + 4} 44
                    L ${50 - bodyWaistWidth} 68
                    L ${50 - bodyWaistWidth} 100
                    L ${50 + bodyWaistWidth} 100
                    L ${50 + bodyWaistWidth} 68
                    L ${50 + bodyChestWidth - 4} 44
                    L ${50 + bodyChestWidth} 32
                    L 60 22
                    Q 50 24, 40 22
                    Z
                  `}
                  fill="url(#bodyFillGrad)"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                />

                {/* Interactive Hotspot: Chest Ease Indicator */}
                <g
                  className="cursor-pointer"
                  onClick={() => setSelectedZone("chest")}
                >
                  <line
                    x1={50 - bodyChestWidth + 4}
                    y1="44"
                    x2={50 - garmentChestWidth + 4}
                    y2="46"
                    stroke={chestStatus.stroke}
                    strokeWidth="2"
                  />
                  <line
                    x1={50 + bodyChestWidth - 4}
                    y1="44"
                    x2={50 + garmentChestWidth - 4}
                    y2="46"
                    stroke={chestStatus.stroke}
                    strokeWidth="2"
                  />
                  <circle cx={50} cy={44} r="3" fill={chestStatus.stroke} />
                </g>

                {/* Interactive Hotspot: Waist Ease Indicator */}
                <g
                  className="cursor-pointer"
                  onClick={() => setSelectedZone("waist")}
                >
                  <line
                    x1={50 - bodyWaistWidth}
                    y1="68"
                    x2={50 - garmentWaistWidth}
                    y2="72"
                    stroke={waistStatus.stroke}
                    strokeWidth="2"
                  />
                  <line
                    x1={50 + bodyWaistWidth}
                    y1="68"
                    x2={50 + garmentWaistWidth}
                    y2="72"
                    stroke={waistStatus.stroke}
                    strokeWidth="2"
                  />
                  <circle cx={50} cy={68} r="3" fill={waistStatus.stroke} />
                </g>

                {/* Collar Neck Opening */}
                <ellipse cx="50" cy="20" rx="12" ry="5" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
              </svg>
            ) : (
              /* Girth Cross-Section View (Top-down body slice) */
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs" role="img">
                {/* Garment outer ellipse */}
                <ellipse
                  cx="50"
                  cy="50"
                  rx={32 * easeMultiplier}
                  ry={22 * easeMultiplier}
                  fill={chestStatus.stroke}
                  fillOpacity="0.15"
                  stroke={chestStatus.stroke}
                  strokeWidth="2"
                  strokeDasharray={chestDelta < 0 ? "3 3" : "0"}
                />

                {/* User body inner ellipse */}
                <ellipse
                  cx="50"
                  cy="50"
                  rx="30"
                  ry="20"
                  fill="var(--text-primary)"
                  fillOpacity="0.25"
                  stroke="var(--accent)"
                  strokeWidth="1.8"
                />

                <text x="50" y="53" textAnchor="middle" className="text-[7px] font-sans font-semibold fill-text-primary">
                  Body Cross-Section
                </text>

                {/* Lateral breathing room callouts */}
                <line x1="12" y1="50" x2="20" y2="50" stroke={chestStatus.stroke} strokeWidth="1.5" />
                <line x1="80" y1="50" x2="88" y2="50" stroke={chestStatus.stroke} strokeWidth="1.5" />
              </svg>
            )}

            {/* Float Badge */}
            <div className="absolute bottom-2 left-2 right-2 text-center">
              <span className="text-[10px] text-text-secondary bg-bg-surface/90 backdrop-blur-xs px-2.5 py-1 rounded-badge border border-border inline-block">
                Outer outline: Finished Garment · Inner shaded: Your Anatomy
              </span>
            </div>
          </div>
        </div>

        {/* Sensory Fit Breakdown Cards (Everyday feel explanations) */}
        <div className="md:col-span-6 space-y-3">
          <div className="p-3.5 rounded-card border border-border bg-bg-elevated/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-xs text-text-primary capitalize">
                Torso Breathing Space (Chest)
              </span>
              <span className={`px-2 py-0.5 rounded-badge text-[10px] font-semibold uppercase tracking-wider ${chestStatus.color}`}>
                {chestStatus.label}
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {chestDelta > 140
                ? "Substantial room (+14cm+ ease). Fabric hangs freely with wide oversized drape."
                : chestDelta >= 80
                ? "Optimal relaxed ease (+8 to +14cm). Approximately 2 fingers of breathing room on each side. Zero chest button pull."
                : chestDelta >= 40
                ? "Tailored slim fit (+4 to +8cm). Sits close to pectorals while allowing normal arm movement."
                : "Tight negative ease. Fabric will stretch taut across the chest."}
            </p>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/60 text-[11px] text-text-tertiary font-mono">
              <span>Body: {formatMeasurement(profile.chestMm, displayUnit)}</span>
              <span>·</span>
              <span>Garment: {formatMeasurement((garmentSpecs?.chestFlatMm ? garmentSpecs.chestFlatMm * 2 : (profile.chestMm + chestDelta)), displayUnit)}</span>
              <span>·</span>
              <span className="font-semibold text-text-primary">Δ {chestDelta > 0 ? `+${chestDelta}mm` : `${chestDelta}mm`}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-card border border-border bg-bg-elevated/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-xs text-text-primary capitalize">
                Waistline Drape & Seat
              </span>
              <span className={`px-2 py-0.5 rounded-badge text-[10px] font-semibold uppercase tracking-wider ${waistStatus.color}`}>
                {waistStatus.label}
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {waistDelta >= 80
                ? "Comfortable clearance over natural waist with zero gathering when seated."
                : waistDelta >= 40
                ? "Gentle taper following natural waist contour with clean side silhouette."
                : "Snug over midsection. May pull slightly when sitting down."}
            </p>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/60 text-[11px] text-text-tertiary font-mono">
              <span>Body: {formatMeasurement(profile.waistMm, displayUnit)}</span>
              <span>·</span>
              <span>Garment: {formatMeasurement((garmentSpecs?.waistFlatMm ? garmentSpecs.waistFlatMm * 2 : ((profile.waistMm || 820) + waistDelta)), displayUnit)}</span>
              <span>·</span>
              <span className="font-semibold text-text-primary">Δ {waistDelta > 0 ? `+${waistDelta}mm` : `${waistDelta}mm`}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-card border border-border bg-bg-elevated/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-xs text-text-primary capitalize">
                Shoulder Seam Alignment
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-badge bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                Natural Seam Land
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Shoulder line sits squarely at the acromion bone ({formatMeasurement(profile.shoulderWidthMm, displayUnit)}). Sleeves hang vertically without shoulder dimpling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
