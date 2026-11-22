"use client";

import React, { useState } from "react";
import { FitType } from "@/core/types";
import { formatMeasurement } from "@/core/formatters";

export interface SilhouetteGuideItem {
  id: "slim" | "regular" | "relaxed" | "oversized";
  name: string;
  tagline: string;
  chestEaseRangeMm: { min: number; max: number };
  waistEaseRangeMm: { min: number; max: number };
  dropShoulderMm: number;
  fitFeelDescription: string;
  fabricRecommendation: string;
  badgeColor: string;
}

export const SILHOUETTES: SilhouetteGuideItem[] = [
  {
    id: "slim",
    name: "Slim Fit",
    tagline: "Contoured & Sleek",
    chestEaseRangeMm: { min: 40, max: 60 },
    waistEaseRangeMm: { min: 30, max: 50 },
    dropShoulderMm: 0,
    fitFeelDescription:
      "Close contact with chest and torso; zero excess fabric billowing; sleek modern profile.",
    fabricRecommendation:
      "Requires 2-4% elastane or flexible knit to prevent tightness and maintain natural arm articulation.",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    id: "regular",
    name: "Regular Fit",
    tagline: "Classic Savile Row Drape",
    chestEaseRangeMm: { min: 60, max: 100 },
    waistEaseRangeMm: { min: 50, max: 80 },
    dropShoulderMm: 10,
    fitFeelDescription:
      "Classic tailored comfort; ~2 fingers breathing room on each side; moves effortlessly with natural respiration.",
    fabricRecommendation:
      "Standard for 100% rigid combed cotton, Oxford weaves, poplin, or linen.",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    id: "relaxed",
    name: "Relaxed Fit",
    tagline: "Casual Drape & Freedom",
    chestEaseRangeMm: { min: 100, max: 140 },
    waistEaseRangeMm: { min: 80, max: 120 },
    dropShoulderMm: 25,
    fitFeelDescription:
      "Draped casual silhouette; subtle drop shoulder; fabric floats freely over midsection without clutching.",
    fabricRecommendation:
      "Drapes cleanly in medium-to-heavy cotton jersey (180-220 GSM).",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300",
  },
  {
    id: "oversized",
    name: "Oversized Fit",
    tagline: "Boxy Streetwear Architecture",
    chestEaseRangeMm: { min: 140, max: 220 },
    waistEaseRangeMm: { min: 120, max: 180 },
    dropShoulderMm: 45,
    fitFeelDescription:
      "Architectural streetwear silhouette; exaggerated drop shoulder; wide sleeve opening and breezy torso suspension.",
    fabricRecommendation:
      "Requires heavyweight 240+ GSM combed cotton to prevent drape collapse and maintain structured drape.",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300",
  },
];

export interface VisualEaseGuideProps {
  currentFitIntent?: "slim" | "regular" | "relaxed" | "oversized";
  userChestMm?: number;
  displayUnit?: "cm" | "in";
  onSelectSilhouette?: (silhouette: "slim" | "regular" | "relaxed" | "oversized") => void;
  interactive?: boolean;
  className?: string;
}

