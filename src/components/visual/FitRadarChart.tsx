"use client";

import React, { useState } from "react";
import { DimensionExplanation, FitType } from "@/core/types";
import { Target, Activity, CheckCircle2, Info } from "lucide-react";

interface FitRadarChartProps {
  dimensionBreakdown: DimensionExplanation[];
  fitIntent: FitType;
}

export function FitRadarChart({ dimensionBreakdown, fitIntent }: FitRadarChartProps) {
  const [activeAxisKey, setActiveAxisKey] = useState<string | null>(null);

  // 5 standard axes: Chest, Waist, Shoulders, Length, Sleeve
  const axes = [
    { label: "Chest Ease", key: "chest" },
    { label: "Waist Room", key: "waist" },
    { label: "Shoulder Span", key: "shoulders" },
    { label: "Torso Length", key: "length" },
    { label: "Sleeve Span", key: "sleeve" },
  ];

  const totalAxes = axes.length;
  const radius = 65;
  const center = 100;

  // Polar coordinate helper: angle in radians
  const getCoordinates = (index: number, valueFactor: number) => {
    // Top axis starts at -PI / 2
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
    const r = radius * Math.max(0.15, Math.min(1.2, valueFactor));
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Compute points for target ideal zone (normalized factor ~0.75)
  const targetPoints = axes.map((_, i) => {
    const coords = getCoordinates(i, 0.75);
    return `${coords.x},${coords.y}`;
  }).join(" ");

  // Compute points for garment actual score
  const garmentPoints = axes.map((axis, i) => {
    const dim = dimensionBreakdown.find((d) => d.dimension === axis.key);
    let factor = 0.75;
    if (dim) {
      const delta = dim.easeDeltaMm;
      const targetMid = (dim.easeTargetMm.min + dim.easeTargetMm.max) / 2;
      const ratio = targetMid > 0 ? delta / targetMid : 1;
      factor = Math.max(0.3, Math.min(1.15, 0.75 * ratio));
    }
    const coords = getCoordinates(i, factor);
    return `${coords.x},${coords.y}`;
  }).join(" ");

  // Concentric radar web rings (25%, 50%, 75%, 100%)
  const webRings = [0.25, 0.5, 0.75, 1.0];

  const activeDim = activeAxisKey
    ? dimensionBreakdown.find((d) => d.dimension === activeAxisKey)
    : null;

  return (
    <div className="rounded-card border border-border bg-bg-surface p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          <h4 className="font-semibold text-sm text-text-primary">
            5-Axis Fit Polygon Radar
          </h4>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/30 border border-emerald-600 inline-block" />
            Target Fit Zone ({fitIntent})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block shadow-xs" />
            Recommended Garment Spec
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 select-none">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xs" role="img" aria-label="5-Axis Fit Radar Polygon Chart">
            <defs>
              <linearGradient id="targetZoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.10" />
              </linearGradient>
              <linearGradient id="garmentSpecGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--terracotta)" stopOpacity="0.18" />
              </linearGradient>
              <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="var(--accent)" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Concentric Web Rings */}
            {webRings.map((scale, ringIdx) => {
              const points = axes.map((_, i) => {
                const c = getCoordinates(i, scale);
                return `${c.x},${c.y}`;
              }).join(" ");
              return (
                <polygon
                  key={ringIdx}
                  points={points}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray={scale === 0.75 ? "0" : "2 2"}
                />
              );
            })}

            {/* Radial Spoke Lines */}
            {axes.map((axis, i) => {
              const c = getCoordinates(i, 1.05);
              const isHighlight = activeAxisKey === axis.key;
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={c.x}
                  y2={c.y}
                  stroke={isHighlight ? "var(--terracotta)" : "var(--border)"}
                  strokeWidth={isHighlight ? "1.5" : "1"}
                  className="transition-colors"
                />
              );
            })}

            {/* Target Fit Zone Polygon (Green Area) */}
            <polygon
              points={targetPoints}
              fill="url(#targetZoneGrad)"
              stroke="#059669"
              strokeWidth="1.5"
              className="transition-all duration-500 ease-out"
            />

            {/* Garment Actual Spec Polygon (Accent Stroke with glow) */}
            <polygon
              points={garmentPoints}
              fill="url(#garmentSpecGrad)"
              stroke="var(--accent)"
              strokeWidth="2.2"
              filter="url(#radarGlow)"
              className="transition-all duration-500 ease-out"
            />

            {/* Vertices Nodes */}
            {axes.map((axis, i) => {
              const dim = dimensionBreakdown.find((d) => d.dimension === axis.key);
              let factor = 0.75;
              if (dim) {
                const targetMid = (dim.easeTargetMm.min + dim.easeTargetMm.max) / 2;
                const ratio = targetMid > 0 ? dim.easeDeltaMm / targetMid : 1;
                factor = Math.max(0.3, Math.min(1.15, 0.75 * ratio));
              }
              const c = getCoordinates(i, factor);
              const isSelected = activeAxisKey === axis.key;
              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onClick={() => setActiveAxisKey(isSelected ? null : axis.key)}
                  onMouseEnter={() => setActiveAxisKey(axis.key)}
                  onMouseLeave={() => setActiveAxisKey(null)}
                >
                  {isSelected && (
                    <circle cx={c.x} cy={c.y} r="7" fill="var(--terracotta)" opacity="0.3" className="animate-pulse-subtle" />
                  )}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isSelected ? "4.5" : "3.5"}
                    fill={isSelected ? "var(--terracotta)" : "var(--accent)"}
                    stroke="var(--bg-surface)"
                    strokeWidth="1.5"
                    className="transition-all"
                  />
                </g>
              );
            })}

            {/* Axis Labels */}
            {axes.map((axis, i) => {
              const c = getCoordinates(i, 1.25);
              const isSelected = activeAxisKey === axis.key;
              return (
                <text
                  key={i}
                  x={c.x}
                  y={c.y + 3}
                  textAnchor="middle"
                  onClick={() => setActiveAxisKey(isSelected ? null : axis.key)}
                  className={`text-[9px] font-sans font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                    isSelected ? "fill-terracotta font-bold" : "fill-text-primary"
                  }`}
                >
                  {axis.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Informative Guidance & Active Node Inspector */}
        <div className="max-w-xs space-y-2.5 text-xs text-text-secondary leading-relaxed">
          {activeDim ? (
            <div className="p-3 rounded-card bg-bg-elevated/60 border border-terracotta/30">
              <span className="font-semibold text-xs text-text-primary capitalize block">
                {activeDim.dimension} Dimension Insight
              </span>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-text-secondary">Ease Delta:</span>
                <span className="font-mono font-semibold text-accent">+{activeDim.easeDeltaMm} mm</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-secondary">Target Range:</span>
                <span className="font-mono text-text-tertiary">
                  {activeDim.easeTargetMm.min}–{activeDim.easeTargetMm.max} mm
                </span>
              </div>
              <span className="text-[10px] text-text-secondary mt-1.5 block leading-normal border-t border-border pt-1">
                {activeDim.rationale}
              </span>
            </div>
          ) : (
            <>
              <p>
                The green polygon marks your intended <strong className="text-text-primary capitalize">{fitIntent}</strong> silhouette tolerance.
              </p>
              <p>
                The dark contoured polygon tracks where finished fabric floats or grips. Balanced coverage inside the target zone confirms harmonious drape across shoulders, chest, and torso.
              </p>
              <span className="text-[10px] text-text-tertiary block mt-1">
                Tip: Tap or hover any radar vertex to inspect exact millimeter ease.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
