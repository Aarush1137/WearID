"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProfileStore } from "@/core/state/profileStore";
import { VisualEaseGuide } from "@/components/visual/VisualEaseGuide";
import { FitType } from "@/core/types";

export default function EaseGuidePage() {
  const { getActiveProfile, displayUnit, updatePreference } = useProfileStore();
  const activeProfile = getActiveProfile();

  const [activeCategory, setActiveCategory] = useState<string>("t_shirt");

  const preferredFit = (activeProfile.preferences?.[activeCategory] as FitType) || "regular";

  const handleSilhouetteSelected = (silhouette: "slim" | "regular" | "relaxed" | "oversized") => {
    updatePreference(activeProfile.id, activeCategory, silhouette);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb & Navigation */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500">
        <Link href="/app" className="hover:underline">
          Dashboard
        </Link>
        <span>/</span>
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">Visual Ease Guide</span>
      </nav>

      {/* Hero Header */}
      <div className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        <span className="inline-block rounded-full bg-[#1B2A4A] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
          Invariant 3 Architecture
        </span>
        <h1 className="mt-3 font-serif text-3xl font-bold text-[#1B2A4A] dark:text-white sm:text-4xl">
          Visual Ease & Drape Guide
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Understand the mathematical difference between your body’s anatomical circumference and
          finished garment dimensions. In WearID, ease is strictly quantified in canonical millimeters.
        </p>

        {/* Category Filter Pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { id: "t_shirt", label: "T-Shirts" },
            { id: "t_shirt_oversized", label: "Oversized Tees" },
            { id: "shirt_casual", label: "Casual Shirts" },
            { id: "shirt_formal", label: "Dress Shirts" },
            { id: "jacket", label: "Jackets & Outerwear" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-[#1B2A4A] text-white dark:bg-blue-600"
                  : "bg-white text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Visual Guide */}
      <VisualEaseGuide
        currentFitIntent={preferredFit as any}
        userChestMm={activeProfile.measurements?.chestMm || 980}
        displayUnit={displayUnit}
        onSelectSilhouette={handleSilhouetteSelected}
        interactive={true}
      />

      {/* Educational Explanatory Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-2 text-2xl font-serif text-[#1B2A4A] dark:text-blue-400">01</div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Wearing Ease</h3>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            The fundamental clearance (+40mm to +60mm) required for basic respiratory expansion,
            shoulder mobility, and sitting down without textile stress.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-2 text-2xl font-serif text-[#A47834] dark:text-amber-400">02</div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Design Ease</h3>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            The intentional aesthetic volume (+60mm to +220mm) added by patternmakers to express
            specific stylistic attitudes—from razor-sharp British bespoke to relaxed boxy streetwear.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-2 text-2xl font-serif text-[#1D5D42] dark:text-emerald-400">03</div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Fabric Interaction</h3>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            Rigid 100% cotton garments require larger ease buffers (+80mm+) to drape properly, whereas
            elastane-infused knit blends can comfortably articulate with closer tolerances.
          </p>
        </div>
      </div>
    </div>
  );
}
