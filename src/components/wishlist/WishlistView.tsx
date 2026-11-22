"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProfileStore, WishlistItem } from "@/core/state/profileStore";
import { PILOT_PRODUCTS } from "@/core/data/pilotBrands";
import { evaluateSizeRecommendation } from "@/core/sizing/recommendationEngine";

export interface WishlistViewProps {
  className?: string;
}

export function WishlistView({ className = "" }: WishlistViewProps) {
  const { getActiveProfile, addToWishlist, removeFromWishlist } = useProfileStore();
  const activeProfile = getActiveProfile();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const wishlist = activeProfile.wishlist || [];

  const filteredItems =
    selectedCategory === "all"
      ? wishlist
      : wishlist.filter((item) => item.category === selectedCategory);

  const categories = Array.from(new Set(wishlist.map((item) => item.category)));

  const handleAddSampleItems = () => {
    // Add 2-3 verified items from PILOT_PRODUCTS with real deterministic evaluation
    const sampleProducts = PILOT_PRODUCTS.slice(0, 3);
    for (const prod of sampleProducts) {
      const rec = evaluateSizeRecommendation({
        profile: activeProfile.measurements,
        fitPreference: {
          profileId: activeProfile.id,
          category: prod.category,
          fitType: (activeProfile.preferences?.[prod.category] as any) || "regular",
        },
        garmentDimensions: prod.layer3Specs,
        brandSizeCharts: prod.layer2Charts,
        fabricSpec: prod.fabric,
      });

      addToWishlist(activeProfile.id, {
        productId: prod.id,
        brandId: prod.brandId,
        brandName: prod.brandName,
        productName: prod.name,
        category: prod.category,
        priceInr: prod.priceInr,
        imageUrl: prod.imageUrl,
        savedSize: rec.recommendedSize,
        fitScore: rec.fitScore,
        confidenceLabel: rec.confidenceLabel,
        fitSilhouette: prod.fitSilhouette,
        notes: rec.summaryText,
      });
    }
  };

  return (
    <div data-testid="wishlist-view" className={`space-y-6 ${className}`}>
      {/* Top Controls & Category Filters */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] dark:text-neutral-100">
            Saved Garments & Wishlist
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Deterministic sizing tags saved for {activeProfile.name || "Primary Profile"} (
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"})
          </p>
        </div>

        {wishlist.length > 0 && categories.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-[#1B2A4A] text-white dark:bg-blue-600"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              All ({wishlist.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-[#1B2A4A] text-white dark:bg-blue-600"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Wishlist Grid or Empty State */}
      {filteredItems.length === 0 ? (
        <div
          data-testid="wishlist-empty-state"
          className="rounded-2xl border border-dashed border-[#D1C7BD] bg-[#FAF8F5] p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/50 sm:p-12"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E5E0D8] text-2xl text-[#1B2A4A] dark:bg-neutral-800 dark:text-neutral-300">
            🔖
          </div>
          <h3 className="font-serif text-lg font-semibold text-[#1B2A4A] dark:text-neutral-200">
            Your Wishlist is Empty
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs text-neutral-600 dark:text-neutral-400">
            Bookmark items from our verified brand catalog to maintain instant deterministic size tags
            and ease summaries across shopping sessions.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleAddSampleItems}
              data-testid="add-sample-wishlist-btn"
              className="rounded-xl bg-[#1B2A4A] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#253966] dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              + Populate Sample Verified Garments
            </button>
            <Link
              href="/app/recommendations"
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div
          data-testid="wishlist-grid"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredItems.map((item) => {
            const fitScorePct = Math.round(item.fitScore * 100);
            return (
              <div
                key={item.id}
                data-testid={`wishlist-card-${item.productId}`}
                className="flex flex-col justify-between rounded-xl border border-[#E5E0D8] bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div>
                  {/* Top Bar: Brand & Remove button */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        {item.brandName}
                      </span>
                      <h4 className="mt-0.5 font-serif text-base font-semibold text-[#1B2A4A] dark:text-neutral-100">
                        {item.productName}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(activeProfile.id, item.id)}
                      data-testid={`remove-wishlist-${item.id}`}
                      className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
                      title="Remove from wishlist"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Price */}
                  <div className="mt-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    ₹{item.priceInr.toLocaleString("en-IN")}
                  </div>

                  {/* Instant Sizing Tag Badge */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      data-testid={`size-tag-${item.productId}`}
                      className="inline-flex items-center rounded-lg border border-[#1B2A4A] bg-[#1B2A4A] px-2.5 py-1 text-xs font-bold text-white shadow-sm dark:border-blue-500 dark:bg-blue-600"
                    >
                      Your Size: {item.savedSize} ({fitScorePct}% Fit)
                    </span>

                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        item.confidenceLabel === "high"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}
                    >
                      {item.confidenceLabel.toUpperCase()}
                    </span>

                    <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] capitalize text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      {item.fitSilhouette}
                    </span>
                  </div>

                  {/* Sizing notes */}
                  {item.notes && (
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {item.notes}
                    </p>
                  )}
                </div>

                {/* Footer metadata */}
                <div className="mt-5 border-t border-neutral-100 pt-3 text-[11px] text-neutral-400 dark:border-neutral-800">
                  <span>Saved on {new Date(item.savedAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
