"use client";

import React, { useState } from "react";
import { Shirt, Scissors, Heart, Sparkles, ChevronRight, X } from "lucide-react";

export interface CategorySelection {
  mainCategory: "all" | "tops" | "bottoms" | "intimates" | "outerwear";
  subCategory: string; // e.g. "t_shirt", "polo", "jeans", "joggers", "bra", etc.
  label: string;
}

interface CategoryHierarchyNavigatorProps {
  activeSelection: CategorySelection;
  onSelectCategory: (selection: CategorySelection) => void;
  itemCounts?: Record<string, number>;
}

export const MAIN_CATEGORIES = [
  { id: "all", label: "All Items", icon: Sparkles },
  { id: "tops", label: "Tops & Shirts", icon: Shirt },
  { id: "bottoms", label: "Bottoms & Pants", icon: Scissors },
  { id: "intimates", label: "Intimates & Bras", icon: Heart },
  { id: "outerwear", label: "Outerwear & Layers", icon: Shirt },
] as const;

export const SUB_CATEGORIES: Record<string, Array<{ id: string; label: string; desc?: string }>> = {
  tops: [
    { id: "all_tops", label: "All Tops" },
    { id: "t_shirt", label: "T-Shirts (Crew & V-Neck)", desc: "Standard & oversized cuts" },
    { id: "polo", label: "Polo Shirts", desc: "Structured knit collars" },
    { id: "shirt_casual", label: "Casual Shirts", desc: "Linen, oxford, relaxed" },
    { id: "shirt_formal", label: "Formal Dress Shirts", desc: "Tailored collar & yoke" },
    { id: "kurta", label: "Kurtas & Tunics", desc: "Ethnic comfort drapes" },
  ],
  bottoms: [
    { id: "all_bottoms", label: "All Bottoms" },
    { id: "jeans", label: "Denims & Jeans", desc: "5-pocket classic & relaxed" },
    { id: "trousers_chinos", label: "Chinos & Trousers", desc: "Smart casual & formal" },
    { id: "joggers", label: "Joggers & Track Pants", desc: "Elastic waistband & cuffs" },
    { id: "shorts", label: "Shorts", desc: "Casual & athletic" },
  ],
  intimates: [
    { id: "all_intimates", label: "All Intimates" },
    { id: "bra", label: "Bras & Bralettes", desc: "Underbust band & cup sizing" },
    { id: "sports_bra", label: "Sports Bras", desc: "Compression & support" },
    { id: "undershirt", label: "Vests & Undershirts", desc: "Base layer ribs" },
    { id: "briefs", label: "Briefs & Boxers", desc: "Waistband comfort" },
  ],
  outerwear: [
    { id: "all_outerwear", label: "All Outerwear" },
    { id: "jacket", label: "Jackets & Shackets", desc: "Layered ease allowance" },
    { id: "blazer", label: "Blazers & Suits", desc: "Structured shoulder pads" },
    { id: "hoodie", label: "Hoodies & Sweats", desc: "Generous drape room" },
  ],
};

export function CategoryHierarchyNavigator({
  activeSelection,
  onSelectCategory,
  itemCounts = {},
}: CategoryHierarchyNavigatorProps) {
  const currentSubList =
    activeSelection.mainCategory !== "all"
      ? SUB_CATEGORIES[activeSelection.mainCategory] || []
      : [];

  return (
    <div className="space-y-3" role="region" aria-label="Hierarchical Apparel Category Filter">
      {/* Level 1: Primary Thumb-Friendly Category Tabs (Mobile-First) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {MAIN_CATEGORIES.map((main) => {
          const Icon = main.icon;
          const isActive = activeSelection.mainCategory === main.id;
          return (
            <button
              key={main.id}
              type="button"
              onClick={() => {
                if (main.id === "all") {
                  onSelectCategory({
                    mainCategory: "all",
                    subCategory: "all",
                    label: "All Items",
                  });
                } else {
                  const defaultSub = SUB_CATEGORIES[main.id][0];
                  onSelectCategory({
                    mainCategory: main.id,
                    subCategory: defaultSub.id,
                    label: defaultSub.label,
                  });
                }
              }}
              className={`min-h-[44px] px-4 rounded-btn text-xs font-semibold shrink-0 transition-all flex items-center gap-2 shadow-xs ${
                isActive
                  ? "bg-accent text-white ring-1 ring-accent"
                  : "bg-bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{main.label}</span>
            </button>
          );
        })}
      </div>

      {/* Level 2: Sub-Category Horizontal Scroll Chips */}
      {currentSubList.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-border/60">
          {currentSubList.map((sub) => {
            const isSubActive = activeSelection.subCategory === sub.id;
            const count = itemCounts[sub.id];
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  onSelectCategory({
                    mainCategory: activeSelection.mainCategory,
                    subCategory: sub.id,
                    label: sub.label,
                  });
                }}
                className={`min-h-[38px] px-3.5 rounded-badge text-xs font-medium shrink-0 transition-colors flex items-center gap-1.5 ${
                  isSubActive
                    ? "bg-text-primary text-bg-surface font-semibold"
                    : "bg-bg-elevated/70 text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
              >
                <span>{sub.label}</span>
                {typeof count === "number" && (
                  <span className="text-[10px] opacity-75">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Breadcrumb Indicator with Quick Reset */}
      {activeSelection.mainCategory !== "all" && (
        <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1 px-1">
          <div className="flex items-center gap-1">
            <span className="capitalize">{activeSelection.mainCategory}</span>
            <ChevronRight className="w-3 h-3 text-text-tertiary" />
            <span className="font-semibold text-text-primary">{activeSelection.label}</span>
          </div>

          <button
            type="button"
            onClick={() =>
              onSelectCategory({
                mainCategory: "all",
                subCategory: "all",
                label: "All Items",
              })
            }
            className="text-text-tertiary hover:text-text-primary inline-flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear Category
          </button>
        </div>
      )}
    </div>
  );
}
