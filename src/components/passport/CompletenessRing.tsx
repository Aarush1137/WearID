"use client";

import React from "react";

interface CompletenessRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function CompletenessRing({
  percentage,
  size = 56,
  strokeWidth = 4,
}: CompletenessRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  let strokeColor = "var(--confidence-low)";
  if (clampedPct >= 85) strokeColor = "var(--accent)";
  else if (clampedPct >= 50) strokeColor = "var(--confidence-medium)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute font-semibold text-xs text-text-primary">
        {clampedPct}%
      </span>
    </div>
  );
}
