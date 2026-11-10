"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PILOT_BRANDS, PILOT_PRODUCTS, PilotProduct } from "@/core/data/pilotBrands";
import { useProfileStore } from "@/core/state/profileStore";
import { formatMeasurement } from "@/core/formatters";
import {
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale,
  Layers,
  Shirt,
  Footprints,
} from "lucide-react";
import { ShoeSizeCrossComparator } from "./ShoeSizeCrossComparator";

const BOTTOM_CATEGORIES = new Set(["jeans", "trousers_chinos", "joggers", "shorts"]);

function isBottomGarment(category: string): boolean {
  return BOTTOM_CATEGORIES.has(category);
}

const TIER_MAPPINGS: Record<string, number> = {
  // index 0: XS
  xs: 0,
  w28: 0,
  "w28 l32": 0,
  "28": 0,
  "38": 0,
  // index 1: S
  s: 1,
  w30: 1,
  "w30 l32": 1,
  "30": 1,
  "39": 1,
  // index 2: M
  m: 2,
  w32: 2,
  "w32 l32": 2,
  "32": 2,
  "40": 2,
  // index 3: L
  l: 3,
  w34: 3,
  "w34 l32": 3,
  "34": 3,
  "42": 3,
  // index 4: XL
  xl: 4,
  w36: 4,
  "w36 l32": 4,
  "36": 4,
  "44": 4,
  // index 5: XXL
  xxl: 5,
  "2xl": 5,
  w38: 5,
  "w38 l32": 5,
  "46": 5,
  // index 6: 3XL
  "3xl": 6,
  xxxl: 6,
  w40: 6,
  "w40 l32": 6,
  "48": 6,
};

function getProductSizes(product: PilotProduct): string[] {
  if (product.layer3Specs && product.layer3Specs.length > 0) {
    return product.layer3Specs.map((s) => s.sizeLabel);
  }
  if (product.layer2Charts && product.layer2Charts.length > 0) {
    return product.layer2Charts.map((c) => c.sizeLabel);
  }
  return ["S", "M", "L", "XL"];
}

function findEquivalentSize(currentSize: string, fromSizes: string[], toSizes: string[]): string {
  if (toSizes.length === 0) return currentSize;
  if (toSizes.includes(currentSize)) return currentSize;

  const normCurrent = currentSize.toLowerCase().trim();
  const directMatch = toSizes.find((s) => s.toLowerCase().trim() === normCurrent);
  if (directMatch) return directMatch;

  const currentTier = TIER_MAPPINGS[normCurrent];
  if (currentTier !== undefined) {
    const tierMatch = toSizes.find((s) => TIER_MAPPINGS[s.toLowerCase().trim()] === currentTier);
    if (tierMatch) return tierMatch;
    if (toSizes[currentTier]) return toSizes[currentTier];
  }

  const currentIndex = fromSizes.indexOf(currentSize);
  if (currentIndex >= 0 && fromSizes.length > 1) {
    const ratio = currentIndex / (fromSizes.length - 1);
    const targetIdx = Math.min(toSizes.length - 1, Math.max(0, Math.round(ratio * (toSizes.length - 1))));
    return toSizes[targetIdx];
  }

  const fallbackM = toSizes.find((s) => s.toUpperCase() === "M" || s === "40" || s.startsWith("W32"));
  return fallbackM || toSizes[Math.min(2, toSizes.length - 1)] || toSizes[0];
}

