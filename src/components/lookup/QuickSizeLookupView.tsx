"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PILOT_BRANDS, PILOT_PRODUCTS, PilotProduct } from "@/core/data/pilotBrands";
import { useProfileStore } from "@/core/state/profileStore";
import { evaluateSizeRecommendation } from "@/core/sizing/recommendationEngine";
import { formatDualMeasurement } from "@/core/formatters";
import {
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Store,
  Shirt,
  Footprints,
  Scale,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";

interface CategoryOption {
  id: string;
  label: string;
  categoryKeys: string[];
  icon: React.ReactNode;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: "tops",
    label: "T-Shirts & Polos",
    categoryKeys: ["t_shirt", "t_shirt_oversized", "polo"],
    icon: <Shirt className="w-4 h-4" />,
  },
  {
    id: "shirts",
    label: "Shirts (Casual & Formal)",
    categoryKeys: ["shirt_casual", "shirt_formal", "kurta"],
    icon: <Shirt className="w-4 h-4" />,
  },
  {
    id: "bottoms",
    label: "Jeans & Trousers",
    categoryKeys: ["jeans", "trousers_chinos", "joggers", "shorts"],
    icon: <Scale className="w-4 h-4" />,
  },
  {
    id: "outerwear",
    label: "Jackets & Hoodies",
    categoryKeys: ["jacket", "blazer", "hoodie"],
    icon: <Shirt className="w-4 h-4" />,
  },
  {
    id: "shoes",
    label: "Footwear & Sneakers",
    categoryKeys: ["shoes", "footwear"],
    icon: <Footprints className="w-4 h-4" />,
  },
];

