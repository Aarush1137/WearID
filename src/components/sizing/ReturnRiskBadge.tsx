import React from "react";
import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { ReturnRatePrediction } from "@/core/sizing/returnRatePredictor";
import { cn } from "@/lib/utils";

export interface ReturnRiskBadgeProps {
  prediction: ReturnRatePrediction;
  className?: string;
  showDrivers?: boolean;
  showAdvice?: boolean;
  compact?: boolean;
}

export const ReturnRiskBadge: React.FC<ReturnRiskBadgeProps> = ({
  prediction,
  className,
  showDrivers = false,
  showAdvice = false,
  compact = false,
}) => {
  const { riskScore, riskLevel, primaryRiskDrivers, actionableAdvice } = prediction;

  const config = {
    low: {
      label: "Low Return Risk",
      containerClass:
        "bg-[var(--success-subtle,rgba(16,185,129,0.1))] text-[var(--success,#047857)] border-emerald-200 dark:border-emerald-800/40",
      dotClass: "bg-emerald-500",
      icon: ShieldCheck,
    },
    moderate: {
      label: "Moderate Return Risk",
      containerClass:
        "bg-[var(--warning-subtle,rgba(245,158,11,0.1))] text-[var(--warning,#b45309)] border-amber-200 dark:border-amber-800/40",
      dotClass: "bg-amber-500",
      icon: AlertTriangle,
    },
    high: {
      label: "High Return Risk",
      containerClass:
        "bg-[var(--terracotta-subtle,rgba(225,29,72,0.1))] text-[var(--terracotta,#be123c)] border-rose-200 dark:border-rose-800/40",
      dotClass: "bg-rose-500",
      icon: AlertOctagon,
    },
  }[riskLevel];

  const Icon = config.icon;

  if (compact) {
    return (
      <span
        data-testid="return-risk-badge-compact"
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
          config.containerClass,
          className
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)} />
        <span className="font-semibold">{riskScore}%</span>
        <span className="text-[11px] opacity-90">{config.label}</span>
      </span>
    );
  }

  return (
    <div
      data-testid="return-risk-badge"
      className={cn(
        "rounded-xl border p-3.5 transition-all text-sm",
        config.containerClass,
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 shrink-0" />
          <span className="font-semibold tracking-tight">{config.label}</span>
        </div>
        <div className="flex items-center gap-1 font-mono font-bold text-sm">
          <span>{riskScore}%</span>
          <span className="text-xs font-normal opacity-80">projected</span>
        </div>
      </div>

      {showAdvice && actionableAdvice && (
        <div className="mt-2 text-xs opacity-90 leading-relaxed flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{actionableAdvice}</span>
        </div>
      )}

      {showDrivers && primaryRiskDrivers.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-current/15 text-xs space-y-1">
          <p className="font-medium text-[11px] uppercase tracking-wider opacity-75">
            Key Risk Drivers:
          </p>
          <ul className="list-disc pl-4 space-y-0.5 opacity-90">
            {primaryRiskDrivers.map((driver, idx) => (
              <li key={idx} className="leading-snug">
                {driver}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