export function VisualEaseGuide({
  currentFitIntent = "regular",
  userChestMm = 980,
  displayUnit = "cm",
  onSelectSilhouette,
  interactive = true,
  className = "",
}: VisualEaseGuideProps) {
  const [selectedSilhouette, setSelectedSilhouette] = useState<
    "slim" | "regular" | "relaxed" | "oversized"
  >(currentFitIntent);

  const activeItem =
    SILHOUETTES.find((s) => s.id === selectedSilhouette) || SILHOUETTES[1];

  const handleSelect = (id: "slim" | "regular" | "relaxed" | "oversized") => {
    setSelectedSilhouette(id);
    if (onSelectSilhouette) {
      onSelectSilhouette(id);
    }
  };

  // Garment width expansion parameters for SVG drape visualization
  const drapeFactors = {
    slim: { shoulderHalf: 58, chestHalf: 66, waistHalf: 57, hemHalf: 64, dropY: 0 },
    regular: { shoulderHalf: 64, chestHalf: 75, waistHalf: 67, hemHalf: 73, dropY: 6 },
    relaxed: { shoulderHalf: 72, chestHalf: 86, waistHalf: 78, hemHalf: 83, dropY: 14 },
    oversized: { shoulderHalf: 82, chestHalf: 98, waistHalf: 92, hemHalf: 95, dropY: 24 },
  }[selectedSilhouette];

  const minEaseFormatted = formatMeasurement(activeItem.chestEaseRangeMm.min, displayUnit);
  const maxEaseFormatted = formatMeasurement(activeItem.chestEaseRangeMm.max, displayUnit);

  const garmentMinChestMm = userChestMm + activeItem.chestEaseRangeMm.min;
  const garmentMaxChestMm = userChestMm + activeItem.chestEaseRangeMm.max;

  return (
    <div
      data-testid="visual-ease-guide"
      className={`rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-serif text-xl font-semibold text-[#1B2A4A] dark:text-neutral-100">
            Visual Ease & Silhouette Guide
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Deterministic ease delta ranges across Savile Row tailored silhouettes
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${activeItem.badgeColor}`}
        >
          {activeItem.name}: +{minEaseFormatted} to +{maxEaseFormatted} Ease
        </span>
      </div>

      {/* Silhouette Selection Tabs */}
      {interactive && (
        <div
          data-testid="silhouette-tabs"
          className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {SILHOUETTES.map((s) => {
            const isSelected = s.id === selectedSilhouette;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelect(s.id)}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                  isSelected
                    ? "border-[#1B2A4A] bg-[#1B2A4A] text-white shadow-md dark:border-blue-500 dark:bg-blue-600"
                    : "border-neutral-200 bg-[#FAF8F5] text-neutral-800 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                }`}
              >
                <span className="text-sm font-semibold">{s.name}</span>
                <span
                  className={`text-xs ${
                    isSelected ? "text-neutral-200" : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  +{s.chestEaseRangeMm.min}-{s.chestEaseRangeMm.max}mm
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Visual Drape Display */}
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
        {/* SVG Graphic (5 cols) */}
        <div className="flex justify-center rounded-xl bg-[#FAF8F5] p-4 dark:bg-neutral-800/50 lg:col-span-5">
          <svg
            viewBox="0 0 240 280"
            className="h-64 w-full max-w-[220px]"
            aria-label={`Visual drape for ${activeItem.name}`}
          >
            <defs>
              {/* Ease Halo Gradient */}
              <radialGradient id="easeHaloGrad" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#1B2A4A" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#1B2A4A" stopOpacity="0.04" />
              </radialGradient>
            </defs>

            {/* Ease Halo Region (Difference between garment drape and body) */}
            <path
              d={`
                M ${120 - drapeFactors.shoulderHalf} ${45 + drapeFactors.dropY}
                Q 120 40 ${120 + drapeFactors.shoulderHalf} ${45 + drapeFactors.dropY}
                L ${120 + drapeFactors.chestHalf} 115
                Q ${120 + drapeFactors.waistHalf} 175 ${120 + drapeFactors.hemHalf} 235
                L ${120 - drapeFactors.hemHalf} 235
                Q ${120 - drapeFactors.waistHalf} 175 ${120 - drapeFactors.chestHalf} 115
                Z
              `}
              fill="url(#easeHaloGrad)"
            />

            {/* Outer Garment Drape Outline */}
            <path
              d={`
                M ${120 - drapeFactors.shoulderHalf} ${45 + drapeFactors.dropY}
                Q 120 40 ${120 + drapeFactors.shoulderHalf} ${45 + drapeFactors.dropY}
                L ${120 + drapeFactors.chestHalf} 115
                Q ${120 + drapeFactors.waistHalf} 175 ${120 + drapeFactors.hemHalf} 235
                L ${120 - drapeFactors.hemHalf} 235
                Q ${120 - drapeFactors.waistHalf} 175 ${120 - drapeFactors.chestHalf} 115
                Z
              `}
              fill="none"
              stroke="#1B2A4A"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="dark:stroke-blue-400"
            />

            {/* Inner Body Mannequin Outline (Dashed Natural Silhouette) */}
            {/* Head & Neck */}
            <circle cx="120" cy="22" r="14" fill="#D1C7BD" opacity="0.6" />
            <rect x="114" y="34" width="12" height="12" fill="#D1C7BD" opacity="0.6" rx="2" />

            {/* Body Torso Contour */}
            <path
              d="
                M 70 52
                Q 120 46 170 52
                L 165 115
                Q 146 175 162 230
                L 78 230
                Q 94 175 75 115
                Z
              "
              fill="#E8E2D9"
              fillOpacity="0.8"
              stroke="#A89F91"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />

            {/* Chest Width Dimension Line */}
            <line x1="75" y1="115" x2="165" y2="115" stroke="#A89F91" strokeWidth="1" />
            <circle cx="75" cy="115" r="2.5" fill="#1B2A4A" />
            <circle cx="165" cy="115" r="2.5" fill="#1B2A4A" />

            {/* Breathing Ease Callout Arrow on Side */}
            <line
              x1="165"
              y1="115"
              x2={120 + drapeFactors.chestHalf}
              y2="115"
              stroke="#A47834"
              strokeWidth="2"
            />
            <text
              x={120 + drapeFactors.chestHalf + 6}
              y="119"
              fontSize="9"
              fontWeight="bold"
              fill="#A47834"
            >
              +{activeItem.chestEaseRangeMm.min}-{activeItem.chestEaseRangeMm.max}mm
            </text>
          </svg>
        </div>

        {/* Breakdown & Tactile Sensation (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          {/* Fit Feel Card */}
          <div className="rounded-xl border border-neutral-200 bg-[#FAF8F5] p-4 dark:border-neutral-800 dark:bg-neutral-800/60">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Sensation & Drape Profile
              </h4>
              <span className="text-xs font-semibold text-[#A47834] dark:text-amber-400">
                {activeItem.tagline}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">
              {activeItem.fitFeelDescription}
            </p>
          </div>

          {/* Calibrated Specs Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
              <span className="text-neutral-500 dark:text-neutral-400">Target Chest Ease</span>
              <p className="mt-1 text-base font-semibold text-[#1B2A4A] dark:text-neutral-100">
                +{activeItem.chestEaseRangeMm.min} to +{activeItem.chestEaseRangeMm.max} mm
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
              <span className="text-neutral-500 dark:text-neutral-400">Target Waist Ease</span>
              <p className="mt-1 text-base font-semibold text-[#1B2A4A] dark:text-neutral-100">
                +{activeItem.waistEaseRangeMm.min} to +{activeItem.waistEaseRangeMm.max} mm
              </p>
            </div>
            <div className="col-span-2 rounded-lg border border-neutral-200 bg-white p-3 sm:col-span-1 dark:border-neutral-800 dark:bg-neutral-900">
              <span className="text-neutral-500 dark:text-neutral-400">Drop Shoulder</span>
              <p className="mt-1 text-base font-semibold text-[#1B2A4A] dark:text-neutral-100">
                +{activeItem.dropShoulderMm} mm
              </p>
            </div>
          </div>

          {/* Dynamic Personalized Chest Calculation */}
          {userChestMm > 0 && (
            <div className="rounded-xl border border-[#D5DFD7] bg-[#F2F7F4] p-3 text-xs text-[#1D5D42] dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
              <span className="font-semibold">Calibrated against your chest: </span>
              Body circumference is {formatMeasurement(userChestMm, displayUnit)}. Recommended
              garment finished chest is{" "}
              <strong>
                {formatMeasurement(garmentMinChestMm, displayUnit)} –{" "}
                {formatMeasurement(garmentMaxChestMm, displayUnit)}
              </strong>
              .
            </div>
          )}

          {/* Fabric Engineering Note */}
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              Fabric Engineering:{" "}
            </span>
            {activeItem.fabricRecommendation}
          </div>
        </div>
      </div>
    </div>
  );
}