export function BrandComparisonView() {
  const searchParams = useSearchParams();
  const { displayUnit } = useProfileStore();

  const queryTab =
    searchParams?.get("tab") === "footwear" || searchParams?.get("tab") === "shoes"
      ? "footwear"
      : "garments";
  const [activeComparatorTab, setActiveComparatorTab] = useState<"garments" | "footwear">(queryTab);

  // Products available for comparison
  const [productAId, setProductAId] = useState<string>("prod_uniqlo_airism_oversized");
  const [sizeA, setSizeA] = useState<string>("M");

  const [productBId, setProductBId] = useState<string>("prod_zara_textured_tee");
  const [sizeB, setSizeB] = useState<string>("M");

  // Ingest URL query params if supplied
  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "footwear" || tabParam === "shoes") {
      setActiveComparatorTab("footwear");
    } else if (tabParam === "garments") {
      setActiveComparatorTab("garments");
    }

    const paramA = searchParams?.get("prodA") || searchParams?.get("productA") || searchParams?.get("a");
    const paramB = searchParams?.get("prodB") || searchParams?.get("productB") || searchParams?.get("b");

    if (paramA && PILOT_PRODUCTS.some((p) => p.id === paramA)) {
      setProductAId(paramA);
    }
    if (paramB && PILOT_PRODUCTS.some((p) => p.id === paramB)) {
      setProductBId(paramB);
    }
  }, [searchParams]);

  const prodA: PilotProduct = useMemo(
    () => PILOT_PRODUCTS.find((p) => p.id === productAId) || PILOT_PRODUCTS[0],
    [productAId]
  );

  const prodB: PilotProduct = useMemo(
    () => PILOT_PRODUCTS.find((p) => p.id === productBId) || PILOT_PRODUCTS[1] || PILOT_PRODUCTS[0],
    [productBId]
  );

  // Available size labels
  const availableSizesA = useMemo(() => getProductSizes(prodA), [prodA]);
  const availableSizesB = useMemo(() => getProductSizes(prodB), [prodB]);

  // Auto-synchronize size selections if changing to products with distinct sizing systems
  useEffect(() => {
    if (!availableSizesA.includes(sizeA) && availableSizesA.length > 0) {
      setSizeA(findEquivalentSize(sizeA, [], availableSizesA));
    }
  }, [availableSizesA, sizeA]);

  useEffect(() => {
    if (!availableSizesB.includes(sizeB) && availableSizesB.length > 0) {
      setSizeB(findEquivalentSize(sizeB, [], availableSizesB));
    }
  }, [availableSizesB, sizeB]);

  // Derive specs for A
  const specA = useMemo(() => {
    const isBtm = isBottomGarment(prodA.category);
    if (prodA.layer3Specs && prodA.layer3Specs.length > 0) {
      const match = prodA.layer3Specs.find((s) => s.sizeLabel === sizeA) || prodA.layer3Specs[0];
      if (match) {
        return {
          chestFlatMm: match.chestFlatMm || 0,
          chestCircMm: (match.chestFlatMm || 0) * 2,
          shoulderMm: match.shoulderMm || 0,
          lengthMm: match.lengthMm || 0,
          waistFlatMm: match.waistFlatMm || 0,
          waistCircMm: (match.waistFlatMm || 0) * 2,
          inseamMm: match.inseamMm || 0,
          isLayer3: true,
          isBottom: isBtm,
        };
      }
    }
    if (prodA.layer2Charts && prodA.layer2Charts.length > 0) {
      const match = prodA.layer2Charts.find((c) => c.sizeLabel === sizeA) || prodA.layer2Charts[0];
      if (match) {
        const chestMid = match.chestMinMm && match.chestMaxMm ? (match.chestMinMm + match.chestMaxMm) / 2 : 0;
        const waistMid = match.waistMinMm && match.waistMaxMm ? (match.waistMinMm + match.waistMaxMm) / 2 : 0;
        return {
          chestFlatMm: Math.round(chestMid / 2),
          chestCircMm: Math.round(chestMid),
          shoulderMm: isBtm ? 0 : 450,
          lengthMm: isBtm ? 1040 : 710,
          waistFlatMm: Math.round(waistMid / 2),
          waistCircMm: Math.round(waistMid),
          inseamMm: isBtm ? 810 : 0,
          isLayer3: false,
          isBottom: isBtm,
        };
      }
    }
    return {
      chestFlatMm: isBtm ? 0 : 530,
      chestCircMm: isBtm ? 0 : 1060,
      shoulderMm: isBtm ? 0 : 460,
      lengthMm: 720,
      waistFlatMm: isBtm ? 420 : 0,
      waistCircMm: isBtm ? 840 : 0,
      inseamMm: isBtm ? 810 : 0,
      isLayer3: true,
      isBottom: isBtm,
    };
  }, [prodA, sizeA]);

  // Derive specs for B
  const specB = useMemo(() => {
    const isBtm = isBottomGarment(prodB.category);
    if (prodB.layer3Specs && prodB.layer3Specs.length > 0) {
      const match = prodB.layer3Specs.find((s) => s.sizeLabel === sizeB) || prodB.layer3Specs[0];
      if (match) {
        return {
          chestFlatMm: match.chestFlatMm || 0,
          chestCircMm: (match.chestFlatMm || 0) * 2,
          shoulderMm: match.shoulderMm || 0,
          lengthMm: match.lengthMm || 0,
          waistFlatMm: match.waistFlatMm || 0,
          waistCircMm: (match.waistFlatMm || 0) * 2,
          inseamMm: match.inseamMm || 0,
          isLayer3: true,
          isBottom: isBtm,
        };
      }
    }
    if (prodB.layer2Charts && prodB.layer2Charts.length > 0) {
      const match = prodB.layer2Charts.find((c) => c.sizeLabel === sizeB) || prodB.layer2Charts[0];
      if (match) {
        const chestMid = match.chestMinMm && match.chestMaxMm ? (match.chestMinMm + match.chestMaxMm) / 2 : 0;
        const waistMid = match.waistMinMm && match.waistMaxMm ? (match.waistMinMm + match.waistMaxMm) / 2 : 0;
        return {
          chestFlatMm: Math.round(chestMid / 2),
          chestCircMm: Math.round(chestMid),
          shoulderMm: isBtm ? 0 : 440,
          lengthMm: isBtm ? 1040 : 700,
          waistFlatMm: Math.round(waistMid / 2),
          waistCircMm: Math.round(waistMid),
          inseamMm: isBtm ? 810 : 0,
          isLayer3: false,
          isBottom: isBtm,
        };
      }
    }
    return {
      chestFlatMm: isBtm ? 0 : 500,
      chestCircMm: isBtm ? 0 : 1000,
      shoulderMm: isBtm ? 0 : 440,
      lengthMm: 700,
      waistFlatMm: isBtm ? 420 : 0,
      waistCircMm: isBtm ? 840 : 0,
      inseamMm: isBtm ? 810 : 0,
      isLayer3: false,
      isBottom: isBtm,
    };
  }, [prodB, sizeB]);

  const bothAreBottoms = specA.isBottom && specB.isBottom;
  const bothAreTops = !specA.isBottom && !specB.isBottom;
  const mixedDomains = !bothAreBottoms && !bothAreTops;

  // Chest delta (tops)
  const chestCircDeltaMm = specB.chestCircMm - specA.chestCircMm;
  const chestCircDeltaCm = Math.round(chestCircDeltaMm / 10);
  const shoulderDeltaMm = specB.shoulderMm - specA.shoulderMm;

  // Waist delta (bottoms)
  const waistCircDeltaMm = specB.waistCircMm - specA.waistCircMm;
  const waistCircDeltaCm = Math.round(waistCircDeltaMm / 10);
  const inseamDeltaMm = specB.inseamMm - specA.inseamMm;
  const inseamDeltaCm = Math.round(inseamDeltaMm / 10);

  // Generate plain-English verdict
  let fitVerdict = "";
  let verdictColor = "";

  if (bothAreBottoms) {
    if (Math.abs(waistCircDeltaMm) <= 20) {
      fitVerdict = `${prodB.brandName} (${sizeB}) has nearly identical waist circumference to ${prodA.brandName} (${sizeA}). Both will fit with very similar ease across your waistband.`;
      verdictColor = "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
    } else if (waistCircDeltaMm < -20) {
      fitVerdict = `${prodB.brandName} (${sizeB}) is ${Math.abs(waistCircDeltaCm)} cm tighter at the waist than ${prodA.brandName} (${sizeA}). If you like the fit of ${prodA.brandName} ${sizeA}, you may want to size up in ${prodB.brandName}.`;
      verdictColor = "text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";
    } else {
      fitVerdict = `${prodB.brandName} (${sizeB}) is ${waistCircDeltaCm} cm roomier at the waist than ${prodA.brandName} (${sizeA}). It will provide a looser or more relaxed waistband.`;
      verdictColor = "text-accent bg-accent-subtle/50 border-accent/20";
    }
  } else if (mixedDomains) {
    fitVerdict = `Comparing a top garment (${prodA.name}) with a bottom garment (${prodB.name}). Sizing comparisons are most meaningful when comparing garments within the same anatomical domain.`;
    verdictColor = "text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";
  } else {
    // Both are tops
    if (Math.abs(chestCircDeltaMm) <= 20) {
      fitVerdict = `${prodB.brandName} (${sizeB}) has nearly identical chest volume to ${prodA.brandName} (${sizeA}). Both will feel very similar across your torso.`;
      verdictColor = "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
    } else if (chestCircDeltaMm < -20) {
      fitVerdict = `${prodB.brandName} (${sizeB}) is ${Math.abs(chestCircDeltaCm)} cm slimmer around the body than ${prodA.brandName} (${sizeA}). If you like the fit of ${prodA.brandName} ${sizeA}, you may want to size up in ${prodB.brandName}.`;
      verdictColor = "text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";
    } else {
      fitVerdict = `${prodB.brandName} (${sizeB}) is ${chestCircDeltaCm} cm roomier around the body than ${prodA.brandName} (${sizeA}). It will provide a more relaxed or oversized drape.`;
      verdictColor = "text-accent bg-accent-subtle/50 border-accent/20";
    }
  }

  const handleProductAChange = (newId: string) => {
    const nextProd = PILOT_PRODUCTS.find((p) => p.id === newId);
    if (nextProd) {
      const nextSizes = getProductSizes(nextProd);
      const nextSize = findEquivalentSize(sizeA, availableSizesA, nextSizes);
      setProductAId(newId);
      setSizeA(nextSize);
    }
  };

  const handleProductBChange = (newId: string) => {
    const nextProd = PILOT_PRODUCTS.find((p) => p.id === newId);
    if (nextProd) {
      const nextSizes = getProductSizes(nextProd);
      const nextSize = findEquivalentSize(sizeB, availableSizesB, nextSizes);
      setProductBId(newId);
      setSizeB(nextSize);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-badge bg-accent-subtle/80 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
          <Scale className="w-3.5 h-3.5" />
          Cross-Brand Sizing Benchmarks
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
          Compare Brand Sizing
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-2xl">
          Ever wonder why a size in one brand fits completely differently in another? Compare verified cutting-table specifications and footwear last dimensions side by side.
        </p>
      </div>

      {/* Category Tabs: Apparel Garments vs Footwear & Shoes Matrix */}
      <div className="flex border-b border-border gap-2">
        <button
          type="button"
          onClick={() => setActiveComparatorTab("garments")}
          className={`min-h-[44px] px-5 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeComparatorTab === "garments"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Shirt className="w-4 h-4" />
          <span>Apparel & Garment Dimensions</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveComparatorTab("footwear")}
          className={`min-h-[44px] px-5 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeComparatorTab === "footwear"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Footprints className="w-4 h-4" />
          <span>Footwear & Shoe Size Matrix (UK / US / EU / CM / IN)</span>
          <span className="text-[10px] bg-accent/20 text-accent font-bold px-2 py-0.5 rounded-full uppercase">
            Cross-Brand
          </span>
        </button>
      </div>

      {activeComparatorTab === "footwear" ? (
        <ShoeSizeCrossComparator />
      ) : (
        <>
          {/* Selectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand A Selection */}
        <div className="p-5 sm:p-6 rounded-card border border-border bg-bg-surface shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px]">A</span>
              Reference Item
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-badge bg-bg-elevated text-text-secondary">
              {prodA.brandName}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Select Garment
            </label>
            <select
              value={productAId}
              onChange={(e) => handleProductAChange(e.target.value)}
              className="input-editorial w-full"
            >
              {PILOT_PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brandName} — {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Select Size
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableSizesA.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSizeA(s)}
                  className={`min-h-[40px] px-3.5 rounded-btn text-xs font-semibold transition-all ${
                    sizeA === s
                      ? "bg-accent text-white shadow-xs"
                      : "bg-bg-elevated/60 border border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Specs for A */}
          <div className="p-3.5 rounded-card bg-bg-elevated/40 border border-border text-xs space-y-1.5">
            {specA.isBottom ? (
              <>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Flat Waist (Half Waist):</span>
                  <span className="font-mono font-semibold text-text-primary">
                    {formatMeasurement(specA.waistFlatMm, displayUnit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Waist Girth:</span>
                  <span className="font-mono font-semibold text-accent">
                    {formatMeasurement(specA.waistCircMm, displayUnit)}
                  </span>
                </div>
                {specA.inseamMm > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Inseam:</span>
                    <span className="font-mono text-text-primary">
                      {formatMeasurement(specA.inseamMm, displayUnit)}
                    </span>
                  </div>
                )}
                {specA.lengthMm > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Total Length (Outseam):</span>
                    <span className="font-mono text-text-primary">
                      {formatMeasurement(specA.lengthMm, displayUnit)}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Flat Chest (Pit-to-Pit):</span>
                  <span className="font-mono font-semibold text-text-primary">
                    {formatMeasurement(specA.chestFlatMm, displayUnit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Chest Girth:</span>
                  <span className="font-mono font-semibold text-accent">
                    {formatMeasurement(specA.chestCircMm, displayUnit)}
                  </span>
                </div>
                {specA.shoulderMm > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Shoulder Width:</span>
                    <span className="font-mono text-text-primary">
                      {formatMeasurement(specA.shoulderMm, displayUnit)}
                    </span>
                  </div>
                )}
                {specA.lengthMm > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Garment Length:</span>
                    <span className="font-mono text-text-primary">
                      {formatMeasurement(specA.lengthMm, displayUnit)}
                    </span>
                  </div>
                )}
                {specA.waistCircMm > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Waist Girth:</span>
                    <span className="font-mono text-text-primary">
                      {formatMeasurement(specA.waistCircMm, displayUnit)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Brand B Selection */}
        <div className="p-5 sm:p-6 rounded-card border border-border bg-bg-surface shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-terracotta text-white flex items-center justify-center text-[10px]">B</span>
              Comparison Target
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-badge bg-bg-elevated text-text-secondary">
              {prodB.brandName}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Select Garment
            </label>
            <select
              value={productBId}
              onChange={(e) => handleProductBChange(e.target.value)}
              className="input-editorial w-full"
            >
              {PILOT_PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brandName} — {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Select Size
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableSizesB.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSizeB(s)}
                  className={`min-h-[40px] px-3.5 rounded-btn text-xs font-semibold transition-all ${
                    sizeB === s
                      ? "bg-terracotta text-white shadow-xs"
                      : "bg-bg-elevated/60 border border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Specs for B */}
          <div className="p-3.5 rounded-card bg-bg-elevated/40 border border-border text-xs space-y-1.5">
            {specB.isBottom ? (
              <>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Flat Waist (Half Waist):</span>
                  <span className="font-mono font-semibold text-text-primary">
                    {formatMeasurement(specB.waistFlatMm, displayUnit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Waist Girth:</span>
                  <span className="font-mono font-semibold text-terracotta">
                    {formatMeasurement(specB.waistCircMm, displayUnit)}
                  </span>
                </div>
                {specB.inseamMm > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Inseam:</span>
                    <span className="font-mono text-text-primary">
                      {formatMeasurement(specB.inseamMm, displayUnit)}
                    </span>
                  </div>
                )}
                {specB.lengthMm > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Total Length (Outseam):</span>
                    <span className="font-mono text-text-primary">
                      {formatMeasurement(specB.lengthMm, displayUnit)}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Flat Chest (Pit-to-Pit):</span>
                  <span className="font-mono font-semibold text-text-primary">
                    {formatMeasurement(specB.chestFlatMm, displayUnit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Chest Girth:</span>
                  <span className="font-mono font-semibold text-terracotta">
                    {formatMeasurement(specB.chestCircMm, displayUnit)}
                  </span>
                </div>
                {specB.shoulderMm > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Shoulder Width:</span>
                    <span className="font-mono text-text-primary">
                      {formatMeasurement(specB.shoulderMm, displayUnit)}
                    </span>
                  </div>
                )}
                {specB.lengthMm > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Garment Length:</span>
                    <span className="font-mono text-text-primary">
                      {formatMeasurement(specB.lengthMm, displayUnit)}
                    </span>
                  </div>
                )}
                {specB.waistCircMm > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Waist Girth:</span>
                    <span className="font-mono text-text-primary">
                      {formatMeasurement(specB.waistCircMm, displayUnit)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sizing Comparison Verdict Banner */}
      <div className={`p-5 rounded-card border shadow-xs ${verdictColor}`}>
        <div className="flex items-start gap-3">
          <ArrowLeftRight className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">
              Sizing Verdict: {prodA.brandName} ({sizeA}) vs. {prodB.brandName} ({sizeB})
            </h3>
            <p className="text-xs mt-1 leading-relaxed">
              {fitVerdict}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Dimension Delta Bars */}
      <section className="p-6 rounded-card border border-border bg-bg-surface shadow-xs space-y-6">
        <h2 className="font-semibold text-base text-text-primary flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          Dimension Delta Breakdown
        </h2>

        {bothAreBottoms ? (
          <>
            {/* Waist Circumference Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-text-primary">
                  Waist Circumference Variance
                </span>
                <span className="font-mono text-xs font-bold text-accent">
                  {waistCircDeltaMm > 0
                    ? `+${waistCircDeltaMm} mm roomier`
                    : waistCircDeltaMm < 0
                    ? `${waistCircDeltaMm} mm tighter`
                    : "Exact match"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-28 text-text-secondary font-medium truncate text-right">
                    {prodA.brandName} {sizeA}
                  </span>
                  <div className="flex-1 h-3 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(25, (specA.waistCircMm / 1200) * 100))}%` }}
                    />
                  </div>
                  <span className="font-mono font-semibold w-16 text-right">
                    {formatMeasurement(specA.waistCircMm, displayUnit)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-28 text-text-secondary font-medium truncate text-right">
                    {prodB.brandName} {sizeB}
                  </span>
                  <div className="flex-1 h-3 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-terracotta rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(25, (specB.waistCircMm / 1200) * 100))}%` }}
                    />
                  </div>
                  <span className="font-mono font-semibold w-16 text-right">
                    {formatMeasurement(specB.waistCircMm, displayUnit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Inseam / Outseam Length Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-text-primary">
                  Inseam / Leg Length Variance
                </span>
                <span className="font-mono text-xs font-bold text-accent">
                  {inseamDeltaMm > 0
                    ? `+${inseamDeltaMm} mm longer`
                    : inseamDeltaMm < 0
                    ? `${inseamDeltaMm} mm shorter`
                    : "Identical inseam"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-28 text-text-secondary font-medium truncate text-right">
                    {prodA.brandName} {sizeA}
                  </span>
                  <div className="flex-1 h-3 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(25, ((specA.inseamMm || specA.lengthMm) / 1100) * 100))}%` }}
                    />
                  </div>
                  <span className="font-mono font-semibold w-16 text-right">
                    {formatMeasurement(specA.inseamMm || specA.lengthMm, displayUnit)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-28 text-text-secondary font-medium truncate text-right">
                    {prodB.brandName} {sizeB}
                  </span>
                  <div className="flex-1 h-3 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-terracotta rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(25, ((specB.inseamMm || specB.lengthMm) / 1100) * 100))}%` }}
                    />
                  </div>
                  <span className="font-mono font-semibold w-16 text-right">
                    {formatMeasurement(specB.inseamMm || specB.lengthMm, displayUnit)}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : mixedDomains ? (
          <div className="p-4 rounded-card border border-border bg-bg-elevated/40 text-xs text-text-secondary flex items-start gap-3">
            <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p>
              Direct dimensional bar comparison is optimized for garments within the same anatomical class (tops vs tops or bottoms vs bottoms). To compare waistband or chest dimensions directly, select matching garment types.
            </p>
          </div>
        ) : (
          <>
            {/* Chest Girth Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-text-primary">
                  Chest Circumference Variance
                </span>
                <span className="font-mono text-xs font-bold text-accent">
                  {chestCircDeltaMm > 0
                    ? `+${chestCircDeltaMm} mm roomier`
                    : chestCircDeltaMm < 0
                    ? `${chestCircDeltaMm} mm slimmer`
                    : "Exact match"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-28 text-text-secondary font-medium truncate text-right">
                    {prodA.brandName} {sizeA}
                  </span>
                  <div className="flex-1 h-3 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(25, (specA.chestCircMm / 1300) * 100))}%` }}
                    />
                  </div>
                  <span className="font-mono font-semibold w-16 text-right">
                    {formatMeasurement(specA.chestCircMm, displayUnit)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-28 text-text-secondary font-medium truncate text-right">
                    {prodB.brandName} {sizeB}
                  </span>
                  <div className="flex-1 h-3 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-terracotta rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(25, (specB.chestCircMm / 1300) * 100))}%` }}
                    />
                  </div>
                  <span className="font-mono font-semibold w-16 text-right">
                    {formatMeasurement(specB.chestCircMm, displayUnit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shoulder Seam Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-text-primary">
                  Shoulder Seam-to-Seam Variance
                </span>
                <span className="font-mono text-xs font-bold text-accent">
                  {shoulderDeltaMm > 0
                    ? `+${shoulderDeltaMm} mm broader`
                    : shoulderDeltaMm < 0
                    ? `${shoulderDeltaMm} mm narrower`
                    : "Identical seam"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-28 text-text-secondary font-medium truncate text-right">
                    {prodA.brandName} {sizeA}
                  </span>
                  <div className="flex-1 h-3 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(25, (specA.shoulderMm / 600) * 100))}%` }}
                    />
                  </div>
                  <span className="font-mono font-semibold w-16 text-right">
                    {formatMeasurement(specA.shoulderMm, displayUnit)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-28 text-text-secondary font-medium truncate text-right">
                    {prodB.brandName} {sizeB}
                  </span>
                  <div className="flex-1 h-3 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-terracotta rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(25, (specB.shoulderMm / 600) * 100))}%` }}
                    />
                  </div>
                  <span className="font-mono font-semibold w-16 text-right">
                    {formatMeasurement(specB.shoulderMm, displayUnit)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
        </>
      )}
    </div>
  );
}
