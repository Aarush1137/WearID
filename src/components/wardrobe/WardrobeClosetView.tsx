"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProfileStore, ReferenceGarmentItem } from "@/core/state/profileStore";
import { PILOT_BRANDS } from "@/core/data/pilotBrands";
import {
  Shirt,
  Plus,
  Trash2,
  Star,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Tag,
  Layers,
} from "lucide-react";

export function WardrobeClosetView() {
  const { getActiveProfile, addReferenceGarment, removeReferenceGarment } = useProfileStore();
  const profile = getActiveProfile();
  const garments = profile.referenceGarments || [];

  const [isAdding, setIsAdding] = useState(false);
  const [brandName, setBrandName] = useState("Uniqlo");
  const [garmentName, setGarmentName] = useState("");
  const [category, setCategory] = useState("t_shirt");
  const [sizeLabel, setSizeLabel] = useState("M");
  const [fitFeel, setFitFeel] = useState<"tight" | "perfect" | "loose">("perfect");
  const [fitRating, setFitRating] = useState<number>(5);
  const [notes, setNotes] = useState("");

  const handleSaveGarment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!garmentName.trim()) return;

    addReferenceGarment(profile.id, {
      brandName,
      garmentName: garmentName.trim(),
      category,
      sizeLabel: sizeLabel.trim().toUpperCase(),
      fitFeel,
      fitRating,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setGarmentName("");
    setNotes("");
    setIsAdding(false);
  };

  const handleQuickAdd = (preset: {
    brand: string;
    name: string;
    cat: string;
    size: string;
    feel: "tight" | "perfect" | "loose";
    rating: number;
  }) => {
    addReferenceGarment(profile.id, {
      brandName: preset.brand,
      garmentName: preset.name,
      category: preset.cat,
      sizeLabel: preset.size,
      fitFeel: preset.feel,
      fitRating: preset.rating,
      notes: "Quick added calibrated reference item",
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge bg-accent-subtle/80 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
            <Shirt className="w-3.5 h-3.5" />
            Fit Anchor Calibration
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
            My Wardrobe Closet
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Log garments you already own. WearID calibrates your fit profile against your real-world sizing preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="min-h-[44px] px-4 rounded-btn bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? "Close Form" : "Log Owned Garment"}</span>
        </button>
      </div>

      {/* Calibration Banner */}
      <div className="p-4 rounded-card bg-bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-btn bg-accent-subtle text-accent flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-text-primary">
                Calibration Status:
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-badge font-semibold uppercase ${
                  garments.length >= 2
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-400"
                    : garments.length === 1
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-400"
                    : "bg-bg-elevated text-text-tertiary"
                }`}
              >
                {garments.length >= 2
                  ? "Fully Calibrated (+15% Confidence)"
                  : garments.length === 1
                  ? "Partially Calibrated (+8% Confidence)"
                  : "Uncalibrated (0 reference items)"}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {garments.length >= 2
                ? "Your reference garments anchor sizing tolerances and personalize wearing ease."
                : "Add 1 or 2 items you wear often to calibrate sizing models to your real comfort preferences."}
            </p>
          </div>
        </div>

        <Link
          href="/app/recommendations"
          className="text-xs font-semibold text-accent hover:text-accent-hover inline-flex items-center gap-1 shrink-0"
        >
          <span>Test Recommendations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Add Garment Modal / Inline Form */}
      {isAdding && (
        <form
          onSubmit={handleSaveGarment}
          className="rounded-card border-2 border-accent/40 bg-bg-surface p-6 shadow-sm space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-semibold text-base text-text-primary flex items-center gap-2">
              <Tag className="w-4 h-4 text-accent" />
              Add Garment to Closet
            </h3>
            <span className="text-xs text-text-secondary">
              Profile: {profile.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Brand Name
              </label>
              <select
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full h-11 px-3 rounded-btn border border-border bg-bg-base text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {PILOT_BRANDS.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
                <option value="Other / Custom">Other / Custom Brand</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Garment Description / Model
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AIRism Oversized Tee, 501 Jeans"
                value={garmentName}
                onChange={(e) => setGarmentName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-btn border border-border bg-bg-base text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-text-tertiary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-btn border border-border bg-bg-base text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="t_shirt">T-Shirt / Polo</option>
                <option value="shirt_casual">Casual Shirt</option>
                <option value="shirt_formal">Formal Shirt</option>
                <option value="jeans">Jeans / Denim</option>
                <option value="trousers_chinos">Chinos / Trousers</option>
                <option value="jacket">Jacket / Outerwear</option>
                <option value="shoes">Footwear / Shoes</option>
                <option value="dress">Dress</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Size on Label
              </label>
              <input
                type="text"
                required
                placeholder="e.g. M, L, XL, 32x32, UK 9"
                value={sizeLabel}
                onChange={(e) => setSizeLabel(e.target.value)}
                className="w-full h-11 px-3.5 rounded-btn border border-border bg-bg-base text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Fit Feeling & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                How does it fit you?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "tight", label: "Slightly Tight" },
                  { id: "perfect", label: "Perfect / Ideal" },
                  { id: "loose", label: "Slightly Loose" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFitFeel(item.id as any)}
                    className={`h-11 rounded-btn text-xs font-semibold border transition-all ${
                      fitFeel === item.id
                        ? "bg-accent text-white border-accent shadow-xs"
                        : "bg-bg-base text-text-secondary border-border hover:bg-bg-elevated"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Satisfaction Rating
              </label>
              <div className="flex items-center gap-2 h-11 px-3 rounded-btn border border-border bg-bg-base">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFitRating(star)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= fitRating
                          ? "text-amber-400 fill-amber-400"
                          : "text-text-tertiary"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-text-secondary ml-2 font-medium">
                  {fitRating} / 5 Stars
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Personal Fit Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Great shoulder fit, slightly long in sleeves, comfortable chest"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-11 px-3.5 rounded-btn border border-border bg-bg-base text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-text-tertiary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="min-h-[40px] px-4 rounded-btn border border-border text-text-secondary text-xs font-medium hover:bg-bg-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-5 rounded-btn bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs"
            >
              Save to Closet
            </button>
          </div>
        </form>
      )}

      {/* Garments Grid */}
      {garments.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Logged Reference Items ({garments.length})
            </h2>
            <span className="text-xs text-text-tertiary">
              Stored locally on device · Private by default
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {garments.map((g) => (
              <div
                key={g.id}
                className="rounded-card border border-border bg-bg-surface p-5 shadow-xs flex flex-col justify-between hover:border-accent/40 transition-colors group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-accent uppercase tracking-wider block">
                        {g.brandName}
                      </span>
                      <h3 className="font-semibold text-base text-text-primary mt-0.5 line-clamp-1">
                        {g.garmentName}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeReferenceGarment(profile.id, g.id)}
                      className="p-1.5 rounded-btn text-text-tertiary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Remove from closet"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="font-display text-xl font-bold text-text-primary px-2.5 py-0.5 rounded-btn bg-bg-elevated border border-border">
                      {g.sizeLabel}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-badge font-semibold capitalize ${
                        g.fitFeel === "perfect"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {g.fitFeel} Fit
                    </span>
                  </div>

                  {g.notes && (
                    <p className="text-xs text-text-secondary mt-3 italic line-clamp-2">
                      &ldquo;{g.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (g.fitRating || 5)
                            ? "text-amber-400 fill-amber-400"
                            : "text-text-tertiary"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-accent">
                    Active Anchor
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-card border-2 border-dashed border-border bg-bg-surface/50 p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-accent-subtle text-accent mx-auto flex items-center justify-center">
            <Shirt className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto">
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Your Wardrobe is Empty
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1.5 leading-relaxed">
              Logging garments you already own that fit well gives WearID an empirical anchor. It calibrates your personal wearing ease for millimeter-accurate recommendations.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="min-h-[44px] px-5 rounded-btn bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-colors inline-flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Log Your First Garment</span>
            </button>
          </div>

          {/* Quick-add suggestions */}
          <div className="pt-6 border-t border-border max-w-lg mx-auto text-left">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-3 text-center sm:text-left">
              Quick-Add Common Baseline Items:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { brand: "Uniqlo", name: "AIRism Oversized", cat: "t_shirt", size: "M", feel: "perfect" as const, rating: 5 },
                { brand: "Levi's", name: "501 Original Fit", cat: "jeans", size: "W32", feel: "perfect" as const, rating: 5 },
                { brand: "Zara", name: "Cotton Crew Tee", cat: "t_shirt", size: "L", feel: "perfect" as const, rating: 4 },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickAdd(item)}
                  className="p-3 rounded-card bg-bg-surface border border-border hover:border-accent/40 text-left transition-all hover:bg-bg-elevated group"
                >
                  <span className="text-[10px] font-bold text-accent uppercase block">
                    {item.brand}
                  </span>
                  <span className="text-xs font-semibold text-text-primary block truncate group-hover:text-accent">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-text-tertiary block mt-1">
                    Size: {item.size} · + Add
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
