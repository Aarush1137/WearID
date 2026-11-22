"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PILOT_PRODUCTS, PilotProduct } from "@/core/data/pilotBrands";
import { SHOE_BRANDS } from "@/core/data/shoeSizeMatrix";
import { useProfileStore } from "@/core/state/profileStore";
import { useOutfitStore, OutfitOccasion, ShoeSelection } from "@/core/state/outfitStore";
import { scoreOutfit, OutfitEvaluationResult } from "@/core/sizing/outfitScoring";
import {
  Sparkles,
  Shirt,
  Footprints,
  Plus,
  Trash2,
  Bookmark,
  Share2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  ChevronRight,
  X,
  ExternalLink,
  Layers,
  HeartHandshake,
} from "lucide-react";

const OCCASIONS: { id: OutfitOccasion; label: string }[] = [
  { id: "casual", label: "Casual Everyday" },
  { id: "streetwear", label: "Streetwear & Oversized" },
  { id: "smart_casual", label: "Smart Casual" },
  { id: "formal", label: "Formal & Tailored" },
  { id: "athleisure", label: "Athleisure" },
];

const CURATED_SHOES: ShoeSelection[] = [
  { brandId: "nike", brandName: "Nike", modelName: "Air Force 1 / Dunk Low" },
  { brandId: "adidas", brandName: "Adidas", modelName: "Stan Smith / Superstar" },
  { brandId: "puma", brandName: "Puma", modelName: "Suede Classic" },
  { brandId: "bata", brandName: "Bata", modelName: "Oxford Formal Derby" },
  { brandId: "clarks", brandName: "Clarks", modelName: "Originals Desert Boot" },
  { brandId: "woodland", brandName: "Woodland", modelName: "Pro Leather Sneaker" },
];

