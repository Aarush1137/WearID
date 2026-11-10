"use client";

import React, { useState } from "react";
import { calculateBraSize, BraSizingResult } from "@/core/sizing/braSizing";
import { DisplayUnit, formatMeasurement } from "@/core/formatters";
import { Sparkles, Heart, Info, ShieldCheck, CheckCircle2, Sliders, Layers } from "lucide-react";

interface BraSizingCardProps {
  initialUnderbustMm?: number;
  initialBustMm?: number;
  displayUnit: DisplayUnit;
  onSelectSize?: (size: string) => void;
}

export function BraSizingCard({
  initialUnderbustMm = 860,
  initialBustMm = 910,
  displayUnit,
  onSelectSize,
}: BraSizingCardProps) {
  const [underbustMm, setUnderbustMm] = useState<number>(initialUnderbustMm || 860);
  const [bustMm, setBustMm] = useState<number>(initialBustMm || 910);
  const [selectedAltSize, setSelectedAltSize] = useState<string | null>(null);
  const [inspectZone, setInspectZone] = useState<"all" | "band" | "cups" | "gore">("all");

  // Compute deterministic bra sizing
  const sizing: BraSizingResult = calculateBraSize(underbustMm, bustMm);
  const activeDisplaySize = selectedAltSize || sizing.fullBraSize;

  // Cup letter to volume index mapping (AA to G)
  const cupMap: Record<string, { index: number; volumeCc: number; depthLabel: string }> = {
    AA: { index: 0, volumeCc: 240, depthLabel: "Subtle Lift" },
    A: { index: 1, volumeCc: 310, depthLabel: "Low Profile" },
    B: { index: 2, volumeCc: 390, depthLabel: "Moderate Contour" },
    C: { index: 3, volumeCc: 480, depthLabel: "Balanced Projection" },
    D: { index: 4, volumeCc: 580, depthLabel: "Full Contour" },
    DD: { index: 5, volumeCc: 690, depthLabel: "Deep Projection" },
    E: { index: 6, volumeCc: 810, depthLabel: "Deep Projection" },
    F: { index: 7, volumeCc: 940, depthLabel: "Maximum Depth" },
    G: { index: 8, volumeCc: 1080, depthLabel: "Maximum Depth" },
  };

  const currentCup = cupMap[sizing.cupLetter] || { index: 2, volumeCc: 420, depthLabel: "Balanced Contour" };

  // Responsive SVG geometry derived dynamically from measurements
  const cupRadiusX = 12 + Math.min(6, currentCup.index * 0.7);
  const cupRadiusY = 14 + Math.min(7, currentCup.index * 0.85);
  const apexGlowScale = 0.25 + Math.min(0.5, currentCup.index * 0.06);

  // Band width factor (normalizes around 800mm baseline)
  const ribcageWidthFactor = Math.min(1.18, Math.max(0.85, underbustMm / 800));
  const bandLeftX = 50 - 26 * ribcageWidthFactor;
  const bandRightX = 50 + 26 * ribcageWidthFactor;

  const handleSelectAltSize = (size: string) => {
    setSelectedAltSize(size);
    if (onSelectSize) {
      onSelectSize(size);
    }
  };

  return (
    <div className="rounded-card border border-border bg-bg-surface p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-terracotta-subtle text-terracotta flex items-center justify-center border border-terracotta/20">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-semibold text-sm text-text-primary">
              Intimate Apparel & Bra Sizing Visualizer
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Deterministic Band & Cup engineering based on ISO/NIFT underbust-to-apex ratio
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-semibold px-2.5 py-1 rounded-badge bg-terracotta-subtle text-terracotta border border-terracotta/20 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            ISO 4416 / NIFT
          </span>
          <span className="text-[10px] uppercase font-semibold px-2.5 py-1 rounded-badge bg-accent-subtle/80 text-accent border border-accent/20 inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Zero Guesswork
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Visual Cup & Band Couture Diagram */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[280px] h-72 bg-bg-elevated/40 dark:bg-bg-elevated/20 rounded-card border border-border flex items-center justify-center p-3 select-none overflow-hidden group">
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-radial-gradient from-terracotta/5 to-transparent pointer-events-none" />

            <svg
              viewBox="0 0 100 130"
              className="w-full h-full drop-shadow-xs"
              role="img"
              aria-label="Couture technical bra sizing and cup projection diagram"
            >
              <defs>
                {/* 3D Cup Depth Gradient */}
                <radialGradient id="cupDepthGradLeft" cx="40%" cy="45%" r="65%">
                  <stop offset="0%" stopColor="var(--terracotta)" stopOpacity={apexGlowScale + 0.25} />
                  <stop offset="60%" stopColor="var(--terracotta)" stopOpacity={apexGlowScale * 0.8} />
                  <stop offset="100%" stopColor="var(--terracotta)" stopOpacity="0.08" />
                </radialGradient>
                <radialGradient id="cupDepthGradRight" cx="60%" cy="45%" r="65%">
                  <stop offset="0%" stopColor="var(--terracotta)" stopOpacity={apexGlowScale + 0.25} />
                  <stop offset="60%" stopColor="var(--terracotta)" stopOpacity={apexGlowScale * 0.8} />
                  <stop offset="100%" stopColor="var(--terracotta)" stopOpacity="0.08" />
                </radialGradient>

                {/* Underwire Metallic Sheen */}
                <linearGradient id="wireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--terracotta)" stopOpacity="0.7" />
                  <stop offset="50%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="var(--terracotta)" stopOpacity="0.7" />
                </linearGradient>

                {/* Torso Contour Gradient */}
                <linearGradient id="torsoSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--text-secondary)" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="var(--text-secondary)" stopOpacity="0.03" />
                </linearGradient>
              </defs>

              {/* 1. Anatomical Torso Silhouette (Upper ribcage, clavicle and shoulders) */}
              <path
                d={`
                  M 26 22
                  Q 38 27 50 28
                  Q 62 27 74 22
                  L 79 38
                  Q 77 62 ${bandRightX} 76
                  L ${bandRightX - 3} 96
                  Q 50 92 ${bandLeftX + 3} 96
                  L ${bandLeftX} 76
                  Q 23 62 21 38
                  Z
                `}
                fill="url(#torsoSkinGrad)"
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Clavicle / Collarbone Notch */}
              <path
                d="M 40 28 Q 50 32 60 28"
                fill="none"
                stroke="var(--text-tertiary)"
                strokeWidth="1"
                opacity="0.6"
              />

              {/* 2. Lateral Wings & Back Band */}
              <path
                d={`
                  M ${bandLeftX} 66
                  Q 32 67 36 68
                  L 36 78
                  Q 30 77 ${bandLeftX} 74
                  Z
                `}
                fill="var(--terracotta)"
                opacity={inspectZone === "band" || inspectZone === "all" ? 0.35 : 0.15}
                stroke="var(--terracotta)"
                strokeWidth="1.2"
              />
              <path
                d={`
                  M ${bandRightX} 66
                  Q 68 67 64 68
                  L 64 78
                  Q 70 77 ${bandRightX} 74
                  Z
                `}
                fill="var(--terracotta)"
                opacity={inspectZone === "band" || inspectZone === "all" ? 0.35 : 0.15}
                stroke="var(--terracotta)"
                strokeWidth="1.2"
              />

              {/* Wing Breathable Mesh Micro-Lines */}
              <line x1={bandLeftX + 3} y1="68" x2={bandLeftX + 3} y2="76" stroke="var(--terracotta)" strokeWidth="0.8" opacity="0.6" />
              <line x1={bandLeftX + 6} y1="67" x2={bandLeftX + 6} y2="77" stroke="var(--terracotta)" strokeWidth="0.8" opacity="0.6" />
              <line x1={bandRightX - 3} y1="68" x2={bandRightX - 3} y2="76" stroke="var(--terracotta)" strokeWidth="0.8" opacity="0.6" />
              <line x1={bandRightX - 6} y1="67" x2={bandRightX - 6} y2="77" stroke="var(--terracotta)" strokeWidth="0.8" opacity="0.6" />

              {/* 3. Underwire Cradles (Parabolic structural arcs) */}
              {/* Left Underwire Arc */}
              <path
                d={`
                  M 33 54
                  C 33 ${54 + cupRadiusY * 1.25}, 48 ${54 + cupRadiusY * 1.25}, 48 58
                `}
                fill="none"
                stroke="url(#wireGrad)"
                strokeWidth={inspectZone === "cups" || inspectZone === "all" ? "2.5" : "1.8"}
                strokeLinecap="round"
              />
              {/* Right Underwire Arc */}
              <path
                d={`
                  M 52 58
                  C 52 ${54 + cupRadiusY * 1.25}, 67 ${54 + cupRadiusY * 1.25}, 67 54
                `}
                fill="none"
                stroke="url(#wireGrad)"
                strokeWidth={inspectZone === "cups" || inspectZone === "all" ? "2.5" : "1.8"}
                strokeLinecap="round"
              />

              {/* 4. Contoured 3D Molded Cups */}
              {/* Left Cup Body */}
              <path
                d={`
                  M 33 54
                  C 33 42, 41 38, 41 38
                  C 43 45, 47 52, 48 58
                  C 48 68, 33 68, 33 54
                  Z
                `}
                fill="url(#cupDepthGradLeft)"
                stroke="var(--terracotta)"
                strokeWidth="1.5"
                opacity={inspectZone === "cups" || inspectZone === "all" ? 1 : 0.4}
              />

              {/* Right Cup Body */}
              <path
                d={`
                  M 67 54
                  C 67 42, 59 38, 59 38
                  C 57 45, 53 52, 52 58
                  C 52 68, 67 68, 67 54
                  Z
                `}
                fill="url(#cupDepthGradRight)"
                stroke="var(--terracotta)"
                strokeWidth="1.5"
                opacity={inspectZone === "cups" || inspectZone === "all" ? 1 : 0.4}
              />

              {/* Apex Contoured Highlight Lines */}
              <path
                d="M 37 49 Q 39 53 43 55"
                fill="none"
                stroke="var(--bg-surface)"
                strokeWidth="1"
                opacity="0.8"
                strokeLinecap="round"
              />
              <path
                d="M 63 49 Q 61 53 57 55"
                fill="none"
                stroke="var(--bg-surface)"
                strokeWidth="1"
                opacity="0.8"
                strokeLinecap="round"
              />

              {/* 5. Center Bridge / Sternum Gore */}
              <polygon
                points="47,56 53,56 50,66"
                fill={inspectZone === "gore" || inspectZone === "all" ? "var(--terracotta)" : "var(--accent)"}
                stroke="var(--border)"
                strokeWidth="1"
              />
              {/* Central Rivet Accent */}
              <circle cx="50" cy="58" r="1.5" fill="var(--bg-surface)" stroke="var(--terracotta)" strokeWidth="0.8" />

              {/* 6. Adjustable Shoulder Straps with Hardware Rings */}
              {/* Left Strap */}
              <line x1="32" y1="23" x2="41" y2="38" stroke="var(--accent)" strokeWidth="1.5" />
              <circle cx="34" cy="27" r="1.5" fill="none" stroke="var(--terracotta)" strokeWidth="1" />

              {/* Right Strap */}
              <line x1="68" y1="23" x2="59" y2="38" stroke="var(--accent)" strokeWidth="1.5" />
              <circle cx="66" cy="27" r="1.5" fill="none" stroke="var(--terracotta)" strokeWidth="1" />

              {/* 7. Underbust Ribcage Band Tension Line */}
              <path
                d={`
                  M ${bandLeftX} 76
                  Q 50 ${74 + (underbustMm > 900 ? 3 : 1)} ${bandRightX} 76
                `}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={inspectZone === "band" || inspectZone === "all" ? "3" : "1.8"}
                strokeDasharray="3 2"
              />
            </svg>

            {/* Central Badge Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-bg-surface/95 dark:bg-bg-surface/90 backdrop-blur-md px-4 py-2 rounded-card border border-border shadow-md">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-text-tertiary block">
                Calculated Size
              </span>
              <span className="font-display text-3xl font-bold text-accent leading-none block mt-0.5">
                {activeDisplaySize}
              </span>
              <span className="text-[10px] text-terracotta font-medium block mt-1">
                {currentCup.depthLabel} · ~{currentCup.volumeCc}cc
              </span>
            </div>
          </div>

          {/* Interactive Inspection Mode Pills */}
          <div className="flex items-center gap-1.5 mt-3">
            {[
              { id: "all", label: "Full Silhouette" },
              { id: "cups", label: "Cups & Wire" },
              { id: "band", label: "Ribcage Band" },
              { id: "gore", label: "Sternum Gore" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setInspectZone(tab.id as typeof inspectZone)}
                className={`text-[10px] font-medium px-2 py-0.5 rounded-badge border transition-colors ${
                  inspectZone === tab.id
                    ? "bg-accent text-white border-accent"
                    : "bg-bg-elevated/40 border-border text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-text-secondary mt-2 text-center">
            Band {sizing.bandSize}&quot; (Underbust: {Math.round(underbustMm / 10)}cm) · Cup {sizing.cupLetter} (+{sizing.diffInches}&quot; apex delta)
          </span>
        </div>

        {/* Adjusters, Equivalent Fits & Engineering Specs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quick Adjustment Range Sliders */}
          <div className="space-y-3 bg-bg-elevated/40 p-4 rounded-card border border-border">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-accent-subtle text-accent flex items-center justify-center text-[10px] font-bold">1</span>
                  Snug Underbust Band
                </span>
                <span className="font-mono text-accent font-semibold">
                  {formatMeasurement(underbustMm, displayUnit)} ({Math.round(underbustMm / 25.4)}&quot; · {Math.round(underbustMm / 10)} cm)
                </span>
              </div>
              <input
                type="range"
                min="650"
                max="1150"
                step="10"
                value={underbustMm}
                onChange={(e) => {
                  setUnderbustMm(parseInt(e.target.value, 10));
                  setSelectedAltSize(null);
                }}
                className="w-full accent-accent h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
                aria-label="Adjust underbust ribcage measurement"
              />
              <div className="flex items-center justify-between text-[10px] text-text-tertiary mt-1">
                <span>65 cm (Band 30)</span>
                <span>Horizontal directly beneath breasts</span>
                <span>115 cm (Band 44)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-accent-subtle text-accent flex items-center justify-center text-[10px] font-bold">2</span>
                  Bust Apex Circumference
                </span>
                <span className="font-mono text-accent font-semibold">
                  {formatMeasurement(bustMm, displayUnit)} ({Math.round(bustMm / 25.4)}&quot; · {Math.round(bustMm / 10)} cm)
                </span>
              </div>
              <input
                type="range"
                min={underbustMm}
                max={underbustMm + 280}
                step="10"
                value={bustMm}
                onChange={(e) => {
                  setBustMm(parseInt(e.target.value, 10));
                  setSelectedAltSize(null);
                }}
                className="w-full accent-accent h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
                aria-label="Adjust bust apex circumference measurement"
              />
              <div className="flex items-center justify-between text-[10px] text-text-tertiary mt-1">
                <span>Even with band</span>
                <span>Around fullest point of bust apex</span>
                <span>+28 cm (+11&quot;)</span>
              </div>
            </div>
          </div>

          {/* Equivalent Cup Volume Options with Band Tuning */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-accent" />
                Equivalent Cup Volume Fits (Identical ~{currentCup.volumeCc}cc Cup Volume)
              </span>
              <span className="text-[10px] text-text-tertiary">
                Same cup depth, tuned band feel
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectAltSize(sizing.sisterSizes.tighterBand)}
                className={`p-3 rounded-card border text-left min-h-[48px] transition-all ${
                  selectedAltSize === sizing.sisterSizes.tighterBand
                    ? "border-accent bg-accent-subtle/50 font-semibold shadow-xs"
                    : "border-border bg-bg-surface hover:bg-bg-elevated"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary block">
                    {sizing.sisterSizes.tighterBand}
                  </span>
                  <span className="text-[9px] uppercase px-1 py-0.5 rounded-badge bg-border/60 text-text-tertiary">
                    -1 Band
                  </span>
                </div>
                <span className="text-[10px] text-text-secondary block mt-1">
                  Firmer grip · Maximum support
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAltSize(sizing.fullBraSize)}
                className={`p-3 rounded-card border text-left min-h-[48px] transition-all ${
                  selectedAltSize === null || selectedAltSize === sizing.fullBraSize
                    ? "border-accent bg-accent text-white font-semibold shadow-xs"
                    : "border-border bg-bg-surface hover:bg-bg-elevated"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold block">
                    {sizing.fullBraSize}
                  </span>
                  <span className="text-[9px] uppercase px-1 py-0.5 rounded-badge bg-white/20 text-white">
                    Primary
                  </span>
                </div>
                <span className="text-[10px] opacity-80 block mt-1">
                  Standard anchor · Recommended
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAltSize(sizing.sisterSizes.looserBand)}
                className={`p-3 rounded-card border text-left min-h-[48px] transition-all ${
                  selectedAltSize === sizing.sisterSizes.looserBand
                    ? "border-accent bg-accent-subtle/50 font-semibold shadow-xs"
                    : "border-border bg-bg-surface hover:bg-bg-elevated"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary block">
                    {sizing.sisterSizes.looserBand}
                  </span>
                  <span className="text-[9px] uppercase px-1 py-0.5 rounded-badge bg-border/60 text-text-tertiary">
                    +1 Band
                  </span>
                </div>
                <span className="text-[10px] text-text-secondary block mt-1">
                  Relaxed band · Easy breathing
                </span>
              </button>
            </div>
          </div>

          {/* 4 Anatomical Golden Rules */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-card bg-bg-elevated/40 border border-border text-[11px]">
              <span className="font-semibold text-text-primary flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Underband Anchor
              </span>
              <span className="text-text-secondary text-[10px] block mt-0.5">
                Carries 80% of breast mass support horizontally.
              </span>
            </div>
            <div className="p-2.5 rounded-card bg-bg-elevated/40 border border-border text-[11px]">
              <span className="font-semibold text-text-primary flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Center Gore Bridge
              </span>
              <span className="text-text-secondary text-[10px] block mt-0.5">
                Lies flat against sternum with zero cup tenting.
              </span>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-3 rounded-card bg-bg-elevated/40 border border-border text-xs text-text-secondary leading-relaxed">
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
              <span>{sizing.explanation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
