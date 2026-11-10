"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { PILOT_BRANDS, PILOT_PRODUCTS, PilotBrand } from "@/core/data/pilotBrands";
import {
  ShieldCheck,
  ArrowRight,
  Layers,
  ExternalLink,
  Check,
  Search,
  X,
  Sparkles,
  UserCheck,
  Scale,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";
import { CategoryHierarchyNavigator, CategorySelection } from "@/components/catalog/CategoryHierarchyNavigator";
import { useProfileStore } from "@/core/state/profileStore";

export function ProductCatalogView() {
  const { getActiveProfile } = useProfileStore();
  const activeProfile = getActiveProfile();
  const profileGender = activeProfile?.gender || "unisex";

  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<"all" | "female" | "male" | "unisex">(
    profileGender === "female" ? "female" : profileGender === "male" ? "male" : "all"
  );
  const [categorySelection, setCategorySelection] = useState<CategorySelection>({
    mainCategory: "all",
    subCategory: "all",
    label: "All Items",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const brandScrollRef = useRef<HTMLDivElement>(null);

  // Pre-calculate count of garments available per brand
  const brandProductCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PILOT_PRODUCTS.forEach((p) => {
      counts[p.brandId] = (counts[p.brandId] || 0) + 1;
    });
    return counts;
  }, []);

  // Sorted brands: Brands with products listed first
  const sortedBrands = useMemo(() => {
    return [...PILOT_BRANDS].sort((a, b) => {
      const countA = brandProductCounts[a.id] || 0;
      const countB = brandProductCounts[b.id] || 0;
      if (countB !== countA) return countB - countA;
      return a.name.localeCompare(b.name);
    });
  }, [brandProductCounts]);

  const activeBrand = useMemo(() => {
    if (selectedBrandFilter === "all") return null;
    return PILOT_BRANDS.find((b) => b.id === selectedBrandFilter) || null;
  }, [selectedBrandFilter]);

  const handleSelectBrand = (brandId: string) => {
    setSelectedBrandFilter(brandId);

    // If a specific brand is selected, automatically ensure gender or category filters do not hide all its items
    if (brandId !== "all") {
      const brandProducts = PILOT_PRODUCTS.filter((p) => p.brandId === brandId);
      if (brandProducts.length > 0) {
        // Check if current gender filter excludes every product for this brand
        if (genderFilter !== "all") {
          const hasMatchingGender = brandProducts.some((p) => {
            const itemGender = p.layer2Charts?.[0]?.gender || "unisex";
            if (genderFilter === "female") return itemGender !== "male";
            if (genderFilter === "male") return itemGender !== "female";
            return true;
          });
          if (!hasMatchingGender) {
            setGenderFilter("all");
          }
        }

        // Check if current category filter excludes every product for this brand
        if (categorySelection.mainCategory !== "all") {
          setCategorySelection({
            mainCategory: "all",
            subCategory: "all",
            label: "All Items",
          });
        }
      }
    }

    setTimeout(() => {
      const el = document.getElementById("catalog-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  const scrollBrands = (direction: "left" | "right") => {
    if (brandScrollRef.current) {
      brandScrollRef.current.scrollBy({
        left: direction === "left" ? -260 : 260,
        behavior: "smooth",
      });
    }
  };

  const filteredProducts = useMemo(() => {
    return PILOT_PRODUCTS.filter((p) => {
      // Gender filter
      if (genderFilter !== "all") {
        const itemGender = p.layer2Charts?.[0]?.gender || "unisex";
        if (genderFilter === "female" && itemGender === "male") {
          return false;
        }
        if (genderFilter === "male" && itemGender === "female") {
          return false;
        }
      }

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
          if (
            categorySelection.mainCategory === "tops" &&
            !p.category.includes("shirt") &&
            !p.category.includes("top") &&
            !p.category.includes("polo") &&
            p.category !== "kurta"
          ) {
            return false;
          }
          if (
            categorySelection.mainCategory === "bottoms" &&
            !p.category.includes("jeans") &&
            !p.category.includes("trouser") &&
            !p.category.includes("chino") &&
            !p.category.includes("jogger") &&
            !p.category.includes("short")
          ) {
            return false;
          }
          if (
            categorySelection.mainCategory === "dresses" &&
            p.category !== "dress" &&
            p.category !== "kurta"
          ) {
            return false;
          }
          if (
            categorySelection.mainCategory === "intimates" &&
            !p.category.includes("bra") &&
            !p.category.includes("under") &&
            !p.category.includes("brief") &&
            p.category !== "lingerie"
          ) {
            return false;
          }
          if (
            categorySelection.mainCategory === "shoes" &&
            p.category !== "shoes" &&
            p.category !== "footwear"
          ) {
            return false;
          }
          if (
            categorySelection.mainCategory === "jewelry" &&
            p.category !== "ring" &&
            p.category !== "bracelet"
          ) {
            return false;
          }
          if (
            categorySelection.mainCategory === "outerwear" &&
            !p.category.includes("jacket") &&
            !p.category.includes("blazer") &&
            !p.category.includes("hoodie")
          ) {
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
  }, [genderFilter, selectedBrandFilter, categorySelection, searchQuery]);

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

        {/* Brand Filter Carousel with Navigation & Item Counts */}
        <div className="relative mt-6 group">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollBrands("left")}
            aria-label="Scroll brands left"
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-bg-surface border border-border shadow-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all opacity-80 group-hover:opacity-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={brandScrollRef}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1"
          >
            <button
              type="button"
              onClick={() => handleSelectBrand("all")}
              className={`min-h-[42px] px-3.5 rounded-btn text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 ${
                selectedBrandFilter === "all"
                  ? "bg-accent text-white font-semibold shadow-xs ring-2 ring-accent/30"
                  : "bg-bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              <span>All Brands</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                  selectedBrandFilter === "all"
                    ? "bg-white/20 text-white"
                    : "bg-bg-elevated text-text-tertiary"
                }`}
              >
                {PILOT_PRODUCTS.length}
              </span>
            </button>

            {sortedBrands.map((b) => {
              const count = brandProductCounts[b.id] || 0;
              const isSelected = selectedBrandFilter === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBrand(b.id)}
                  className={`min-h-[42px] px-3.5 rounded-btn text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-accent text-white font-semibold shadow-xs ring-2 ring-accent/30"
                      : "bg-bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 hover:bg-bg-elevated"
                  }`}
                >
                  <span>{b.name}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-bg-elevated text-text-tertiary"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollBrands("right")}
            aria-label="Scroll brands right"
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-bg-surface border border-border shadow-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all opacity-80 group-hover:opacity-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Brand Spotlight OR Full Partner Directory */}
      {activeBrand ? (
        <div className="p-5 rounded-card border-2 border-accent bg-accent/5 mb-10 shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-badge bg-accent text-white uppercase tracking-wider">
                  Active Brand Filter
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-badge uppercase inline-flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 inline" />
                  Verified Provenance
                </span>
                <span className="text-[10px] text-text-tertiary">
                  {activeBrand.layerSupport[0]}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                {activeBrand.name}
              </h2>
              <p className="text-xs text-text-secondary mt-1.5 max-w-2xl leading-relaxed">
                {activeBrand.description}
              </p>
              <div className="flex items-center gap-3 mt-2.5 text-xs text-text-tertiary flex-wrap">
                <span>Group: {activeBrand.parentGroup}</span>
                <span>•</span>
                <a
                  href={activeBrand.officialStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline inline-flex items-center gap-1 font-medium"
                >
                  Visit Official Store <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <span className="text-xs font-semibold text-text-primary">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
              </span>
              <button
                type="button"
                onClick={() => setSelectedBrandFilter("all")}
                className="btn-secondary min-h-[38px] px-3.5 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-bg-elevated"
              >
                <X className="w-3.5 h-3.5 text-text-tertiary" />
                Clear Filter (View All Brands)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-accent" />
              Verified Partner Brand Directory ({PILOT_BRANDS.length} Brands)
            </h2>
            <span className="text-[11px] text-text-tertiary hidden sm:inline">
              Click any card below to filter collection
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {sortedBrands.map((brand: PilotBrand) => {
              const count = brandProductCounts[brand.id] || 0;
              return (
                <div
                  key={brand.id}
                  onClick={() => handleSelectBrand(brand.id)}
                  className="p-4 rounded-card border border-border bg-bg-surface flex flex-col justify-between shadow-xs hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm text-text-primary group-hover:text-accent transition-colors">
                        {brand.name}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-badge uppercase">
                        Verified
                      </span>
                    </div>
                    <span className="text-[11px] text-text-secondary block">
                      {brand.parentGroup} · {brand.domain}
                    </span>
                    <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                      {brand.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                    <span className="text-accent font-semibold inline-flex items-center gap-1 group-hover:underline">
                      {count > 0 ? `View ${count} items` : "Size chart"}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <a
                      href={brand.officialStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1"
                      title="Visit official store"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Verified Garment Products Catalog Grid */}
      <div id="catalog-section" className="scroll-mt-6">
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

        {/* Gender / Anatomical Cut Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mr-1">
            Wardrobe Cut:
          </span>
          {[
            {
              id: "all",
              label: "All Collections",
            },
            {
              id: "female",
              label: "Women's, Intimates & Dresses",
              badge: profileGender === "female" ? `Profile: ${activeProfile.name || "You"}` : undefined,
            },
            {
              id: "male",
              label: "Men's Collection",
              badge: profileGender === "male" ? `Profile: ${activeProfile.name || "You"}` : undefined,
            },
            {
              id: "unisex",
              label: "Unisex, Shoes & Jewelry",
            },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setGenderFilter(pill.id as any)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                genderFilter === pill.id
                  ? "bg-text-primary text-bg-surface font-semibold shadow-xs"
                  : "bg-bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              <span>{pill.label}</span>
              {pill.badge && (
                <span className="text-[10px] bg-accent/20 text-accent font-semibold px-1.5 py-0.5 rounded-full">
                  {pill.badge}
                </span>
              )}
            </button>
          ))}
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

                <div className="flex items-center gap-2">
                  <Link
                    href={`/app/compare?prodA=${prod.id}`}
                    title={`Compare ${prod.name} with other brands`}
                    className="min-h-[44px] px-2.5 rounded-btn border border-border bg-bg-surface hover:bg-bg-elevated text-text-secondary hover:text-text-primary text-xs inline-flex items-center justify-center transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/app/recommend?productId=${prod.id}`}
                    className="min-h-[44px] px-3.5 rounded-btn bg-accent text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-accent-hover transition-colors shadow-xs"
                  >
                    Match My Fit
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