export function OutfitBuilderView() {
  const { getActiveProfile, profiles, setActiveProfileId } = useProfileStore();
  const activeProfile = getActiveProfile();

  const {
    currentDraft,
    savedOutfits,
    selectTop,
    selectBottom,
    selectShoes,
    setOccasion,
    saveCurrentOutfit,
    deleteSavedOutfit,
    resetDraft,
  } = useOutfitStore();

  const [activeTab, setActiveTab] = useState<"builder" | "saved">("builder");
  const [pickerModal, setPickerModal] = useState<"top" | "bottom" | "shoes" | null>(null);
  const [outfitName, setOutfitName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Compute live score evaluation
  const evaluation: OutfitEvaluationResult = useMemo(() => {
    return scoreOutfit({
      profile: activeProfile.measurements,
      topProduct: currentDraft.top,
      bottomProduct: currentDraft.bottom,
      shoesSelection: currentDraft.shoes,
    });
  }, [activeProfile.measurements, currentDraft.top, currentDraft.bottom, currentDraft.shoes]);

  // Available Tops in Catalog
  const topProducts = useMemo(() => {
    return PILOT_PRODUCTS.filter((p) =>
      ["t_shirt", "t_shirt_oversized", "polo", "shirt_casual", "shirt_formal", "kurta", "jacket"].includes(
        p.category
      )
    );
  }, []);

  // Available Bottoms in Catalog
  const bottomProducts = useMemo(() => {
    return PILOT_PRODUCTS.filter((p) =>
      ["jeans", "trousers_chinos", "joggers", "shorts"].includes(p.category)
    );
  }, []);

  const handleSaveOutfit = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = saveCurrentOutfit(
      outfitName.trim() || `${currentDraft.occasion.replace("_", " ")} Outfit`,
      activeProfile.id,
      evaluation
    );
    if (saved) {
      setSaveSuccess(true);
      setOutfitName("");
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleCopyCheatSheet = () => {
    const lines = [
      `WearID Outfit Sizing Card: ${activeProfile.name || "My Fit"}`,
      `Occasion: ${currentDraft.occasion.toUpperCase()}`,
      `Combined Match: ${evaluation.overallScore}% (${evaluation.confidenceLabel.toUpperCase()} confidence)`,
      evaluation.harmonyNote ? `Silhouette: ${evaluation.harmonyNote}` : "",
      "-------------------------",
      currentDraft.top && evaluation.top
        ? `• Top: ${currentDraft.top.brandName} - ${currentDraft.top.name}\n  Recommended: ${evaluation.top.recommendedSize} (${evaluation.top.fitScore}% match)`
        : "",
      currentDraft.bottom && evaluation.bottom
        ? `• Bottom: ${currentDraft.bottom.brandName} - ${currentDraft.bottom.name}\n  Recommended: ${evaluation.bottom.recommendedSize} (${evaluation.bottom.fitScore}% match)`
        : "",
      currentDraft.shoes && evaluation.shoes
        ? `• Shoes: ${currentDraft.shoes.brandName} - ${currentDraft.shoes.modelName}\n  Recommended: ${evaluation.shoes.recommendedSize} (${evaluation.shoes.fitScore}% match)`
        : "",
      "-------------------------",
      "Generated deterministically by WearID. Zero biometric data leaked.",
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E7E5E4] dark:border-[#292524] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D4A3E]/10 dark:bg-[#2D4A3E]/30 text-[#2D4A3E] dark:text-[#52B788] text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            Ensemble Sizing Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1917] dark:text-[#F5F5F4] tracking-tight">
            Outfit Builder
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#78716C] dark:text-[#A8A29E] max-w-2xl leading-relaxed">
            Combine Top, Bottom, and Footwear into an ensemble. WearID calculates unified fit scoring, protects against fit bottlenecks, and evaluates silhouette ease harmony.
          </p>
        </div>

        {/* Profile indicator */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] shadow-sm text-xs">
          <span className="text-[#A8A29E]">Fitting for:</span>
          <span className="font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
            {activeProfile.name || "Default User"} ({activeProfile.relation.toUpperCase()})
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#E7E5E4] dark:border-[#292524]">
        <div className="flex items-center gap-4 text-sm font-medium">
          <button
            onClick={() => setActiveTab("builder")}
            className={`pb-3 px-1 border-b-2 transition-all ${
              activeTab === "builder"
                ? "border-[#2D4A3E] text-[#2D4A3E] dark:text-[#52B788] font-bold"
                : "border-transparent text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917]"
            }`}
          >
            Outfit Studio
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "saved"
                ? "border-[#2D4A3E] text-[#2D4A3E] dark:text-[#52B788] font-bold"
                : "border-transparent text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917]"
            }`}
          >
            Saved Outfits
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-[#E7E5E4] dark:bg-[#292524]">
              {savedOutfits.length}
            </span>
          </button>
        </div>

        {activeTab === "builder" && (
          <button
            onClick={resetDraft}
            className="inline-flex items-center gap-1 text-xs text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] transition-colors pb-3"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Draft
          </button>
        )}
      </div>

      {activeTab === "builder" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: 3 Item Slots (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Occasion Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#78716C] dark:text-[#A8A29E] uppercase tracking-wider">
                Select Occasion
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ.id}
                    onClick={() => setOccasion(occ.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      currentDraft.occasion === occ.id
                        ? "bg-[#2D4A3E] text-white shadow-sm font-semibold"
                        : "bg-white dark:bg-[#1C1917] text-[#78716C] dark:text-[#A8A29E] border border-[#E7E5E4] dark:border-[#292524] hover:bg-[#F5F5F4]"
                    }`}
                  >
                    {occ.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slot 1: TOP */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    <Shirt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                      1. Top (T-Shirt, Shirt, Kurta)
                    </h3>
                    <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                      Weighted 35% towards overall fit
                    </p>
                  </div>
                </div>

                {currentDraft.top && (
                  <button
                    onClick={() => selectTop(null)}
                    className="p-1.5 text-[#A8A29E] hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {currentDraft.top ? (
                <div className="p-4 rounded-xl bg-[#FBF9F5] dark:bg-[#121110] border border-[#E7E5E4] dark:border-[#292524] space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider">
                        {currentDraft.top.brandName}
                      </span>
                      <h4 className="text-base font-serif font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                        {currentDraft.top.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#E7E5E4] dark:bg-[#292524] text-[#1C1917] dark:text-[#F5F5F4]">
                          Silhouette: {currentDraft.top.fitSilhouette.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {evaluation.top && (
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-xl bg-[#2D4A3E] text-white text-xs font-bold">
                          Size {evaluation.top.recommendedSize}
                        </span>
                        <p className="text-xs font-semibold text-[#2D4A3E] dark:text-[#52B788] mt-1">
                          {evaluation.top.fitScore}% Fit Match
                        </p>
                      </div>
                    )}
                  </div>

                  {evaluation.top?.fitNote && (
                    <p className="text-xs text-[#78716C] dark:text-[#A8A29E] leading-relaxed border-t border-[#E7E5E4] dark:border-[#292524] pt-2">
                      {evaluation.top.fitNote}
                    </p>
                  )}

                  <button
                    onClick={() => setPickerModal("top")}
                    className="text-xs font-semibold text-[#2D4A3E] dark:text-[#52B788] hover:underline"
                  >
                    Switch Top →
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPickerModal("top")}
                  className="w-full py-6 rounded-xl border border-dashed border-[#E7E5E4] dark:border-[#292524] hover:border-[#2D4A3E] dark:hover:border-[#52B788] transition-colors flex flex-col items-center justify-center gap-2 text-xs font-medium text-[#78716C] dark:text-[#A8A29E] group"
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform text-[#2D4A3E] dark:text-[#52B788]" />
                  <span>Choose Top from Catalog</span>
                </button>
              )}
            </div>

            {/* Slot 2: BOTTOM */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                      2. Bottom (Jeans, Chinos, Trousers)
                    </h3>
                    <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                      Weighted 35% towards overall fit
                    </p>
                  </div>
                </div>

                {currentDraft.bottom && (
                  <button
                    onClick={() => selectBottom(null)}
                    className="p-1.5 text-[#A8A29E] hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {currentDraft.bottom ? (
                <div className="p-4 rounded-xl bg-[#FBF9F5] dark:bg-[#121110] border border-[#E7E5E4] dark:border-[#292524] space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider">
                        {currentDraft.bottom.brandName}
                      </span>
                      <h4 className="text-base font-serif font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                        {currentDraft.bottom.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#E7E5E4] dark:bg-[#292524] text-[#1C1917] dark:text-[#F5F5F4]">
                          Silhouette: {currentDraft.bottom.fitSilhouette.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {evaluation.bottom && (
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-xl bg-[#2D4A3E] text-white text-xs font-bold">
                          Size {evaluation.bottom.recommendedSize}
                        </span>
                        <p className="text-xs font-semibold text-[#2D4A3E] dark:text-[#52B788] mt-1">
                          {evaluation.bottom.fitScore}% Fit Match
                        </p>
                      </div>
                    )}
                  </div>

                  {evaluation.bottom?.fitNote && (
                    <p className="text-xs text-[#78716C] dark:text-[#A8A29E] leading-relaxed border-t border-[#E7E5E4] dark:border-[#292524] pt-2">
                      {evaluation.bottom.fitNote}
                    </p>
                  )}

                  <button
                    onClick={() => setPickerModal("bottom")}
                    className="text-xs font-semibold text-[#2D4A3E] dark:text-[#52B788] hover:underline"
                  >
                    Switch Bottom →
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPickerModal("bottom")}
                  className="w-full py-6 rounded-xl border border-dashed border-[#E7E5E4] dark:border-[#292524] hover:border-[#2D4A3E] dark:hover:border-[#52B788] transition-colors flex flex-col items-center justify-center gap-2 text-xs font-medium text-[#78716C] dark:text-[#A8A29E] group"
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform text-[#2D4A3E] dark:text-[#52B788]" />
                  <span>Choose Bottom from Catalog</span>
                </button>
              )}
            </div>

            {/* Slot 3: FOOTWEAR */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <Footprints className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                      3. Footwear (Sneakers, Shoes, Boots)
                    </h3>
                    <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                      Weighted 30% via canonical footbed mm
                    </p>
                  </div>
                </div>

                {currentDraft.shoes && (
                  <button
                    onClick={() => selectShoes(null)}
                    className="p-1.5 text-[#A8A29E] hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {currentDraft.shoes ? (
                <div className="p-4 rounded-xl bg-[#FBF9F5] dark:bg-[#121110] border border-[#E7E5E4] dark:border-[#292524] space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider">
                        {currentDraft.shoes.brandName}
                      </span>
                      <h4 className="text-base font-serif font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                        {currentDraft.shoes.modelName}
                      </h4>
                    </div>

                    {evaluation.shoes && (
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-xl bg-[#2D4A3E] text-white text-xs font-bold">
                          {evaluation.shoes.recommendedSize}
                        </span>
                        <p className="text-xs font-semibold text-[#2D4A3E] dark:text-[#52B788] mt-1">
                          {evaluation.shoes.fitScore}% Match
                        </p>
                      </div>
                    )}
                  </div>

                  {evaluation.shoes?.fitNote && (
                    <p className="text-xs text-[#78716C] dark:text-[#A8A29E] leading-relaxed border-t border-[#E7E5E4] dark:border-[#292524] pt-2">
                      {evaluation.shoes.fitNote}
                    </p>
                  )}

                  <button
                    onClick={() => setPickerModal("shoes")}
                    className="text-xs font-semibold text-[#2D4A3E] dark:text-[#52B788] hover:underline"
                  >
                    Switch Shoes →
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPickerModal("shoes")}
                  className="w-full py-6 rounded-xl border border-dashed border-[#E7E5E4] dark:border-[#292524] hover:border-[#2D4A3E] dark:hover:border-[#52B788] transition-colors flex flex-col items-center justify-center gap-2 text-xs font-medium text-[#78716C] dark:text-[#A8A29E] group"
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform text-[#2D4A3E] dark:text-[#52B788]" />
                  <span>Choose Shoes from Matrix</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Composite Score & Harmony Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Main Combined Score Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] shadow-md space-y-6">
              <div className="text-center space-y-2">
                <span className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider">
                  Composite Outfit Fit Score
                </span>

                {/* Score Number Gauge */}
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-serif font-extrabold text-[#2D4A3E] dark:text-[#52B788]">
                    {evaluation.overallScore}
                  </span>
                  <span className="text-2xl font-semibold text-[#78716C] dark:text-[#A8A29E]">%</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2D4A3E]/10 dark:bg-[#2D4A3E]/30 text-[#2D4A3E] dark:text-[#52B788]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {evaluation.confidenceLabel.toUpperCase()} CONFIDENCE
                </div>
              </div>

              {/* Bottleneck Warning Callout */}
              {evaluation.isBottleneckTriggered && evaluation.bottleneckReason && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <p className="leading-relaxed">{evaluation.bottleneckReason}</p>
                </div>
              )}

              {/* Silhouette Ease Harmony Card */}
              <div className="p-4 rounded-xl bg-[#FBF9F5] dark:bg-[#121110] border border-[#E7E5E4] dark:border-[#292524] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1C1917] dark:text-[#F5F5F4] flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-[#2D4A3E] dark:text-[#52B788]" />
                    Silhouette Ease Harmony
                  </span>
                  {evaluation.harmonyAdjustment !== 0 && (
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        evaluation.harmonyAdjustment > 0
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                      }`}
                    >
                      {evaluation.harmonyAdjustment > 0 ? `+${evaluation.harmonyAdjustment}` : evaluation.harmonyAdjustment} pts
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E] leading-relaxed">
                  {evaluation.harmonyNote}
                </p>
              </div>

              {/* Save Form & Sharing */}
              <div className="space-y-3 pt-2 border-t border-[#F5F5F4] dark:border-[#292524]">
                <form onSubmit={handleSaveOutfit} className="space-y-3">
                  <input
                    type="text"
                    value={outfitName}
                    onChange={(e) => setOutfitName(e.target.value)}
                    placeholder="Name this outfit (e.g. Sunday Brunch Ensemble)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] dark:border-[#292524] bg-white dark:bg-[#121110] text-xs text-[#1C1917] dark:text-[#F5F5F4] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]/40"
                  />

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={evaluation.overallScore === 0}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D4A3E] hover:bg-[#243B32] disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-sm active:scale-95"
                    >
                      <Bookmark className="w-4 h-4" />
                      {saveSuccess ? "Saved to Outfits!" : "Save Outfit"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyCheatSheet}
                      disabled={evaluation.overallScore === 0}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E7E5E4] dark:border-[#292524] bg-white dark:bg-[#1C1917] hover:bg-[#F5F5F4] text-xs font-semibold text-[#1C1917] dark:text-[#F5F5F4] transition-colors"
                      title="Copy Sizing Cheat Sheet (Zero Biometric Leakage)"
                    >
                      <Share2 className="w-4 h-4 text-[#78716C]" />
                      {copyFeedback ? "Copied!" : "Share"}
                    </button>
                  </div>
                </form>

                <p className="text-[11px] text-[#A8A29E] text-center">
                  Zero biometric measurements leaked. Safe to share with friends or personal shoppers.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Saved Outfits List */
        <div className="space-y-4">
          {savedOutfits.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-[#E7E5E4] dark:border-[#292524] bg-white/40 dark:bg-[#1C1917]/40 space-y-3">
              <Bookmark className="w-8 h-8 text-[#A8A29E] mx-auto" />
              <h3 className="text-base font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                No outfits saved yet
              </h3>
              <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                Combine your favorite garments in the studio and save them for instant size recall!
              </p>
              <button
                onClick={() => setActiveTab("builder")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2D4A3E] text-white text-xs font-medium"
              >
                Go to Outfit Studio →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {savedOutfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E] px-2 py-0.5 rounded bg-[#F5F5F4] dark:bg-[#292524]">
                        {outfit.occasion.replace("_", " ")}
                      </span>
                      <h3 className="text-lg font-serif font-bold text-[#1C1917] dark:text-[#F5F5F4] mt-1">
                        {outfit.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold font-serif text-[#2D4A3E] dark:text-[#52B788]">
                        {outfit.combinedFitScore}%
                      </span>
                      <button
                        onClick={() => deleteSavedOutfit(outfit.id)}
                        className="text-[#A8A29E] hover:text-red-500 transition-colors p-1"
                        title="Delete outfit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {outfit.top && (
                      <div className="flex justify-between py-1 border-b border-[#F5F5F4] dark:border-[#292524]">
                        <span className="text-[#78716C] dark:text-[#A8A29E]">
                          Top: {outfit.top.brandName} {outfit.top.productName}
                        </span>
                        <span className="font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                          {outfit.top.recommendedSize}
                        </span>
                      </div>
                    )}
                    {outfit.bottom && (
                      <div className="flex justify-between py-1 border-b border-[#F5F5F4] dark:border-[#292524]">
                        <span className="text-[#78716C] dark:text-[#A8A29E]">
                          Bottom: {outfit.bottom.brandName} {outfit.bottom.productName}
                        </span>
                        <span className="font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                          {outfit.bottom.recommendedSize}
                        </span>
                      </div>
                    )}
                    {outfit.shoes && (
                      <div className="flex justify-between py-1">
                        <span className="text-[#78716C] dark:text-[#A8A29E]">
                          Shoes: {outfit.shoes.brandName} {outfit.shoes.productName}
                        </span>
                        <span className="font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                          {outfit.shoes.recommendedSize}
                        </span>
                      </div>
                    )}
                  </div>

                  {outfit.harmonyNote && (
                    <p className="text-[11px] text-[#A8A29E] italic border-t border-[#F5F5F4] dark:border-[#292524] pt-2">
                      {outfit.harmonyNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Item Picker Modal */}
      {pickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] shadow-2xl flex flex-col">
            <div className="p-5 border-b border-[#E7E5E4] dark:border-[#292524] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                  {pickerModal === "top"
                    ? "Select Top Garment"
                    : pickerModal === "bottom"
                    ? "Select Bottom Garment"
                    : "Select Footwear"}
                </h3>
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                  Choose an item to evaluate sizing for {activeProfile.name || "Default"}
                </p>
              </div>
              <button
                onClick={() => setPickerModal(null)}
                className="p-1 rounded-lg text-[#A8A29E] hover:text-[#1C1917]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {pickerModal === "top" &&
                topProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      selectTop(prod);
                      setPickerModal(null);
                    }}
                    className="p-4 rounded-xl border border-[#E7E5E4] dark:border-[#292524] hover:border-[#2D4A3E] dark:hover:border-[#52B788] bg-white dark:bg-[#121110] cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-[#A8A29E] uppercase">
                        {prod.brandName}
                      </span>
                      <h4 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4] group-hover:text-[#2D4A3E] dark:group-hover:text-[#52B788]">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                        Silhouette: {prod.fitSilhouette} · ₹{prod.priceInr}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#A8A29E] group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}

              {pickerModal === "bottom" &&
                bottomProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      selectBottom(prod);
                      setPickerModal(null);
                    }}
                    className="p-4 rounded-xl border border-[#E7E5E4] dark:border-[#292524] hover:border-[#2D4A3E] dark:hover:border-[#52B788] bg-white dark:bg-[#121110] cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-[#A8A29E] uppercase">
                        {prod.brandName}
                      </span>
                      <h4 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4] group-hover:text-[#2D4A3E] dark:group-hover:text-[#52B788]">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                        Silhouette: {prod.fitSilhouette} · ₹{prod.priceInr}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#A8A29E] group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}

              {pickerModal === "shoes" &&
                CURATED_SHOES.map((shoe) => (
                  <div
                    key={`${shoe.brandId}_${shoe.modelName}`}
                    onClick={() => {
                      selectShoes(shoe);
                      setPickerModal(null);
                    }}
                    className="p-4 rounded-xl border border-[#E7E5E4] dark:border-[#292524] hover:border-[#2D4A3E] dark:hover:border-[#52B788] bg-white dark:bg-[#121110] cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-[#A8A29E] uppercase">
                        {shoe.brandName}
                      </span>
                      <h4 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4] group-hover:text-[#2D4A3E] dark:group-hover:text-[#52B788]">
                        {shoe.modelName}
                      </h4>
                      <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                        Calibrated against {shoe.brandName} Footbed Matrix
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#A8A29E] group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
