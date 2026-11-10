"use client";

import React, { useState } from "react";
import { calculateBraSize, BraSizingResult } from "@/core/sizing/braSizing";
import { DisplayUnit, formatMeasurement } from "@/core/formatters";
import { Sparkles, Heart, Info, ArrowRight, ShieldCheck, Check } from "lucide-react";

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
  const [selectedSister, setSelectedSister] = useState<string | null>(null);

  // Compute deterministic bra sizing
  const sizing: BraSizingResult = calculateBraSize(underbustMm, bustMm);
  const activeDisplaySize = selectedSister || sizing.fullBraSize;

  return (
    <div className="rounded-card border border-border bg-bg-surface p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-terracotta" />
            <h3 className="font-semibold text-sm text-text-primary">
              Intimate Apparel & Bra Sizing Visualizer
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Deterministic Band & Cup calculation based on ISO/NIFT underbust-to-apex ratio
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-badge bg-terracotta-subtle text-terracotta inline-flex items-center gap-1 self-start sm:self-auto">
          <Sparkles className="w-3 h-3" />
          Sister Size Engine
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Visual Cup & Band Diagram */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative w-48 h-56 sm:w-56 sm:h-64 bg-bg-elevated/40 rounded-card border border-border flex items-center justify-center p-3 select-none">
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xs" role="img" aria-label="Bra sizing anatomical diagram">
              <defs>
                <linearGradient id="braGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--terracotta)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--terracotta)" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Upper torso & neck contour */}
              <path
                d="M 38 15 Q 50 20 62 15 L 72 26 L 68 44 Q 50 36 32 44 L 28 26 Z"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.2"
              />

              {/* Bra cups outline */}
              {/* Left Cup */}
              <ellipse
                cx="40"
                cy="56"
                rx="11"
                ry="13"
                fill="url(#braGrad)"
                stroke="var(--terracotta)"
                strokeWidth="2"
              />
              {/* Right Cup */}
              <ellipse
                cx="60"
                cy="56"
                rx="11"
                ry="13"
                fill="url(#braGrad)"
                stroke="var(--terracotta)"
                strokeWidth="2"
              />

              {/* Center Gore */}
              <line x1="49" y1="56" x2="51" y2="56" stroke="var(--terracotta)" strokeWidth="2.5" />

              {/* Shoulder Straps */}
              <line x1="38" y1="20" x2="40" y2="44" stroke="var(--terracotta)" strokeWidth="1.8" />
              <line x1="62" y1="20" x2="60" y2="44" stroke="var(--terracotta)" strokeWidth="1.8" />

              {/* Underbust Ribcage Band Line */}
              <line
                x1="26"
                y1="69"
                x2="74"
                y2="69"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeDasharray="2 2"
              />

              {/* Lateral Wings */}
              <path
                d="M 29 64 Q 24 67 22 72 L 26 73 L 30 69 Z"
                fill="var(--terracotta)"
                opacity="0.6"
              />
              <path
                d="M 71 64 Q 76 67 78 72 L 74 73 L 70 69 Z"
                fill="var(--terracotta)"
                opacity="0.6"
              />
            </svg>

            {/* Central Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-bg-surface/95 backdrop-blur-xs px-3.5 py-1.5 rounded-card border border-border shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-text-secondary block">
                Calculated Size
              </span>
              <span className="font-display text-2xl font-bold text-accent leading-none block mt-0.5">
                {activeDisplaySize}
              </span>
            </div>
          </div>

          <span className="text-[11px] text-text-secondary mt-2 text-center">
            Band {sizing.bandSize} (Underbust: {Math.round(underbustMm / 10)}cm) · Cup {sizing.cupLetter} (+{sizing.diffInches}&quot; apex)
          </span>
        </div>

        {/* Adjusters & Sister Sizes */}
        <div className="md:col-span-7 space-y-4">
          {/* Quick Adjustment Range Sliders */}
          <div className="space-y-3 bg-bg-elevated/40 p-3.5 rounded-card border border-border">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-text-primary">
                  1. Snug Underbust Band
                </span>
                <span className="font-mono text-accent font-semibold">
                  {formatMeasurement(underbustMm, displayUnit)} ({Math.round(underbustMm / 25.4)}&quot;)
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
                  setSelectedSister(null);
                }}
                className="w-full accent-accent h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
                aria-label="Adjust underbust ribcage measurement"
              />
              <span className="text-[10px] text-text-tertiary block mt-0.5">
                Directly beneath breasts, holding breath slightly.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-text-primary">
                  2. Bust Apex Circumference
                </span>
                <span className="font-mono text-accent font-semibold">
                  {formatMeasurement(bustMm, displayUnit)} ({Math.round(bustMm / 25.4)}&quot;)
                </span>
              </div>
              <input
                type="range"
                min={underbustMm}
                max={underbustMm + 300}
                step="10"
                value={bustMm}
                onChange={(e) => {
                  setBustMm(parseInt(e.target.value, 10));
                  setSelectedSister(null);
                }}
                className="w-full accent-accent h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
                aria-label="Adjust bust apex circumference measurement"
              />
              <span className="text-[10px] text-text-tertiary block mt-0.5">
                Around fullest point of bust standing straight.
              </span>
            </div>
          </div>

          {/* Sister Sizing Selector */}
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary block mb-2">
              Alternative Sister Sizes (Same Cup Volume)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedSister(sizing.sisterSizes.tighterBand)}
                className={`p-2.5 rounded-card border text-left min-h-[44px] transition-all ${
                  selectedSister === sizing.sisterSizes.tighterBand
                    ? "border-accent bg-accent-subtle/50 font-semibold shadow-xs"
                    : "border-border bg-bg-surface hover:bg-bg-elevated"
                }`}
              >
                <span className="text-xs font-semibold text-text-primary block">
                  {sizing.sisterSizes.tighterBand}
                </span>
                <span className="text-[10px] text-text-secondary block mt-0.5">
                  Firmer band feel
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSister(sizing.fullBraSize)}
                className={`p-2.5 rounded-card border text-left min-h-[44px] transition-all ${
                  selectedSister === null || selectedSister === sizing.fullBraSize
                    ? "border-accent bg-accent text-white font-semibold shadow-xs"
                    : "border-border bg-bg-surface hover:bg-bg-elevated"
                }`}
              >
                <span className="text-xs font-semibold block">
                  {sizing.fullBraSize}
                </span>
                <span className="text-[10px] opacity-80 block mt-0.5">
                  Standard anchor
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSister(sizing.sisterSizes.looserBand)}
                className={`p-2.5 rounded-card border text-left min-h-[44px] transition-all ${
                  selectedSister === sizing.sisterSizes.looserBand
                    ? "border-accent bg-accent-subtle/50 font-semibold shadow-xs"
                    : "border-border bg-bg-surface hover:bg-bg-elevated"
                }`}
              >
                <span className="text-xs font-semibold text-text-primary block">
                  {sizing.sisterSizes.looserBand}
                </span>
                <span className="text-[10px] text-text-secondary block mt-0.5">
                  Relaxed band feel
                </span>
              </button>
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
