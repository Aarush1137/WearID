"use client";

import React, { useState } from "react";
import { AnatomicalProfile } from "@/core/types";
import { DisplayUnit, formatMeasurement } from "@/core/formatters";
import { Sparkles, User, Info, Check } from "lucide-react";

interface BodySilhouetteCanvasProps {
  measurements: AnatomicalProfile;
  gender?: "male" | "female" | "unisex";
  displayUnit: DisplayUnit;
  interactive?: boolean;
  activeLandmark?: string | null;
  onSelectLandmark?: (landmark: string) => void;
}

export function BodySilhouetteCanvas({
  measurements,
  gender = "male",
  displayUnit,
  interactive = true,
  activeLandmark = null,
  onSelectLandmark,
}: BodySilhouetteCanvasProps) {
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);

  const m = measurements;
  const currentSelected = activeLandmark || hoveredLandmark;

  // Proportional body morphology classifications
  const chestVal = m.chestMm || 980;
  const waistVal = m.waistMm || 820;
  const hipsVal = m.hipsMm || 960;
  const heightVal = m.heightMm || 1780;
  const shouldersVal = m.shoulderWidthMm || 450;

  // Chest classification
  let chestBuild = "Balanced / Athletic";
  let chestColor = "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60";
  if (chestVal < 900) {
    chestBuild = "Slender / Lean Build";
    chestColor = "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60";
  } else if (chestVal > 1040) {
    chestBuild = "Broad / Robust Build";
    chestColor = "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60";
  }

  // Waist classification
  let waistProfile = "Natural Taper";
  let waistColor = "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60";
  const dropRatio = chestVal / Math.max(1, waistVal);
  if (dropRatio >= 1.2) {
    waistProfile = "Pronounced Athletic V-Taper";
    waistColor = "text-accent bg-accent-subtle/50";
  } else if (dropRatio < 1.08) {
    waistProfile = "Straight / Relaxed Mid-section";
    waistColor = "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60";
  }

  // Stature classification (reference Indian average: 175cm male / 163cm female)
  const avgHeight = gender === "female" ? 1630 : 1750;
  const heightDiffCm = Math.round((heightVal - avgHeight) / 10);
  let statureText = `${Math.abs(heightDiffCm)}cm above average stature`;
  if (heightDiffCm < -2) {
    statureText = `${Math.abs(heightDiffCm)}cm below average stature`;
  } else if (Math.abs(heightDiffCm) <= 2) {
    statureText = "Standard regional height baseline";
  }

  // Dynamic SVG points derived from measurements
  // Base silhouette width scales slightly with chest & shoulder proportions
  const chestWidthFactor = Math.min(1.2, Math.max(0.85, chestVal / 980));
  const waistWidthFactor = Math.min(1.2, Math.max(0.85, waistVal / 820));
  const hipsWidthFactor = Math.min(1.2, Math.max(0.85, hipsVal / 960));

  const shoulderHalfWidth = 24 * Math.min(1.15, Math.max(0.85, shouldersVal / 450));
  const chestHalfWidth = 20 * chestWidthFactor;
  const waistHalfWidth = 15 * waistWidthFactor;
  const hipHalfWidth = 18 * hipsWidthFactor;

  const landmarks = [
    {
      id: "shoulders",
      label: "Shoulders (Acromion)",
      value: shouldersVal,
      yPos: 40,
      visualDesc: "Shoulder seam reference point",
    },
    {
      id: "chest",
      label: "Chest Girth",
      value: chestVal,
      yPos: 55,
      visualDesc: chestBuild,
    },
    {
      id: "waist",
      label: "Natural Waist",
      value: waistVal,
      yPos: 76,
      visualDesc: waistProfile,
    },
    {
      id: "hips",
      label: "High Hips",
      value: hipsVal,
      yPos: 94,
      visualDesc: "Trouser waistband seating",
    },
    {
      id: "inseam",
      label: "Inseam Length",
      value: m.inseamMm || 790,
      yPos: 125,
      visualDesc: "Crotch to bottom ankle hem",
    },
  ];

  return (
    <div className="rounded-card border border-border bg-bg-surface p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-sm text-text-primary">
              Proportional Anatomical Silhouette
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Interactive morphological map — tap landmarks to inspect fit feel
          </p>
        </div>

        {/* Visual summary pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-badge text-[11px] font-medium ${chestColor}`}>
            {chestBuild}
          </span>
          <span className={`px-2.5 py-1 rounded-badge text-[11px] font-medium ${waistColor}`}>
            {waistProfile}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Interactive Mannequin SVG */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative w-48 h-72 sm:w-56 sm:h-80 bg-bg-elevated/40 rounded-card border border-border flex items-center justify-center p-3 select-none">
            <svg
              viewBox="0 0 100 160"
              className="w-full h-full drop-shadow-xs"
              role="img"
              aria-label="Proportional body silhouette mannequin"
            >
              <defs>
                <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.12" />
                </linearGradient>
                <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--terracotta)" />
                  <stop offset="100%" stopColor="var(--accent)" />
                </linearGradient>
                <radialGradient id="studioLighting" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                </radialGradient>
                <filter id="glowPulse" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Studio Backlight Aura */}
              <circle cx="50" cy="75" r="55" fill="url(#studioLighting)" pointerEvents="none" />

              {/* Head & Neck */}
              <circle cx="50" cy="18" r="9" fill="url(#bodyGradient)" stroke="var(--accent)" strokeWidth="1.5" className="transition-all duration-300" />
              <path d="M47 27 L47 34 L53 34 L53 27 Z" fill="url(#bodyGradient)" stroke="var(--accent)" strokeWidth="1.5" className="transition-all duration-300" />

              {/* Torso & Legs Contour (Dynamically derived from width factors) */}
              <path
                d={`
                  M${50 - shoulderHalfWidth} 40
                  Q${50 - chestHalfWidth - 2} 48, ${50 - chestHalfWidth} 55
                  Q${50 - waistHalfWidth} 68, ${50 - waistHalfWidth} 76
                  Q${50 - hipHalfWidth} 86, ${50 - hipHalfWidth} 94
                  L${42} 104
                  L${42} 152
                  L${47} 152
                  L${48} 106
                  L${52} 106
                  L${53} 152
                  L${58} 152
                  L${58} 104
                  L${50 + hipHalfWidth} 94
                  Q${50 + hipHalfWidth} 86, ${50 + waistHalfWidth} 76
                  Q${50 + waistHalfWidth} 68, ${50 + chestHalfWidth} 55
                  Q${50 + chestHalfWidth + 2} 48, ${50 + shoulderHalfWidth} 40
                  Z
                `}
                fill="url(#bodyGradient)"
                stroke="var(--accent)"
                strokeWidth="1.75"
                className="transition-all duration-500 ease-out"
              />

              {/* Arms */}
              <path
                d={`
                  M${50 - shoulderHalfWidth} 40
                  L${50 - shoulderHalfWidth - 6} 78
                  L${50 - shoulderHalfWidth - 2} 96
                  L${50 - shoulderHalfWidth + 2} 96
                  L${50 - shoulderHalfWidth - 2} 78
                  L${50 - chestHalfWidth} 55
                `}
                fill="url(#bodyGradient)"
                stroke="var(--accent)"
                strokeWidth="1.5"
              />
              <path
                d={`
                  M${50 + shoulderHalfWidth} 40
                  L${50 + shoulderHalfWidth + 6} 78
                  L${50 + shoulderHalfWidth + 2} 96
                  L${50 + shoulderHalfWidth - 2} 96
                  L${50 + shoulderHalfWidth + 2} 78
                  L${50 + chestHalfWidth} 55
                `}
                fill="url(#bodyGradient)"
                stroke="var(--accent)"
                strokeWidth="1.5"
              />

              {/* Horizontal Landmark Rings */}
              {landmarks.map((l) => {
                const isActive = currentSelected === l.id;
                let stroke = isActive ? "var(--terracotta)" : "var(--accent)";
                let strokeWidth = isActive ? "2.5" : "1.2";
                let dash = isActive ? "0" : "2 2";

                let x1 = 30;
                let x2 = 70;
                if (l.id === "shoulders") {
                  x1 = 50 - shoulderHalfWidth;
                  x2 = 50 + shoulderHalfWidth;
                } else if (l.id === "chest") {
                  x1 = 50 - chestHalfWidth;
                  x2 = 50 + chestHalfWidth;
                } else if (l.id === "waist") {
                  x1 = 50 - waistHalfWidth;
                  x2 = 50 + waistHalfWidth;
                } else if (l.id === "hips") {
                  x1 = 50 - hipHalfWidth;
                  x2 = 50 + hipHalfWidth;
                } else if (l.id === "inseam") {
                  x1 = 45;
                  x2 = 45;
                }

                if (l.id === "inseam") {
                  return (
                    <line
                      key={l.id}
                      x1={x1}
                      y1={104}
                      x2={x2}
                      y2={152}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeDasharray={dash}
                    />
                  );
                }

                return (
                  <g key={l.id}>
                    <line
                      x1={x1 - 2}
                      y1={l.yPos}
                      x2={x2 + 2}
                      y2={l.yPos}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeDasharray={dash}
                    />
                    {/* Pulsing indicator nodes on active landmark */}
                    {isActive && (
                      <g>
                        <circle cx={x2 + 2} cy={l.yPos} r="5" fill="var(--terracotta)" className="animate-ping" opacity="0.6" />
                        <circle cx={x2 + 2} cy={l.yPos} r="4.5" fill="var(--terracotta)" opacity="0.4" />
                        <circle cx={x2 + 2} cy={l.yPos} r="2.5" fill="var(--terracotta)" />
                        <circle cx={x1 - 2} cy={l.yPos} r="5" fill="var(--terracotta)" className="animate-ping" opacity="0.6" />
                        <circle cx={x1 - 2} cy={l.yPos} r="4.5" fill="var(--terracotta)" opacity="0.4" />
                        <circle cx={x1 - 2} cy={l.yPos} r="2.5" fill="var(--terracotta)" />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Height scale indicator bar on right side */}
            <div className="absolute right-2 top-4 bottom-4 flex flex-col justify-between items-center text-[9px] text-text-tertiary select-none">
              <span className="font-mono">200cm</span>
              <div className="w-1.5 h-full bg-border rounded-full relative my-1 overflow-hidden">
                <div
                  className="w-full bg-accent absolute bottom-0 rounded-full transition-all"
                  style={{ height: `${Math.min(100, Math.max(20, (heightVal / 2100) * 100))}%` }}
                />
              </div>
              <span className="font-mono">150cm</span>
            </div>
          </div>

          <span className="text-[11px] text-text-secondary mt-2 text-center">
            {statureText} · {formatMeasurement(heightVal, displayUnit)}
          </span>
        </div>

        {/* Landmark Cards & Qualitative Breakdown */}
        <div className="md:col-span-7 space-y-2.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary block mb-1">
            Anatomical Landmark Guides & Visual Feel
          </span>

          {landmarks.map((l) => {
            const isSelected = currentSelected === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => onSelectLandmark && onSelectLandmark(l.id)}
                onMouseEnter={() => setHoveredLandmark(l.id)}
                onMouseLeave={() => setHoveredLandmark(null)}
                className={`w-full p-3 rounded-card border text-left min-h-[44px] transition-all flex items-center justify-between ${
                  isSelected
                    ? "border-terracotta bg-terracotta-subtle/50 shadow-xs ring-1 ring-terracotta/40"
                    : "border-border bg-bg-elevated/40 hover:bg-bg-elevated hover:border-accent/40"
                }`}
                aria-label={`${l.label}: ${formatMeasurement(l.value, displayUnit)} (${l.visualDesc})`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full transition-colors ${
                      isSelected ? "bg-terracotta" : "bg-accent/40"
                    }`}
                  />
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">
                      {l.label}
                    </span>
                    <span className="text-[11px] text-text-secondary block mt-0.5">
                      {l.visualDesc}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-xs text-text-primary block">
                    {formatMeasurement(l.value, displayUnit)}
                  </span>
                  <span className="text-[10px] text-text-tertiary block font-mono">
                    {l.value} mm
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