export function QuickSizeLookupView() {
  const { getActiveProfile } = useProfileStore();
  const profile = getActiveProfile();

  const [selectedBrandId, setSelectedBrandId] = useState<string>("brand_uniqlo");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("tops");
  const [fitPreference, setFitPreference] = useState<"slim" | "regular" | "relaxed">("regular");

  const selectedBrand = useMemo(
    () => PILOT_BRANDS.find((b) => b.id === selectedBrandId) || PILOT_BRANDS[0],
    [selectedBrandId]
  );

  const selectedCat = useMemo(
    () => CATEGORY_OPTIONS.find((c) => c.id === selectedCategoryId) || CATEGORY_OPTIONS[0],
    [selectedCategoryId]
  );

  // Find the most representative product for this brand & category
  const matchingProduct = useMemo(() => {
    const prods = PILOT_PRODUCTS.filter(
      (p) =>
        p.brandId === selectedBrandId &&
        selectedCat.categoryKeys.includes(p.category)
    );
    if (prods.length > 0) return prods[0];

    // Fallback: any product in this brand
    const brandProds = PILOT_PRODUCTS.filter((p) => p.brandId === selectedBrandId);
    if (brandProds.length > 0) return brandProds[0];

    // Global fallback
    return PILOT_PRODUCTS[0];
  }, [selectedBrandId, selectedCat]);

  // Calculate size recommendation
  const recommendation = useMemo(() => {
    if (!matchingProduct) return null;

    return evaluateSizeRecommendation({
      profile: profile.measurements,
      fitPreference: {
        profileId: profile.id,
        category: matchingProduct.category,
        fitType: fitPreference,
      },
      garmentDimensions: matchingProduct.layer3Specs,
      brandSizeCharts: matchingProduct.layer2Charts,
      fabricSpec: matchingProduct.fabric,
    });
  }, [matchingProduct, profile, fitPreference]);

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge bg-accent-subtle/80 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
          <Zap className="w-3.5 h-3.5" />
          Instant Size Calculator
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
          What Size Am I?
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Select any brand and clothing category. Get your deterministic recommended size in seconds.
        </p>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Selectors */}
        <div className="md:col-span-5 space-y-5">
          {/* Brand Picker */}
          <div className="rounded-card border border-border bg-bg-surface p-5 shadow-xs space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center justify-between">
              <span>1. Choose Brand</span>
              <span className="text-[10px] text-accent font-medium">
                {PILOT_BRANDS.length} Brands
              </span>
            </label>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-btn border border-border bg-bg-base text-text-primary text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {PILOT_BRANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.country})
                </option>
              ))}
            </select>

            {/* Brand Quick Strip */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["brand_uniqlo", "brand_zara", "brand_hm", "brand_levis", "brand_nike", "brand_snitch"].map(
                (bid) => {
                  const b = PILOT_BRANDS.find((brand) => brand.id === bid);
                  if (!b) return null;
                  return (
                    <button
                      key={bid}
                      type="button"
                      onClick={() => setSelectedBrandId(bid)}
                      className={`text-xs px-2.5 py-1 rounded-btn font-medium transition-all ${
                        selectedBrandId === bid
                          ? "bg-accent text-white shadow-xs font-semibold"
                          : "bg-bg-elevated text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {b.name}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Category Picker */}
          <div className="rounded-card border border-border bg-bg-surface p-5 shadow-xs space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              2. Clothing Category
            </label>
            <div className="space-y-1.5">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`w-full p-3 rounded-btn border text-left flex items-center justify-between transition-all ${
                    selectedCategoryId === cat.id
                      ? "border-accent bg-accent-subtle/40 text-accent font-semibold shadow-xs"
                      : "border-border bg-bg-base text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {cat.icon}
                    <span className="text-xs font-medium text-text-primary">
                      {cat.label}
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      selectedCategoryId === cat.id ? "rotate-90 text-accent" : "text-text-tertiary"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Fit Preference */}
          <div className="rounded-card border border-border bg-bg-surface p-4 shadow-xs space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              3. Desired Silhouette
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["slim", "regular", "relaxed"] as const).map((fit) => (
                <button
                  key={fit}
                  type="button"
                  onClick={() => setFitPreference(fit)}
                  className={`py-2 rounded-btn text-xs font-semibold capitalize transition-all border ${
                    fitPreference === fit
                      ? "bg-accent text-white border-accent shadow-xs"
                      : "bg-bg-base border-border text-text-secondary hover:bg-bg-elevated"
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Instant Answer Card */}
        <div className="md:col-span-7">
          <div className="rounded-card border-2 border-border bg-bg-surface p-6 sm:p-8 shadow-sm space-y-6">
            {/* Answer Header */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-border">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider block">
                  {selectedBrand.name} · {selectedCat.label}
                </span>
                <h2 className="font-display text-2xl text-text-primary mt-1">
                  Your Deterministic Recommended Size
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Calibrated for {profile.name}&apos;s verified anatomical profile.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-semibold text-text-tertiary block">
                  Fit Score
                </span>
                <span className="font-display text-2xl font-bold text-accent">
                  {recommendation ? `${Math.round(recommendation.fitScore)}%` : "—"}
                </span>
              </div>
            </div>

            {/* Jumbo Size Display */}
            <div className="py-6 px-6 rounded-card bg-bg-elevated/40 border border-border text-center space-y-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-text-secondary block">
                Recommended Tag
              </span>
              <div className="font-display text-6xl sm:text-7xl font-bold text-text-primary my-1">
                {recommendation?.recommendedSize || "M"}
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-badge bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {recommendation?.confidenceLabel === "high"
                    ? "High Confidence Match (95%+)"
                    : "Calibrated Match"}
                </span>
                {recommendation?.isBorderline && (
                  <span className="text-xs px-2 py-0.5 rounded-badge bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Borderline
                  </span>
                )}
              </div>
            </div>

            {/* Why This Size? Explanation Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-accent" />
                Why this size fits you best
              </h3>

              <div className="p-4 rounded-btn bg-bg-base border border-border text-xs text-text-secondary leading-relaxed space-y-2">
                <p>
                  {recommendation?.summaryText ||
                    `Based on your physical measurements, ${selectedBrand.name}'s size ${recommendation?.recommendedSize || "M"} provides optimal chest and torso ease matching your ${fitPreference} silhouette preference.`}
                </p>

                {recommendation?.borderlineTradeoff && (
                  <p className="text-amber-600 dark:text-amber-400 font-medium pt-1 border-t border-border/50">
                    Trade-off: {recommendation.borderlineTradeoff}
                  </p>
                )}
              </div>
            </div>

            {/* Benchmark Dimensions Reference */}
            {matchingProduct && (
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-accent" />
                  <span>Pattern Block: {matchingProduct.name}</span>
                </div>
                <Link
                  href={`/app/explore?brand=${selectedBrandId}`}
                  className="text-xs font-semibold text-accent hover:text-accent-hover inline-flex items-center gap-1"
                >
                  <span>Explore Brand Catalog</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
