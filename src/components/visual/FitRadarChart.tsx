"use client";

import React from "react";
import { DimensionExplanation, FitType } from "@/core/types";
import { Target, Activity } from "lucide-react";

interface FitRadarChartProps {
  dimensionBreakdown: DimensionExplanation[];
  fitIntent: FitType;
}

export function FitRadarChart({ dimensionBreakdown, fitIntent }: FitRadarChartProps) {
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
      // Target range midpoint
      const targetMid = (dim.easeTargetMm.min + dim.easeTargetMm.max) / 2;
      // Map delta to factor: exactly at midpoint -> 0.75, higher -> up to 1.15, lower -> down to 0.3
      const ratio = targetMid > 0 ? delta / targetMid : 1;
      factor = Math.max(0.3, Math.min(1.15, 0.75 * ratio));
    }
    const coords = getCoordinates(i, factor);
    return `${coords.x},${coords.y}`;
  }).join(" ");

  // Concentric radar web rings (25%, 50%, 75%, 100%)
  const webRings = [0.25, 0.5, 0.75, 1.0];

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
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
            Recommended Garment Spec
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 select-none">
          <svg viewBox="0 0 200 200" className="w-full h-full" role="img" aria-label="5-Axis Fit Radar Polygon Chart">
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
            {axes.map((_, i) => {
              const c = getCoordinates(i, 1.05);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={c.x}
                  y2={c.y}
                  stroke="var(--border)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Target Fit Zone Polygon (Green Area) */}
            <polygon
              points={targetPoints}
              fill="#10B981"
              fillOpacity="0.18"
              stroke="#059669"
              strokeWidth="1.5"
            />

            {/* Garment Actual Spec Polygon (Accent Stroke) */}
            <polygon
              points={garmentPoints}
              fill="var(--accent)"
              fillOpacity="0.28"
              stroke="var(--accent)"
              strokeWidth="2.2"
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
              return (
                <circle
                  key={i}
                  cx={c.x}
                  cy={c.y}
                  r="3.5"
                  fill="var(--accent)"
                  stroke="var(--bg-surface)"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Axis Labels */}
            {axes.map((axis, i) => {
              const c = getCoordinates(i, 1.25);
              return (
                <text
                  key={i}
                  x={c.x}
                  y={c.y + 3}
                  textAnchor="middle"
                  className="text-[9px] font-sans font-medium fill-text-primary uppercase tracking-wider"
                >
                  {axis.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Informative Guidance */}
        <div className="max-w-xs space-y-2 text-xs text-text-secondary leading-relaxed">
          <p>
            The green polygon marks your intended <strong className="text-text-primary capitalize">{fitIntent}</strong> silhouette tolerance.
          </p>
          <p>
            The dark polygon shows how the garment cut distributes ease. Balanced coverage inside the target polygon confirms harmonious drape across shoulders, chest, and torso.
          </p>
        </div>
      </div>
    </div>
  );
}
