"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
} from "lucide-react";

export function BrandComparisonView() {
  const { displayUnit } = useProfileStore();

  // Products available for comparison
  const [productAId, setProductAId] = useState<string>("prod_uniqlo_airism_oversized");
  const [sizeA, setSizeA] = useState<string>("M");

  const [productBId, setProductBId] = useState<string>("prod_zara_textured_tee");
  const [sizeB, setSizeB] = useState<string>("M");

  const prodA: PilotProduct = useMemo(
    () => PILOT_PRODUCTS.find((p) => p.id === productAId) || PILOT_PRODUCTS[0],
    [productAId]
  );

  const prodB: PilotProduct = useMemo(
    () => PILOT_PRODUCTS.find((p) => p.id === productBId) || PILOT_PRODUCTS[1] || PILOT_PRODUCTS[0],
    [productBId]
  );

  // Available size labels for A
  const availableSizesA = useMemo(() => {
    if (prodA.layer3Specs && prodA.layer3Specs.length > 0) {
      return prodA.layer3Specs.map((s) => s.sizeLabel);
    }
    if (prodA.layer2Charts && prodA.layer2Charts.length > 0) {
      return prodA.layer2Charts.map((c) => c.sizeLabel);
    }
    return ["S", "M", "L", "XL"];
  }, [prodA]);

  // Available size labels for B
  const availableSizesB = useMemo(() => {
    if (prodB.layer3Specs && prodB.layer3Specs.length > 0) {
      return prodB.layer3Specs.map((s) => s.sizeLabel);
    }
    if (prodB.layer2Charts && prodB.layer2Charts.length > 0) {
      return prodB.layer2Charts.map((c) => c.sizeLabel);
    }
    return ["S", "M", "L", "XL"];
  }, [prodB]);

  // Derive flat chest or body mid chest for A
  const specA = useMemo(() => {
    if (prodA.layer3Specs) {
      const match = prodA.layer3Specs.find((s) => s.sizeLabel === sizeA) || prodA.layer3Specs[0];
      if (match) {
        return {
          chestFlatMm: match.chestFlatMm,
          chestCircMm: match.chestFlatMm * 2,
          shoulderMm: match.shoulderMm || 460,
          lengthMm: match.lengthMm || 720,
          isLayer3: true,
        };
      }
    }
    if (prodA.layer2Charts) {
      const match = prodA.layer2Charts.find((c) => c.sizeLabel === sizeA) || prodA.layer2Charts[0];
      if (match && match.chestMinMm && match.chestMaxMm) {
        const mid = (match.chestMinMm + match.chestMaxMm) / 2;
        return {
          chestFlatMm: Math.round(mid / 2),
          chestCircMm: Math.round(mid),
          shoulderMm: 450,
          lengthMm: 710,
          isLayer3: false,
        };
      }
    }
    return { chestFlatMm: 530, chestCircMm: 1060, shoulderMm: 460, lengthMm: 720, isLayer3: true };
  }, [prodA, sizeA]);

  // Derive flat chest or body mid chest for B
  const specB = useMemo(() => {
    if (prodB.layer3Specs) {
      const match = prodB.layer3Specs.find((s) => s.sizeLabel === sizeB) || prodB.layer3Specs[0];
      if (match) {
        return {
          chestFlatMm: match.chestFlatMm,
          chestCircMm: match.chestFlatMm * 2,
          shoulderMm: match.shoulderMm || 450,
          lengthMm: match.lengthMm || 710,
          isLayer3: true,
        };
      }
    }
    if (prodB.layer2Charts) {
      const match = prodB.layer2Charts.find((c) => c.sizeLabel === sizeB) || prodB.layer2Charts[0];
      if (match && match.chestMinMm && match.chestMaxMm) {
        const mid = (match.chestMinMm + match.chestMaxMm) / 2;
        return {
          chestFlatMm: Math.round(mid / 2),
          chestCircMm: Math.round(mid),
          shoulderMm: 440,
          lengthMm: 700,
          isLayer3: false,
        };
      }
    }
    return { chestFlatMm: 500, chestCircMm: 1000, shoulderMm: 440, lengthMm: 700, isLayer3: false };
  }, [prodB, sizeB]);

  // Differences (B relative to A)
  const chestCircDeltaMm = specB.chestCircMm - specA.chestCircMm;
  const chestCircDeltaCm = Math.round(chestCircDeltaMm / 10);
  const shoulderDeltaMm = specB.shoulderMm - specA.shoulderMm;

  // Generate plain-English verdict
  let fitVerdict = "";
  let verdictColor = "";

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
          Ever wonder why a Size M in one brand fits completely differently in another? Compare verified cutting-table specifications side by side.
        </p>
      </div>

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
              onChange={(e) => {
                setProductAId(e.target.value);
              }}
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
            <div className="flex justify-between">
              <span className="text-text-secondary">Shoulder Width:</span>
              <span className="font-mono text-text-primary">
                {formatMeasurement(specA.shoulderMm, displayUnit)}
              </span>
            </div>
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
              onChange={(e) => {
                setProductBId(e.target.value);
              }}
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
            <div className="flex justify-between">
              <span className="text-text-secondary">Shoulder Width:</span>
              <span className="font-mono text-text-primary">
                {formatMeasurement(specB.shoulderMm, displayUnit)}
              </span>
            </div>
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

        {/* Chest Girth Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-text-primary">
              Chest Circumference Variance
            </span>
            <span className="font-mono text-xs font-bold text-accent">
              {chestCircDeltaMm > 0 ? `+${chestCircDeltaMm} mm roomier` : chestCircDeltaMm < 0 ? `${chestCircDeltaMm} mm slimmer` : "Exact match"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-24 text-text-secondary font-medium truncate text-right">
                {prodA.brandName} {sizeA}
              </span>
              <div className="flex-1 h-3 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(30, (specA.chestCircMm / 1300) * 100))}%` }}
                />
              </div>
              <span className="font-mono font-semibold w-16 text-right">
                {formatMeasurement(specA.chestCircMm, displayUnit)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-24 text-text-secondary font-medium truncate text-right">
                {prodB.brandName} {sizeB}
              </span>
              <div className="flex-1 h-3 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-terracotta rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(30, (specB.chestCircMm / 1300) * 100))}%` }}
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
              {shoulderDeltaMm > 0 ? `+${shoulderDeltaMm} mm broader` : shoulderDeltaMm < 0 ? `${shoulderDeltaMm} mm narrower` : "Identical seam"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-24 text-text-secondary font-medium truncate text-right">
                {prodA.brandName} {sizeA}
              </span>
              <div className="flex-1 h-3 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(30, (specA.shoulderMm / 600) * 100))}%` }}
                />
              </div>
              <span className="font-mono font-semibold w-16 text-right">
                {formatMeasurement(specA.shoulderMm, displayUnit)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-24 text-text-secondary font-medium truncate text-right">
                {prodB.brandName} {sizeB}
              </span>
              <div className="flex-1 h-3 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-terracotta rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(30, (specB.shoulderMm / 600) * 100))}%` }}
                />
              </div>
              <span className="font-mono font-semibold w-16 text-right">
                {formatMeasurement(specB.shoulderMm, displayUnit)}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
