"use client";

import React, { useState, useMemo } from "react";
import { useProfileStore } from "@/core/state/profileStore";
import { PILOT_BRANDS, PILOT_PRODUCTS, PilotProduct } from "@/core/data/pilotBrands";
import { evaluateSizeRecommendation } from "@/core/sizing/recommendationEngine";
import { formatMeasurement, getConfidenceMeta } from "@/core/formatters";
import { ExplanationTree, FitType } from "@/core/types";
import {
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Shield,
  ThumbsUp,
  RotateCcw,
} from "lucide-react";
import { FitZoneVisualizer } from "./FitZoneVisualizer";

export function RecommendationView() {
  const { getActiveProfile, displayUnit, addReferenceGarment } = useProfileStore();
  const profile = getActiveProfile();

  // Selected product state
  const [selectedProductId, setSelectedProductId] = useState<string>(
    PILOT_PRODUCTS[0].id
  );
  const selectedProduct = useMemo(
    () => PILOT_PRODUCTS.find((p) => p.id === selectedProductId) || PILOT_PRODUCTS[0],
    [selectedProductId]
  );

  // Fit intent override (allows user to test different silhouettes on the fly)
  const [fitOverride, setFitOverride] = useState<FitType>(
    profile.preferences[selectedProduct.category] || "regular"
  );

  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackFeel, setFeedbackFeel] = useState<"perfect" | "tight" | "loose">("perfect");

  // Run deterministic sizing engine
  const recommendation: ExplanationTree = useMemo(() => {
    return evaluateSizeRecommendation({
      profile: profile.measurements,
      fitPreference: {
        profileId: profile.id,
        category: selectedProduct.category,
        fitType: fitOverride,
      },
      garmentDimensions: selectedProduct.layer3Specs,
      brandSizeCharts: selectedProduct.layer2Charts,
      fabricSpec: selectedProduct.fabric,
      referenceGarments: profile.referenceGarments.map((g) => ({
        category: g.category,
        sizeLabel: g.sizeLabel,
        fitQuality:
          g.fitFeel === "perfect"
            ? "perfect"
            : g.fitFeel === "tight"
            ? "slightly_tight"
            : "slightly_loose",
      })),
    });
  }, [profile, selectedProduct, fitOverride]);

  const confidenceMeta = getConfidenceMeta(recommendation.confidence);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recommendation.recommendedSize) return;

    addReferenceGarment(profile.id, {
      brandName: selectedProduct.brandName,
      garmentName: selectedProduct.name,
      sizeLabel: recommendation.recommendedSize,
      fitRating: feedbackRating,
      fitFeel: feedbackFeel,
      category: selectedProduct.category,
      notes: `User feedback logged for recommendation (${recommendation.recommendedSize}).`,
    });

    setFeedbackSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10">
      {/* Title & Brand Product Selector */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-badge bg-accent-subtle/80 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Deterministic Sizing Engine · Pure Millimeter Ease
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
          Apparel Size Recommendation
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-xl">
          Calibrating {profile.name}&apos;s anatomical girth against verified garment engineering specifications.
        </p>

        {/* Product Picker */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Select Pilot Apparel Item
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setFeedbackSubmitted(false);
              }}
              className="input-editorial w-full"
            >
              {PILOT_PRODUCTS.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.brandName} — {prod.name} (₹{prod.priceInr})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Active Fit Silhouette Intent (Layer 4)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["slim", "regular", "relaxed", "oversized"] as const).map((fit) => (
                <button
                  key={fit}
                  type="button"
                  onClick={() => setFitOverride(fit)}
                  className={`min-h-[44px] px-2 rounded-btn text-xs font-medium capitalize transition-all ${
                    fitOverride === fit
                      ? "bg-accent text-white font-semibold shadow-xs"
                      : "bg-bg-surface border border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Recommendation Hero Card */}
      <div className="rounded-card border border-border bg-bg-surface p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
          {/* Recommended Size Display (DM Sans 300) */}
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-card bg-bg-elevated border border-border flex flex-col items-center justify-center p-2 text-center shrink-0">
              <span className="text-[11px] uppercase tracking-wider text-text-secondary font-medium">
                Best Fit
              </span>
              <span className="font-sans font-light text-4xl sm:text-5xl text-accent leading-none mt-1">
                {recommendation.recommendedSize || "—"}
              </span>
              <span className="text-[10px] text-text-tertiary mt-1">
                {selectedProduct.brandName}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${confidenceMeta.dotColorClass}`} />
                <span className="font-semibold text-sm text-text-primary">
                  {confidenceMeta.label} ({confidenceMeta.pct}%)
                </span>
                <span className="text-xs text-text-secondary">·</span>
                <span className="text-xs text-accent font-medium bg-accent-subtle/50 px-2 py-0.5 rounded-badge uppercase tracking-wider">
                  {recommendation.dataSources.layerUsed === "Layer3_Garment" ? "Layer 3 Flat Specs" : "Layer 2 Body Range"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
                {selectedProduct.name}
              </h2>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Fabric: {selectedProduct.fabric.materialComposition} · Stretch: {selectedProduct.fabric.stretchLevel}
              </p>
            </div>
          </div>

          {/* Alternative Size Pill (if close) */}
          {recommendation.alternativeSize && (
            <div className="p-3 rounded-card bg-bg-elevated/50 border border-border text-left md:text-right shrink-0">
              <span className="text-[11px] text-text-secondary block font-medium">
                Alternative Size
              </span>
              <span className="font-semibold text-sm text-text-primary mt-0.5 block">
                Size {recommendation.alternativeSize}
              </span>
              <span className="text-[11px] text-text-tertiary block">
                {fitOverride === "slim" ? "For tighter silhouette" : "For relaxed room"}
              </span>
            </div>
          )}
        </div>

        {/* Borderline Drape Warning Banner */}
        {recommendation.isBorderline && (
          <div className="mt-4 p-4 rounded-card bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold block uppercase tracking-wide">
                Borderline Fit Detected
              </span>
              <p className="text-xs mt-0.5 leading-relaxed">
                {recommendation.borderlineTradeoff ||
                  "Your measurements fall between two sizes. Size " +
                    recommendation.recommendedSize +
                    " offers intended ease, while Size " +
                    recommendation.alternativeSize +
                    " gives a tighter tailored silhouette."}
              </p>
            </div>
          </div>
        )}

        {/* Conversational Explanation Summary */}
        <div className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-sm text-text-primary">
              Why this size was recommended
            </h3>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed bg-bg-elevated/40 p-4 rounded-card border border-border">
            {recommendation.summaryText}
          </p>
        </div>

        {/* Fit Zone Radar & Tension Visualizer */}
        <div className="pt-6">
          <FitZoneVisualizer
            dimensionBreakdown={recommendation.dimensionBreakdown}
            displayUnit={displayUnit}
          />
        </div>

        {/* Expandable Dimension Breakdown Accordion */}
        <div className="mt-6 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="w-full min-h-[44px] flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
            aria-expanded={isAccordionOpen}
          >
            <span>Dimension-by-Dimension Technical Breakdown</span>
            {isAccordionOpen ? (
              <ChevronUp className="w-4 h-4 text-text-secondary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-secondary" />
            )}
          </button>

          {isAccordionOpen && (
            <div className="mt-3 overflow-x-auto space-y-4">
              <table className="w-full text-left text-xs border border-border rounded-card overflow-hidden">
                <thead className="bg-bg-elevated/70 text-text-secondary uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Anatomical Zone</th>
                    <th className="py-2.5 px-3 font-semibold">Your Body ({displayUnit})</th>
                    <th className="py-2.5 px-3 font-semibold">Garment Spec ({displayUnit})</th>
                    <th className="py-2.5 px-3 font-semibold">Net Ease Delta</th>
                    <th className="py-2.5 px-3 font-semibold">Evaluation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-bg-surface">
                  {recommendation.dimensionBreakdown.map((dim, idx) => (
                    <React.Fragment key={idx}>
                      <tr className="hover:bg-bg-elevated/30 transition-colors">
                        <td className="py-3 px-3 font-medium text-text-primary capitalize">
                          {dim.dimension}
                        </td>
                        <td className="py-3 px-3 text-text-secondary">
                          {formatMeasurement(dim.bodyMeasurementMm, displayUnit)}
                          <span className="text-[10px] text-text-tertiary block">
                            {dim.bodyMeasurementMm} mm
                          </span>
                        </td>
                        <td className="py-3 px-3 text-text-secondary">
                          {formatMeasurement(dim.garmentSpecMm, displayUnit)}
                          <span className="text-[10px] text-text-tertiary block">
                            {dim.garmentSpecMm} mm
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-text-primary">
                          {dim.easeDeltaMm > 0 ? `+${dim.easeDeltaMm} mm` : `${dim.easeDeltaMm} mm`}
                          <span className="text-[10px] text-text-tertiary block font-normal">
                            Target: {dim.easeTargetMm.min}–{dim.easeTargetMm.max}mm
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-badge text-[10px] font-semibold uppercase tracking-wider ${
                              dim.status === "ideal"
                                ? "bg-emerald-100 text-emerald-800"
                                : dim.status === "tight"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {dim.status}
                          </span>
                        </td>
                      </tr>
                      {dim.rationale && (
                        <tr className="bg-bg-elevated/20">
                          <td colSpan={5} className="py-2 px-3 text-[11px] text-text-secondary italic">
                            &quot;{dim.rationale}&quot;
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {/* Fabric Stretch & Tension Notes */}
              <div className="p-4 rounded-card bg-bg-elevated/30 border border-border text-xs text-text-secondary space-y-1">
                <span className="font-semibold text-text-primary block">
                  Fabric Elasticity & Shrinkage Profile:
                </span>
                <p>
                  Composed of {selectedProduct.fabric.materialComposition} with {selectedProduct.fabric.elastanePercentage}% elastane ({selectedProduct.fabric.stretchLevel} stretch).
                  Estimated post-wash shrinkage rate is {selectedProduct.fabric.estimatedShrinkagePct}%.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Provenance Footer */}
        <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-text-tertiary">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span>
              Provenance: {recommendation.dataSources.provenance} (Immutable Audit Hash: {selectedProduct.provenance.verificationHash.slice(0, 16)}...)
            </span>
          </div>
          <span>Strictly Zero Hallucinated Sizing · AGENTS.md Invariant 1</span>
        </div>
      </div>

      {/* Outcome Feedback Prompt: "Did this fit?" */}
      <div className="rounded-card border border-border bg-bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-base text-text-primary flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-accent" />
              Outcome Calibration Feedback
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Did you try this piece on? Log your feedback to calibrate future recommendations.
            </p>
          </div>
          {feedbackSubmitted && (
            <span className="px-2.5 py-1 rounded-badge bg-emerald-100 text-emerald-800 text-xs font-semibold inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Calibrated into Profile
            </span>
          )}
        </div>

        {!feedbackSubmitted ? (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Fit Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`min-h-[44px] min-w-[44px] rounded-btn border text-base font-bold transition-colors ${
                        feedbackRating >= star
                          ? "bg-amber-100 border-amber-300 text-amber-700"
                          : "bg-bg-elevated border-border text-text-tertiary"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  How was the comfort and drape?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "perfect", label: "Perfect" },
                      { id: "tight", label: "Too Snug" },
                      { id: "loose", label: "Too Loose" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFeedbackFeel(opt.id)}
                      className={`min-h-[44px] px-2 rounded-btn border text-xs font-medium transition-colors ${
                        feedbackFeel === opt.id
                          ? "bg-accent text-white font-semibold"
                          : "bg-bg-surface border-border text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary min-h-[44px] text-xs font-semibold shadow-xs"
            >
              Submit Fit Verification
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between bg-bg-elevated/40 p-3.5 rounded-card border border-border">
            <span className="text-xs text-text-secondary">
              Logged {feedbackRating}★ ({feedbackFeel}) for {selectedProduct.brandName} Size {recommendation.recommendedSize}.
            </span>
            <button
              type="button"
              onClick={() => setFeedbackSubmitted(false)}
              className="text-xs font-semibold text-accent hover:text-accent-hover inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Edit Feedback
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
