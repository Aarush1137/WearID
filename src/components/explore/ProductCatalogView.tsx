"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PILOT_BRANDS, PILOT_PRODUCTS, PilotBrand } from "@/core/data/pilotBrands";
import { ShieldCheck, ArrowRight, Layers, ExternalLink, Check, Search, X } from "lucide-react";
import { CategoryHierarchyNavigator, CategorySelection } from "@/components/catalog/CategoryHierarchyNavigator";

export function ProductCatalogView() {
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("all");
  const [categorySelection, setCategorySelection] = useState<CategorySelection>({
    mainCategory: "all",
    subCategory: "all",
    label: "All Items",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredProducts = useMemo(() => {
    return PILOT_PRODUCTS.filter((p) => {
      // Brand filter
      if (selectedBrandFilter !== "all" && p.brandId !== selectedBrandFilter) {
        return false;
      }
      // Hierarchical Category filter
      if (categorySelection.mainCategory !== "all") {
        if (categorySelection.subCategory !== "all" && !categorySelection.subCategory.startsWith("all_")) {
          // Exact sub-category match
          if (p.category !== categorySelection.subCategory) {
            return false;
          }
        } else {
          // Broad main category matching
          if (categorySelection.mainCategory === "tops" && !p.category.includes("shirt") && !p.category.includes("top") && !p.category.includes("polo") && !p.category.includes("kurta")) {
            return false;
          }
          if (categorySelection.mainCategory === "bottoms" && !p.category.includes("jeans") && !p.category.includes("trouser") && !p.category.includes("chino") && !p.category.includes("jogger") && !p.category.includes("short")) {
            return false;
          }
          if (categorySelection.mainCategory === "intimates" && !p.category.includes("bra") && !p.category.includes("under") && !p.category.includes("brief")) {
            return false;
          }
          if (categorySelection.mainCategory === "outerwear" && !p.category.includes("jacket") && !p.category.includes("blazer") && !p.category.includes("hoodie")) {
            return false;
          }
        }
      }
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brandName.toLowerCase().includes(q);
        const matchFabric = p.fabric.materialComposition.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchFabric) {
          return false;
        }
      }
      return true;
    });
  }, [selectedBrandFilter, categorySelection, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge bg-accent-subtle/80 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
          <Layers className="w-3.5 h-3.5" />
          Verified Brand Registry & Catalog
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
          Verified Brand Catalog & Apparel
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-2xl leading-relaxed">
          Real brand sizing data ingested under strict provenance protocols. Layer 3 flat finished measurements preferred over Layer 2 body ranges.
        </p>

        {/* Brand Filter Pills */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setSelectedBrandFilter("all")}
            className={`min-h-[44px] px-3.5 rounded-btn text-xs font-medium shrink-0 transition-colors ${
              selectedBrandFilter === "all"
                ? "bg-accent text-white font-semibold shadow-xs"
                : "bg-bg-surface border border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            All Brands ({PILOT_PRODUCTS.length})
          </button>
          {PILOT_BRANDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBrandFilter(b.id)}
              className={`min-h-[44px] px-3.5 rounded-btn text-xs font-medium shrink-0 transition-colors ${
                selectedBrandFilter === b.id
                  ? "bg-accent text-white font-semibold shadow-xs"
                  : "bg-bg-surface border border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Verified Brands Grid */}
      <div className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
          Verified Partner Brand Directory (AGENTS.md Compliance)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PILOT_BRANDS.map((brand: PilotBrand) => (
            <div
              key={brand.id}
              className="p-4 rounded-card border border-border bg-bg-surface flex flex-col justify-between shadow-xs hover:border-accent/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-text-primary">
                    {brand.name}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-badge uppercase">
                    Verified
                  </span>
                </div>
                <span className="text-[11px] text-text-secondary block">
                  {brand.parentGroup} · {brand.domain}
                </span>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  {brand.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                <span className="text-accent font-medium">
                  {brand.layerSupport[0]}
                </span>
                <a
                  href={brand.officialStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Garment Products Catalog Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Curated Garment Collection ({filteredProducts.length} items)
          </h2>

          {/* Instant Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garments, brand, fabric..."
              className="input-editorial w-full pl-9 pr-8 text-xs"
              aria-label="Search garments catalog"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Multi-Level Hierarchical Category Navigator */}
        <div className="mb-6">
          <CategoryHierarchyNavigator
            activeSelection={categorySelection}
            onSelectCategory={setCategorySelection}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center rounded-card border border-dashed border-border bg-bg-surface">
            <Layers className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
            <h3 className="font-semibold text-sm text-text-primary">No garments match your filters</h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the brand/category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedBrandFilter("all");
                setCategorySelection({
                  mainCategory: "all",
                  subCategory: "all",
                  label: "All Items",
                });
              }}
              className="btn-secondary min-h-[40px] text-xs font-semibold mt-4"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="rounded-card border border-border bg-bg-surface p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-badge bg-accent-subtle text-accent text-xs font-semibold">
                    {prod.brandName}
                  </span>
                  <span className="text-xs font-semibold text-text-primary">
                    ₹{prod.priceInr}
                  </span>
                </div>

                <h3 className="font-semibold text-base text-text-primary mt-1">
                  {prod.name}
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {prod.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-badge bg-bg-elevated text-text-secondary">
                    {prod.fabric.materialComposition}
                  </span>
                  <span className="px-2 py-0.5 rounded-badge bg-bg-elevated text-text-secondary capitalize">
                    {prod.fitSilhouette} Silhouette
                  </span>
                  {prod.layer3Specs && (
                    <span className="px-2 py-0.5 rounded-badge bg-emerald-50 text-emerald-800 font-medium">
                      Layer 3 Flat Specs
                    </span>
                  )}
                </div>

                {/* Available Verified Size Tiers */}
                <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">Sizes:</span>
                  {(prod.layer3Specs?.map((s) => s.sizeLabel) || prod.layer2Charts?.map((c) => c.sizeLabel) || []).map((sz) => (
                    <span key={sz} className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-bg-elevated border border-border text-text-secondary">
                      {sz}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                  <span>Provenance Audited</span>
                </div>

                <Link
                  href={`/app/recommend?productId=${prod.id}`}
                  className="min-h-[44px] px-4 rounded-btn bg-accent text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-accent-hover transition-colors shadow-xs"
                >
                  Match My Fit
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
