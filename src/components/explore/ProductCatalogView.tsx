"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PILOT_BRANDS, PILOT_PRODUCTS, PilotBrand } from "@/core/data/pilotBrands";
import { ShieldCheck, ArrowRight, Layers, ExternalLink, Check } from "lucide-react";

export function ProductCatalogView() {
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("all");

  const filteredProducts =
    selectedBrandFilter === "all"
      ? PILOT_PRODUCTS
      : PILOT_PRODUCTS.filter((p) => p.brandId === selectedBrandFilter);

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge bg-accent-subtle/80 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
          <Layers className="w-3.5 h-3.5" />
          Indian Pilot Brand Registry & Catalog
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
          Verified Pilot Brands & Garments
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

      {/* Pilot Brands Grid */}
      <div className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
          8 Pilot Brands Status Matrix (AGENTS.md Compliance)
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
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Verified Test Garments ({filteredProducts.length} items)
        </h2>

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
      </div>
    </div>
  );
}
