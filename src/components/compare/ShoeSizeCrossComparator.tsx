"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  SHOE_BRANDS,
  ShoeDemographic,
  ShoeSizeRecord,
  matchShoeSizeByFootLength,
  convertShoeSizeCrossBrand,
} from "@/core/data/shoeSizeMatrix";
import {
  Footprints,
  ArrowRight,
  ArrowLeftRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Search,
  Scale,
  Ruler,
} from "lucide-react";

export function ShoeSizeCrossComparator() {
  const [demographic, setDemographic] = useState<ShoeDemographic>("men");
  const [fromBrandId, setFromBrandId] = useState<string>("nike");
  const [toBrandId, setToBrandId] = useState<string>("adidas");

  // Input mode: 'size' or 'measurement'
  const [inputMode, setInputMode] = useState<"size" | "measurement">("size");

  // Selected UK size in source brand
  const [selectedUkSize, setSelectedUkSize] = useState<string>("8");

  // Measurement inputs in cm
  const [footCm, setFootCm] = useState<number>(27.0);

  // Table search filter
  const [tableSearch, setTableSearch] = useState<string>("");

  // Available source brand sizes
  const fromBrand = useMemo(() => {
    return SHOE_BRANDS.find((b) => b.brandId === fromBrandId) || SHOE_BRANDS[0];
  }, [fromBrandId]);

  const toBrand = useMemo(() => {
    return SHOE_BRANDS.find((b) => b.brandId === toBrandId) || SHOE_BRANDS[1];
  }, [toBrandId]);

  const availableSizes = useMemo(() => {
    return fromBrand.sizes[demographic] || [];
  }, [fromBrand, demographic]);

  // Ensure selected UK size is valid when demographic or fromBrand changes
  useEffect(() => {
    if (!availableSizes.some((s) => s.uk === selectedUkSize)) {
      if (availableSizes.length > 0) {
        const midIdx = Math.floor(availableSizes.length / 2);
        setSelectedUkSize(availableSizes[midIdx].uk);
        setFootCm(availableSizes[midIdx].cm);
      }
    }
  }, [availableSizes, selectedUkSize]);

  // Canonical foot length in mm
  const effectiveFootLengthMm = useMemo(() => {
    if (inputMode === "measurement") {
      return Math.round(footCm * 10);
    }
    const record = availableSizes.find((s) => s.uk === selectedUkSize);
    if (record) {
      return Math.round((record.footMinMm + record.footMaxMm) / 2);
    }
    return 270;
  }, [inputMode, footCm, availableSizes, selectedUkSize]);

  // Cross-brand comparison result
  const crossBrandResult = useMemo(() => {
    return convertShoeSizeCrossBrand(fromBrandId, toBrandId, demographic, selectedUkSize);
  }, [fromBrandId, toBrandId, demographic, selectedUkSize]);

  // Match size for each brand in database
  const allBrandRecommendations = useMemo(() => {
    return SHOE_BRANDS.map((brand) => {
      const match = matchShoeSizeByFootLength(brand.brandId, demographic, effectiveFootLengthMm);
      return {
        brand,
        match,
      };
    });
  }, [demographic, effectiveFootLengthMm]);

  // Full unified comparison matrix rows for the selected demographic
  const unifiedMatrixRows = useMemo(() => {
    // Collect all unique foot lengths in cm
    const cmMap = new Map<number, { cm: number; inches: number; brands: Record<string, ShoeSizeRecord> }>();

    for (const b of SHOE_BRANDS) {
      const records = b.sizes[demographic] || [];
      for (const rec of records) {
        if (!cmMap.has(rec.cm)) {
          cmMap.set(rec.cm, {
            cm: rec.cm,
            inches: rec.inches,
            brands: {},
          });
        }
        cmMap.get(rec.cm)!.brands[b.brandId] = rec;
      }
    }

    const sorted = Array.from(cmMap.values()).sort((a, b) => a.cm - b.cm);

    if (!tableSearch.trim()) return sorted;
    const q = tableSearch.toLowerCase().trim();
    return sorted.filter((row) => {
      if (row.cm.toString().includes(q)) return true;
      if (row.inches.toString().includes(q)) return true;
      return Object.values(row.brands).some(
        (rec) =>
          rec.uk.toLowerCase().includes(q) ||
          rec.us.toLowerCase().includes(q) ||
          rec.eu.toLowerCase().includes(q)
      );
    });
  }, [demographic, tableSearch]);

  const hasSizeDivergence =
    crossBrandResult.fromRecord &&
    crossBrandResult.toRecord &&
    crossBrandResult.fromRecord.uk !== crossBrandResult.toRecord.uk;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-card border border-border bg-gradient-to-br from-bg-surface via-bg-surface to-bg-elevated p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-badge bg-accent-subtle text-accent text-xs font-semibold tracking-wider uppercase mb-3">
          <Footprints className="w-3.5 h-3.5" />
          Deterministic Footwear Conversion Engine
        </div>
        <h2 className="font-display text-2xl sm:text-3xl text-text-primary">
          Cross-Brand Shoe Size & Last Equivalence
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-1.5 max-w-2xl leading-relaxed">
          Shoe sizes vary significantly across manufacturers: an Adidas UK 8 fits 26.5 cm, while a Nike UK 8 fits 27.0 cm. WearID eliminates sizing uncertainty by translating between UK, US, EU, CM, and Inches anchored on canonical foot length in millimeters.
        </p>

        {/* Demographic Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mr-1">
            Demographic:
          </span>
          {[
            { id: "men", label: "Men's Footwear (Adult UK 5–13)" },
            { id: "women", label: "Women's Footwear (Adult UK 2.5–9)" },
            { id: "kids", label: "Kids & Youth (Toddler to Grade School)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDemographic(tab.id as ShoeDemographic)}
              className={`min-h-[44px] px-4 py-2 rounded-badge text-xs font-semibold transition-all ${
                demographic === tab.id
                  ? "bg-accent text-white shadow-xs"
                  : "bg-bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Cross-Brand Comparator Console */}
      <div className="rounded-card border border-border bg-bg-surface p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-border">
          {/* Brand A (From) */}
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Source Brand (Known Size)
            </label>
            <select
              value={fromBrandId}
              onChange={(e) => setFromBrandId(e.target.value)}
              className="input-editorial w-full text-sm font-medium"
            >
              {SHOE_BRANDS.map((b) => (
                <option key={b.brandId} value={b.brandId}>
                  {b.brandName} ({b.country} · {b.lastOrigin.split("(")[0].trim()})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex p-2 rounded-full bg-bg-elevated border border-border text-text-tertiary">
            <ArrowLeftRight className="w-5 h-5" />
          </div>

          {/* Brand B (To) */}
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Target Brand (To Order)
            </label>
            <select
              value={toBrandId}
              onChange={(e) => setToBrandId(e.target.value)}
              className="input-editorial w-full text-sm font-medium"
            >
              {SHOE_BRANDS.map((b) => (
                <option key={b.brandId} value={b.brandId}>
                  {b.brandName} ({b.country} · {b.lastOrigin.split("(")[0].trim()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Toggle & Selector */}
        <div className="mt-6 pt-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInputMode("size")}
                className={`min-h-[40px] px-3.5 rounded-btn text-xs font-semibold transition-colors ${
                  inputMode === "size"
                    ? "bg-text-primary text-bg-surface shadow-xs"
                    : "bg-bg-elevated text-text-secondary hover:text-text-primary"
                }`}
              >
                Enter Size in {fromBrand.brandName}
              </button>
              <button
                type="button"
                onClick={() => setInputMode("measurement")}
                className={`min-h-[40px] px-3.5 rounded-btn text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  inputMode === "measurement"
                    ? "bg-text-primary text-bg-surface shadow-xs"
                    : "bg-bg-elevated text-text-secondary hover:text-text-primary"
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                Foot Length (CM / IN)
              </button>
            </div>

            <span className="text-xs text-text-secondary hidden sm:inline-block">
              Canonical Anchor: <strong className="text-accent">{effectiveFootLengthMm} mm</strong>
            </span>
          </div>

          {inputMode === "size" ? (
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-2">
                Select your comfortable size in {fromBrand.brandName}:
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((rec) => (
                  <button
                    key={rec.uk}
                    type="button"
                    onClick={() => {
                      setSelectedUkSize(rec.uk);
                      setFootCm(rec.cm);
                    }}
                    className={`min-h-[44px] px-3.5 py-2 rounded-card border text-xs font-medium transition-all ${
                      selectedUkSize === rec.uk
                        ? "border-accent bg-accent text-white font-semibold shadow-xs"
                        : "border-border bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                    }`}
                  >
                    <span className="block font-bold">UK {rec.uk}</span>
                    <span className="text-[10px] opacity-80 block">
                      US {rec.us} · {rec.cm}cm
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-text-secondary">Foot Length:</span>
                <span className="text-text-primary font-bold text-base">
                  {footCm.toFixed(1)} cm / {(footCm / 2.54).toFixed(2)} inches
                </span>
              </div>
              <input
                type="range"
                min={demographic === "kids" ? 8.0 : demographic === "women" ? 21.5 : 23.5}
                max={demographic === "kids" ? 24.5 : demographic === "women" ? 28.0 : 31.0}
                step={0.1}
                value={footCm}
                onChange={(e) => setFootCm(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-text-tertiary">
                <span>{demographic === "kids" ? "8.0 cm (Infant)" : "22.0 cm (Petite)"}</span>
                <span>{demographic === "kids" ? "24.5 cm (Youth)" : "31.0 cm (Large)"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Brand A vs Brand B Hero Divergence Card */}
        {crossBrandResult.fromRecord && crossBrandResult.toRecord && (
          <div className="mt-8 pt-6 border-t border-border">
            {hasSizeDivergence ? (
              <div className="p-4 rounded-card bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-semibold text-amber-600 block mb-0.5">
                    Critical Cross-Brand Sizing Divergence Detected
                  </span>
                  <span>
                    Your <strong>UK {crossBrandResult.fromRecord.uk}</strong> in {fromBrand.brandName} corresponds to a <strong>{crossBrandResult.fromRecord.cm} cm</strong> foot length. In {toBrand.brandName}, the anatomically correct equivalent is <strong>UK {crossBrandResult.toRecord.uk}</strong>.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-card bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 mb-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-semibold text-emerald-600 block mb-0.5">
                    Identical UK Numerical Sizing
                  </span>
                  <span>
                    Both {fromBrand.brandName} and {toBrand.brandName} recommend <strong>UK {crossBrandResult.fromRecord.uk}</strong> for your foot length of <strong>{crossBrandResult.fromRecord.cm} cm</strong>.
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Brand A Card */}
              <div className="p-5 rounded-card border border-border bg-bg-surface flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block mb-1">
                    Your Current Reference
                  </span>
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="font-semibold text-lg text-text-primary">{fromBrand.brandName}</h3>
                    <span className="text-2xl font-light text-accent">
                      UK {crossBrandResult.fromRecord.uk}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs p-2.5 rounded-card bg-bg-elevated border border-border">
                    <div>
                      <span className="text-[10px] text-text-tertiary block">US</span>
                      <strong className="text-text-primary">{crossBrandResult.fromRecord.us}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-tertiary block">EU</span>
                      <strong className="text-text-primary">{crossBrandResult.fromRecord.eu}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-tertiary block">CM</span>
                      <strong className="text-text-primary">{crossBrandResult.fromRecord.cm}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-tertiary block">IN</span>
                      <strong className="text-text-primary">{crossBrandResult.fromRecord.inches}&quot;</strong>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-text-secondary mt-3 italic">
                  {fromBrand.fitNote}
                </p>
              </div>

              {/* Brand B Card */}
              <div className="p-5 rounded-card border-2 border-accent bg-accent-subtle/30 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-accent block">
                      Target Recommended Fit
                    </span>
                    <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-semibold uppercase">
                      Exact Match
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="font-semibold text-lg text-text-primary">{toBrand.brandName}</h3>
                    <span className="text-2xl font-bold text-accent">
                      UK {crossBrandResult.toRecord.uk}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs p-2.5 rounded-card bg-bg-surface border border-accent/30">
                    <div>
                      <span className="text-[10px] text-text-tertiary block">US</span>
                      <strong className="text-text-primary">{crossBrandResult.toRecord.us}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-tertiary block">EU</span>
                      <strong className="text-text-primary">{crossBrandResult.toRecord.eu}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-tertiary block">CM</span>
                      <strong className="text-text-primary">{crossBrandResult.toRecord.cm}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-tertiary block">IN</span>
                      <strong className="text-text-primary">{crossBrandResult.toRecord.inches}&quot;</strong>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-text-secondary mt-3 italic">
                  {toBrand.fitNote}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cross-Brand Sizing Across All 6 Manufacturers */}
      <div>
        <div className="mb-4">
          <h3 className="font-semibold text-base text-text-primary">
            Equivalent Size Across Major Footwear Brands ({demographic.toUpperCase()})
          </h3>
          <p className="text-xs text-text-secondary">
            Anchored on your {effectiveFootLengthMm} mm ({(effectiveFootLengthMm / 10).toFixed(1)} cm / {((effectiveFootLengthMm / 10) / 2.54).toFixed(2)} in) foot length:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allBrandRecommendations.map(({ brand, match }) => (
            <div
              key={brand.brandId}
              className={`p-4 rounded-card border transition-all ${
                brand.brandId === toBrandId
                  ? "border-accent bg-accent-subtle/20 shadow-xs"
                  : "border-border bg-bg-surface"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-text-primary">{brand.brandName}</span>
                <span className="text-[10px] text-text-secondary bg-bg-elevated px-2 py-0.5 rounded-badge uppercase">
                  {brand.country}
                </span>
              </div>

              {match ? (
                <div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-accent">UK {match.uk}</span>
                    <span className="text-xs text-text-secondary">
                      (US {match.us} · EU {match.eu})
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-text-secondary border-t border-border pt-2">
                    <span>Footbed: <strong>{match.cm} cm</strong> ({match.inches}&quot;)</span>
                    <span className="text-emerald-600 font-medium">Optimal Ease</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-text-tertiary">Size range not available</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Master Equivalence Matrix Table */}
      <div className="rounded-card border border-border bg-bg-surface p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-base text-text-primary">
              Full Master Shoe Size Equivalence Matrix
            </h3>
            <p className="text-xs text-text-secondary">
              Official brand conversion charts comparing UK, US, EU, CM, and Inches for {demographic} footwear.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filter by UK, US, EU, or CM..."
              className="input-editorial w-full pl-9 text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-elevated text-text-secondary font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Foot Length</th>
                <th className="py-3 px-3">Inches</th>
                <th className="py-3 px-3">Nike (UK / US / EU)</th>
                <th className="py-3 px-3">Adidas (UK / US / EU)</th>
                <th className="py-3 px-3">Puma (UK / US / EU)</th>
                <th className="py-3 px-3">Bata India (UK / EU)</th>
                <th className="py-3 px-3">Red Tape (UK / EU)</th>
                <th className="py-3 px-3">Clarks (UK / US / EU)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {unifiedMatrixRows.map((row) => {
                const isSelectedLength =
                  Math.abs(row.cm - effectiveFootLengthMm / 10) < 0.3;

                return (
                  <tr
                    key={row.cm}
                    className={`transition-colors ${
                      isSelectedLength
                        ? "bg-accent-subtle/60 font-semibold"
                        : "hover:bg-bg-elevated/50"
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-text-primary">{row.cm} cm</span>
                      <span className="text-[10px] text-text-tertiary block">
                        {Math.round(row.cm * 10)} mm
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary">{row.inches}&quot;</td>

                    {/* Nike */}
                    <td className="py-2.5 px-3">
                      {row.brands.nike ? (
                        <span className="text-text-primary">
                          <strong>UK {row.brands.nike.uk}</strong> / US {row.brands.nike.us} / EU {row.brands.nike.eu}
                        </span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>

                    {/* Adidas */}
                    <td className="py-2.5 px-3">
                      {row.brands.adidas ? (
                        <span className="text-text-primary">
                          <strong>UK {row.brands.adidas.uk}</strong> / US {row.brands.adidas.us} / EU {row.brands.adidas.eu}
                        </span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>

                    {/* Puma */}
                    <td className="py-2.5 px-3">
                      {row.brands.puma ? (
                        <span className="text-text-primary">
                          <strong>UK {row.brands.puma.uk}</strong> / US {row.brands.puma.us} / EU {row.brands.puma.eu}
                        </span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>

                    {/* Bata India */}
                    <td className="py-2.5 px-3">
                      {row.brands.bata ? (
                        <span className="text-text-primary">
                          <strong>UK {row.brands.bata.uk}</strong> / EU {row.brands.bata.eu}
                        </span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>

                    {/* Red Tape */}
                    <td className="py-2.5 px-3">
                      {row.brands.red_tape ? (
                        <span className="text-text-primary">
                          <strong>UK {row.brands.red_tape.uk}</strong> / EU {row.brands.red_tape.eu}
                        </span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>

                    {/* Clarks */}
                    <td className="py-2.5 px-3">
                      {row.brands.clarks ? (
                        <span className="text-text-primary">
                          <strong>UK {row.brands.clarks.uk}</strong> / US {row.brands.clarks.us} / EU {row.brands.clarks.eu}
                        </span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
