"use client";

import React from "react";
import { DimensionExplanation } from "@/core/types";
import { formatMeasurement, DisplayUnit } from "@/core/formatters";
import { Activity } from "lucide-react";

interface FitZoneVisualizerProps {
  dimensionBreakdown: DimensionExplanation[];
  displayUnit: DisplayUnit;
}

export function FitZoneVisualizer({
  dimensionBreakdown,
  displayUnit,
}: FitZoneVisualizerProps) {
  if (!dimensionBreakdown || dimensionBreakdown.length === 0) {
    return null;
  }

  return (
    <div
      className="p-5 rounded-card border border-border bg-bg-surface shadow-xs"
      role="region"
      aria-label="Garment Fit & Ease Tension Gauge"
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          <h4 className="font-semibold text-sm text-text-primary">
            Fit Zone & Tension Visualizer
          </h4>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            Ideal Ease
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            Tolerance Boundary
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
            Tension / Negative Ease
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {dimensionBreakdown.map((item, idx) => {
          const { min, max } = item.easeTargetMm;
          const delta = item.easeDeltaMm;

          // Chart bounds for visualization: range from min - 60 to max + 60
          const chartMin = Math.min(-20, min - 40);
          const chartMax = Math.max(120, max + 60);
          const span = chartMax - chartMin;

          // Target zone percentages
          const zoneLeftPct = Math.max(0, Math.min(100, ((min - chartMin) / span) * 100));
          const zoneWidthPct = Math.max(10, Math.min(100 - zoneLeftPct, ((max - min) / span) * 100));

          // Current delta position percentage
          const markerPct = Math.max(2, Math.min(98, ((delta - chartMin) / span) * 100));

          // Color classification
          let statusColor = "bg-emerald-600 text-emerald-950 border-emerald-300";
          let badgeColor = "bg-emerald-100 text-emerald-800";
          let statusText = "Ideal Ease";

          if (delta < 0) {
            statusColor = "bg-rose-600 text-rose-950 border-rose-300";
            badgeColor = "bg-rose-100 text-rose-800";
            statusText = "Negative Ease (Tension)";
          } else if (item.status === "tight") {
            statusColor = "bg-amber-500 text-amber-950 border-amber-300";
            badgeColor = "bg-amber-100 text-amber-800";
            statusText = "Snug (Low Ease)";
          } else if (item.status === "loose") {
            statusColor = "bg-amber-500 text-amber-950 border-amber-300";
            badgeColor = "bg-amber-100 text-amber-800";
            statusText = "Generous (High Ease)";
          }

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary capitalize">
                    {item.dimension}
                  </span>
                  <span className={`px-2 py-0.5 rounded-badge text-[10px] font-semibold uppercase tracking-wider ${badgeColor}`}>
                    {statusText}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-text-primary">
                    {delta > 0 ? `+${delta} mm` : `${delta} mm`} ease
                  </span>
                  <span className="text-[11px] text-text-secondary ml-1">
                    ({formatMeasurement(delta, displayUnit)})
                  </span>
                </div>
              </div>

              {/* Progress Zone Gauge */}
              <div className="relative h-6 bg-bg-elevated rounded-[6px] border border-border overflow-hidden flex items-center">
                {/* Target Range Highlight Box */}
                <div
                  className="absolute h-full bg-emerald-100/80 border-x border-emerald-300/80 transition-all duration-300"
                  style={{
                    left: `${zoneLeftPct}%`,
                    width: `${zoneWidthPct}%`,
                  }}
                  title={`Target ease zone: +${min}mm to +${max}mm`}
                />

                {/* Center / Ideal Ease Line */}
                <div
                  className="absolute top-0 bottom-0 w-[1px] bg-emerald-400"
                  style={{
                    left: `${zoneLeftPct + zoneWidthPct / 2}%`,
                  }}
                />

                {/* Current Value Indicator Marker */}
                <div
                  className={`absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-all duration-500 transform -translate-x-1/2 ${statusColor}`}
                  style={{ left: `${markerPct}%` }}
                  title={`Current ease delta: ${delta}mm`}
                  aria-label={`${item.dimension} ease: ${delta}mm`}
                />
              </div>

              {/* Metric Breakdown Details */}
              <div className="flex items-center justify-between text-[11px] text-text-secondary px-0.5">
                <span>
                  Body: {formatMeasurement(item.bodyMeasurementMm, displayUnit)} ({item.bodyMeasurementMm}mm)
                </span>
                <span>
                  Target: +{min}mm to +{max}mm
                </span>
                <span>
                  Garment: {formatMeasurement(item.garmentSpecMm, displayUnit)} ({item.garmentSpecMm}mm)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
