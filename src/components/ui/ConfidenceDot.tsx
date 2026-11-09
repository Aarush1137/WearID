import * as React from "react";
import { cn } from "@/lib/utils";

export type ConfidenceLevel = "high" | "medium" | "low" | "none";

export interface ConfidenceDotProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  level?: ConfidenceLevel;
  score?: number; // 0.0 to 1.0 or 0 to 100
  showLabel?: boolean;
  labelText?: string;
  dotClassName?: string;
}

export function getConfidenceLevel(score: number): ConfidenceLevel {
  const normalized = score > 1 ? score / 100 : score;
  if (normalized >= 0.85) return "high";
  if (normalized >= 0.65) return "medium";
  if (normalized >= 0.40) return "low";
  return "none";
}

const levelLabels: Record<ConfidenceLevel, string> = {
  high: "High Confidence (>85%)",
  medium: "Medium Confidence (65–85%)",
  low: "Low Confidence (40–65%)",
  none: "Insufficient Data (<40%)",
};

const levelClasses: Record<ConfidenceLevel, string> = {
  high: "bg-[var(--confidence-high)]",
  medium: "bg-[var(--confidence-medium)]",
  low: "bg-[var(--confidence-low)]",
  none: "bg-[var(--confidence-none)]",
};

const ConfidenceDot = React.forwardRef<HTMLSpanElement, ConfidenceDotProps>(
  (
    {
      level: explicitLevel,
      score,
      showLabel = false,
      labelText,
      className,
      dotClassName,
      title,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const resolvedLevel: ConfidenceLevel =
      explicitLevel ?? (score !== undefined ? getConfidenceLevel(score) : "none");

    const description = labelText || levelLabels[resolvedLevel];
    const computedAriaLabel = ariaLabel || description;

    return (
      <span
        ref={ref}
        role="status"
        aria-label={computedAriaLabel}
        title={title || description}
        className={cn("inline-flex items-center gap-1.5", className)}
        {...props}
      >
        <span
          className={cn(
            "inline-block h-2 w-2 shrink-0 rounded-full transition-colors",
            levelClasses[resolvedLevel],
            dotClassName
          )}
          aria-hidden="true"
        />
        {showLabel && (
          <span className="text-xs font-sans font-medium text-[var(--text-secondary)]">
            {description}
          </span>
        )}
      </span>
    );
  }
);
ConfidenceDot.displayName = "ConfidenceDot";

export { ConfidenceDot };
