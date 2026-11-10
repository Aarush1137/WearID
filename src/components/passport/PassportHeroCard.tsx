"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProfileStore } from "@/core/state/profileStore";
import { formatMeasurement, calculateProfileCompleteness, getConfidenceMeta } from "@/core/formatters";
import { CompletenessRing } from "./CompletenessRing";
import { ShieldCheck, Sparkles, Share2, Ruler, Shirt, User, Layers, Heart } from "lucide-react";
import { BodySilhouetteCanvas } from "@/components/visual/BodySilhouetteCanvas";
import { calculateBraSize } from "@/core/sizing/braSizing";

export function PassportHeroCard() {
  const { getActiveProfile, displayUnit } = useProfileStore();
  const profile = getActiveProfile();
  const [displayMode, setDisplayMode] = useState<"visual" | "numbers">("visual");
  const completeness = calculateProfileCompleteness(profile.measurements);
  const confidence = getConfidenceMeta(completeness.pct >= 85 ? 0.95 : completeness.pct >= 50 ? 0.75 : 0.45);

  const biometricItems = [
    { label: "Chest (Girth)", value: profile.measurements.chestMm, key: "chest" },
    { label: "Shoulders (Acromion)", value: profile.measurements.shoulderWidthMm, key: "shoulders" },
    { label: "Natural Waist", value: profile.measurements.waistMm, key: "waist" },
    { label: "High Hips", value: profile.measurements.hipsMm, key: "hips" },
    { label: "Stature Height", value: profile.measurements.heightMm, key: "height" },
    { label: "Inseam to Floor", value: profile.measurements.inseamMm, key: "inseam" },
  ];

  const braSizing =
    profile.gender === "female" && profile.measurements.chestMm
      ? calculateBraSize(
          profile.measurements.waistMm ? Math.round(profile.measurements.waistMm * 1.05) : 800,
          profile.measurements.chestMm
        )
      : null;

  return (
    <div className="rounded-card border border-border bg-bg-surface p-6 sm:p-8 shadow-sm">
      {/* Header with Sovereign Passport Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-badge bg-accent-subtle/70 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sovereign Measurement Passport · WearID
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-text-primary">
            {profile.name}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Deterministic fit calibrated to canonical millimeter standards · Private by default
          </p>
        </div>

        {/* Completeness Ring & Status */}
        <div className="flex items-center gap-3 bg-bg-elevated/60 px-4 py-2.5 rounded-card border border-border">
          <CompletenessRing percentage={completeness.pct} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${confidence.dotColorClass}`} />
              <span className="text-xs font-semibold text-text-primary">
                {confidence.label}
              </span>
            </div>
            <span className="text-[11px] text-text-secondary">
              {completeness.pct >= 85
                ? "Full garment precision"
                : `${completeness.missingLabels.length} dimensions missing`}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Biometrics View (Toggle between Visual Silhouette & Metric Grid) */}
      <div className="py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-text-secondary">
              Anatomical Biometrics
            </span>
            <div className="flex items-center gap-1 bg-bg-elevated p-0.5 rounded-btn text-xs">
              <button
                type="button"
                onClick={() => setDisplayMode("visual")}
                className={`px-2.5 py-1 rounded-btn text-xs font-medium transition-colors flex items-center gap-1 ${
                  displayMode === "visual"
                    ? "bg-bg-surface text-text-primary font-semibold shadow-xs"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <User className="w-3 h-3" />
                Visual Mannequin
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("numbers")}
                className={`px-2.5 py-1 rounded-btn text-xs font-medium transition-colors flex items-center gap-1 ${
                  displayMode === "numbers"
                    ? "bg-bg-surface text-text-primary font-semibold shadow-xs"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Layers className="w-3 h-3" />
                Numbers ({displayUnit.toUpperCase()})
              </button>
            </div>
          </div>

          <Link
            href="/onboarding"
            className="text-xs font-medium text-accent hover:text-accent-hover inline-flex items-center gap-1"
          >
            <Ruler className="w-3.5 h-3.5" />
            Calibrate Tape Measures
          </Link>
        </div>

        {displayMode === "visual" ? (
          <BodySilhouetteCanvas
            measurements={profile.measurements}
            gender={profile.gender}
            displayUnit={displayUnit}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {biometricItems.map((item) => {
              const hasVal = Boolean(item.value && item.value > 0);
              return (
                <div
                  key={item.key}
                  className={`p-3.5 rounded-card border transition-colors ${
                    hasVal
                      ? "bg-bg-elevated/40 border-border"
                      : "bg-bg-surface border-dashed border-border-strong/60"
                  }`}
                >
                  <span className="text-[11px] text-text-secondary block font-medium">
                    {item.label}
                  </span>
                  <span className="font-sans font-semibold text-lg text-text-primary mt-1 block">
                    {hasVal ? formatMeasurement(item.value, displayUnit) : "Not set"}
                  </span>
                  <span className="text-[10px] text-text-tertiary block mt-0.5">
                    {hasVal ? `${item.value} mm canonical` : "Tap to calibrate"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Intimate & Bra Size Calculation for Female Morphology */}
        {braSizing && (
          <div className="mt-4 p-4 rounded-card bg-rose-50/50 border border-rose-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <span className="text-xs uppercase font-semibold tracking-wider text-rose-800 block">
                  Intimate & Bra Morphology Size
                </span>
                <span className="text-sm text-text-secondary mt-0.5 block">
                  Band {braSizing.bandSize}&quot; · Cup {braSizing.cupLetter} ({braSizing.explanation})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-sans font-light text-2xl text-rose-700 font-semibold px-3 py-1 bg-white rounded-badge border border-rose-200">
                {braSizing.fullBraSize}
              </span>
              {(braSizing.sisterSizes.tighterBand || braSizing.sisterSizes.looserBand) && (
                <div className="text-[11px] text-text-secondary">
                  <span className="font-medium">Sister sizes: </span>
                  {[braSizing.sisterSizes.tighterBand, braSizing.sisterSizes.looserBand].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reference Garment Benchmarks */}
      {profile.referenceGarments && profile.referenceGarments.length > 0 && (
        <div className="pt-4 pb-2 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-semibold tracking-wider text-text-secondary flex items-center gap-1.5">
              <Shirt className="w-3.5 h-3.5 text-accent" />
              Calibrated Benchmark Garments
            </span>
            <span className="text-xs text-text-secondary">
              Anchor fits used for ease tuning
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.referenceGarments.map((ref) => (
              <div
                key={ref.id}
                className="p-3 rounded-card bg-bg-surface border border-border flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-text-primary">
                      {ref.brandName}
                    </span>
                    <span className="px-2 py-0.5 rounded-badge bg-accent-subtle text-accent text-[11px] font-semibold">
                      Size {ref.sizeLabel}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary block mt-0.5">
                    {ref.garmentName}
                  </span>
                  {ref.notes && (
                    <p className="text-[11px] text-text-tertiary italic mt-1">
                      &quot;{ref.notes}&quot;
                    </p>
                  )}
                </div>
                <div className="flex items-center text-amber-600 text-xs font-semibold">
                  {"★".repeat(ref.fitRating)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action CTAs */}
      <div className="mt-6 pt-6 border-t border-border flex flex-wrap items-center gap-3">
        <Link
          href="/app/recommend"
          className="min-h-[44px] px-5 rounded-btn bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-colors inline-flex items-center justify-center gap-2 shadow-xs"
        >
          <Sparkles className="w-4 h-4" />
          Match Size Against Verified Brands
        </Link>

        <Link
          href="/app/tailor"
          className="min-h-[44px] px-4 rounded-btn border border-border-strong bg-bg-surface hover:bg-bg-elevated transition-colors inline-flex items-center justify-center gap-2 text-sm font-medium text-text-primary shadow-xs"
        >
          <Share2 className="w-4 h-4 text-text-secondary" />
          Export Tailor Card
        </Link>

        <Link
          href="/app/privacy-settings"
          className="min-h-[44px] px-4 rounded-btn border border-border-strong bg-bg-surface hover:bg-bg-elevated transition-colors inline-flex items-center justify-center gap-2 text-sm font-medium text-text-primary shadow-xs"
        >
          <ShieldCheck className="w-4 h-4 text-accent" />
          Privacy & Tokens
        </Link>
      </div>
    </div>
  );
}
