"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useProfileStore, UserProfile } from "@/core/state/profileStore";
import {
  buildFamilyMatrix,
  generateFamilyCheatSheetText,
  MatrixCategoryFilter,
  RELATION_LABELS,
} from "@/core/sizing/familyMatrixService";
import {
  Users,
  Copy,
  Check,
  User,
  Heart,
  Shield,
  Sparkles,
  Shirt,
  Footprints,
  Filter,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
} from "lucide-react";

const RELATION_ICONS: Record<UserProfile["relation"], React.ReactNode> = {
  self: <User className="w-3.5 h-3.5" />,
  partner: <Heart className="w-3.5 h-3.5" />,
  parent: <Shield className="w-3.5 h-3.5" />,
  child: <Sparkles className="w-3.5 h-3.5" />,
  other: <Users className="w-3.5 h-3.5" />,
};

const RELATION_BADGES: Record<
  UserProfile["relation"],
  { bg: string; text: string; border: string }
> = {
  self: {
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  partner: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
  },
  parent: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  child: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  other: {
    bg: "bg-slate-50 dark:bg-slate-900",
    text: "text-slate-700 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800",
  },
};

export function FamilySizeMatrixView() {
  const { profiles, activeProfileId, setActiveProfileId } = useProfileStore();
  const [categoryFilter, setCategoryFilter] = useState<MatrixCategoryFilter>("all");
  const [copied, setCopied] = useState(false);

  // Compute family matrix
  const matrix = useMemo(() => {
    return buildFamilyMatrix(profiles, categoryFilter);
  }, [profiles, categoryFilter]);

  const handleCopyCheatSheet = () => {
    const text = generateFamilyCheatSheetText(matrix);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E7E5E4] dark:border-[#292524] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D4A3E]/10 dark:bg-[#2D4A3E]/30 text-[#2D4A3E] dark:text-[#52B788] text-xs font-semibold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            Multi-Profile Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1917] dark:text-[#F5F5F4] tracking-tight">
            Family Multi-Profile Size Matrix
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#78716C] dark:text-[#A8A29E] max-w-2xl leading-relaxed">
            Compare recommended sizes across your entire family in one place. One-click profile switching and zero-biometric size cheat sheets for effortless group shopping.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/app/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E7E5E4] dark:border-[#292524] bg-white dark:bg-[#1C1917] hover:bg-[#F5F5F4] text-xs font-semibold text-[#1C1917] dark:text-[#F5F5F4] transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#78716C]" />
            Manage Members
          </Link>

          <button
            onClick={handleCopyCheatSheet}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D4A3E] hover:bg-[#243B32] text-white font-semibold text-xs transition-all shadow-sm active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied Cheat Sheet!" : "Copy Size Cheat Sheet"}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#78716C] dark:text-[#A8A29E] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          <div className="inline-flex p-1 rounded-xl bg-[#F5F5F4] dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524]">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                categoryFilter === "all"
                  ? "bg-white dark:bg-[#292524] text-[#1C1917] dark:text-[#F5F5F4] shadow-sm font-bold"
                  : "text-[#78716C] dark:text-[#A8A29E]"
              }`}
            >
              All Benchmark Brands
            </button>
            <button
              onClick={() => setCategoryFilter("top")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                categoryFilter === "top"
                  ? "bg-white dark:bg-[#292524] text-[#1C1917] dark:text-[#F5F5F4] shadow-sm font-bold"
                  : "text-[#78716C] dark:text-[#A8A29E]"
              }`}
            >
              <Shirt className="w-3.5 h-3.5" /> Tops
            </button>
            <button
              onClick={() => setCategoryFilter("bottom")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                categoryFilter === "bottom"
                  ? "bg-white dark:bg-[#292524] text-[#1C1917] dark:text-[#F5F5F4] shadow-sm font-bold"
                  : "text-[#78716C] dark:text-[#A8A29E]"
              }`}
            >
              Bottoms & Jeans
            </button>
            <button
              onClick={() => setCategoryFilter("shoes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                categoryFilter === "shoes"
                  ? "bg-white dark:bg-[#292524] text-[#1C1917] dark:text-[#F5F5F4] shadow-sm font-bold"
                  : "text-[#78716C] dark:text-[#A8A29E]"
              }`}
            >
              <Footprints className="w-3.5 h-3.5" /> Footwear
            </button>
          </div>
        </div>

        <p className="text-xs text-[#A8A29E]">
          Comparing {profiles.length} member{profiles.length > 1 ? "s" : ""} across {matrix.benchmarkBrands.length} brands
        </p>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="w-full overflow-x-auto rounded-2xl border border-[#E7E5E4] dark:border-[#292524] bg-white dark:bg-[#1C1917] shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#E7E5E4] dark:border-[#292524] bg-[#FBF9F5] dark:bg-[#121110]">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] w-[240px]">
                Brand & Category
              </th>

              {matrix.columns.map((col) => {
                const isActive = col.profileId === activeProfileId;
                const badge = RELATION_BADGES[col.relation];

                return (
                  <th key={col.profileId} className="p-4 min-w-[200px]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {RELATION_ICONS[col.relation]}
                            {col.relationLabel}
                          </span>
                        </div>

                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <button
                            onClick={() => setActiveProfileId(col.profileId)}
                            className="text-[11px] font-semibold text-[#2D4A3E] dark:text-[#52B788] hover:underline"
                          >
                            Make Active
                          </button>
                        )}
                      </div>

                      <h3 className="text-base font-serif font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                        {col.profileName}
                      </h3>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E7E5E4] dark:divide-[#292524]">
            {matrix.benchmarkBrands.map((brand) => (
              <tr
                key={brand.brandId}
                className="hover:bg-[#FBF9F5] dark:hover:bg-[#121110]/50 transition-colors"
              >
                {/* Brand Column */}
                <td className="p-4 align-top">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E]">
                    {brand.categoryLabel}
                  </span>
                  <h4 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4] mt-0.5">
                    {brand.brandName}
                  </h4>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                    {brand.sampleProductName}
                  </p>
                </td>

                {/* Member Cells */}
                {matrix.columns.map((col) => {
                  const rec = col.recommendations[brand.brandId];
                  if (!rec) {
                    return (
                      <td key={col.profileId} className="p-4 text-xs text-[#A8A29E]">
                        -
                      </td>
                    );
                  }

                  return (
                    <td key={col.profileId} className="p-4 align-top">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-3 py-1 rounded-xl bg-[#2D4A3E] text-white text-xs font-bold">
                            {rec.recommendedSize}
                          </span>
                          <span className="text-xs font-semibold text-[#2D4A3E] dark:text-[#52B788]">
                            {rec.fitScore}%
                          </span>
                        </div>

                        {rec.alternativeSize && (
                          <p className="text-[11px] text-[#A8A29E]">
                            Alt: {rec.alternativeSize}
                          </p>
                        )}

                        <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E] leading-relaxed line-clamp-1">
                          {rec.fitNote}
                        </p>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Privacy Guarantee Footer Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
              Zero-Biometric Privacy Guarantee
            </h4>
            <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
              Under AGENTS.md Invariant #7, your family&apos;s raw body measurements (mm/cm) never leave your device. Only calibrated brand sizing tags are shown and exported.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyCheatSheet}
          className="px-4 py-2 rounded-xl bg-[#F5F5F4] dark:bg-[#292524] hover:bg-[#E7E5E4] text-xs font-semibold text-[#1C1917] dark:text-[#F5F5F4] transition-colors shrink-0"
        >
          {copied ? "Copied!" : "Export Sizing Summary"}
        </button>
      </div>
    </div>
  );
}
