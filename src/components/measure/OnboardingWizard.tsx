"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/core/state/profileStore";
import { PILOT_BRANDS } from "@/core/data/pilotBrands";
import { cmToMm, inchesToMm } from "@/core/units";
import { FitType } from "@/core/types";
import { Zap, Shirt, Ruler, ArrowRight, Check, HelpCircle } from "lucide-react";

type OnboardingPath = "quick" | "garment" | "tape";
type ShoppingCategory = "mens" | "womens" | "both";
type RelationOption = "self" | "partner" | "parent" | "sibling" | "friend" | "other";

export function OnboardingWizard() {
  const router = useRouter();
  const {
    getActiveProfile,
    updateProfile,
    updateMeasurements,
    updatePreference,
    addReferenceGarment,
    displayUnit,
  } = useProfileStore();

  const activeProfile = getActiveProfile();

  // Step 0 state (Who are we fitting?)
  const [wizardStep, setWizardStep] = useState<0 | 1>(0);
  const [profileName, setProfileName] = useState<string>("");
  const [shoppingFor, setShoppingFor] = useState<ShoppingCategory>("mens");
  const [relation, setRelation] = useState<RelationOption>("self");

  const [selectedPath, setSelectedPath] = useState<OnboardingPath>("quick");

  // Path A (Quick) Form State
  const [quickChest, setQuickChest] = useState<string>(
    activeProfile.measurements.chestMm
      ? displayUnit === "cm"
        ? (activeProfile.measurements.chestMm / 10).toString()
        : (activeProfile.measurements.chestMm / 25.4).toFixed(1)
      : "98"
  );
  const [quickWaist, setQuickWaist] = useState<string>(
    activeProfile.measurements.waistMm
      ? displayUnit === "cm"
        ? (activeProfile.measurements.waistMm / 10).toString()
        : (activeProfile.measurements.waistMm / 25.4).toFixed(1)
      : "82"
  );
  const [quickHeight, setQuickHeight] = useState<string>(
    activeProfile.measurements.heightMm
      ? displayUnit === "cm"
        ? (activeProfile.measurements.heightMm / 10).toString()
        : (activeProfile.measurements.heightMm / 25.4).toFixed(1)
      : "178"
  );
  const [quickFitIntent, setQuickFitIntent] = useState<FitType>("regular");

  // Path B (From Garment) Form State
  const [garmentBrand, setGarmentBrand] = useState<string>("uniqlo");
  const [garmentSize, setGarmentSize] = useState<string>("M");
  const [garmentFitQuality, setGarmentFitQuality] = useState<"perfect" | "tight" | "loose">("perfect");
  const [garmentFlatChest, setGarmentFlatChest] = useState<string>("51.5");

  // Path C (Tape) Form State
  const [tapeChest, setTapeChest] = useState<string>("98");
  const [tapeShoulders, setTapeShoulders] = useState<string>("45");
  const [tapeWaist, setTapeWaist] = useState<string>("82");
  const [tapeHips, setTapeHips] = useState<string>("96");
  const [tapeInseam, setTapeInseam] = useState<string>("79");
  const [tapeNeck, setTapeNeck] = useState<string>("39");
  const [tapeSleeve, setTapeSleeve] = useState<string>("62");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStepTape, setActiveStepTape] = useState<number>(0);

  // Helper to parse input string to canonical mm
  const parseToCanonicalMm = (valStr: string): number => {
    const num = parseFloat(valStr);
    if (isNaN(num) || num <= 0) return 0;
    return displayUnit === "cm" ? cmToMm(num) : inchesToMm(num);
  };

  // Derive gender from shopping category
  const derivedGender = (): "male" | "female" | "unisex" => {
    if (shoppingFor === "mens") return "male";
    if (shoppingFor === "womens") return "female";
    return "unisex";
  };

  // Map shopping pill to categories array
  const derivedCategories = (): ("mens" | "womens")[] => {
    if (shoppingFor === "mens") return ["mens"];
    if (shoppingFor === "womens") return ["womens"];
    return ["mens", "womens"];
  };

  // Normalize relation to UserProfile relation type
  const normalizeRelation = (r: RelationOption): "self" | "partner" | "parent" | "child" | "other" => {
    if (r === "sibling" || r === "friend") return "other";
    return r;
  };

  // Step 0 â†’ Step 1
  const handleStep0Continue = () => {
    if (!profileName.trim()) return;
    setWizardStep(1);
  };

  // Shared profile save before redirect
  const saveProfileAndRedirect = () => {
    updateProfile(activeProfile.id, {
      name: profileName.trim() || "My Profile",
      gender: derivedGender(),
      shoppingCategories: derivedCategories(),
      relation: normalizeRelation(relation),
    });
    setTimeout(() => {
      router.push("/app");
    }, 300);
  };

  const handleSaveQuick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const chestMm = parseToCanonicalMm(quickChest);
    const waistMm = parseToCanonicalMm(quickWaist);
    const heightMm = parseToCanonicalMm(quickHeight);

    updateMeasurements(activeProfile.id, {
      chestMm: chestMm || 980,
      waistMm: waistMm || 820,
      heightMm: heightMm || 1780,
      measurementMethod: {
        chestMm: "quick_input",
        waistMm: "quick_input",
      },
    });

    updatePreference(activeProfile.id, "t_shirt", quickFitIntent);
    updatePreference(activeProfile.id, "t_shirt_oversized", quickFitIntent === "oversized" ? "oversized" : "relaxed");

    saveProfileAndRedirect();
  };

  const handleSaveGarment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const flatMm = parseToCanonicalMm(garmentFlatChest);
    // If flat chest is provided, double it for circumference, minus standard wearing ease for regular fit (approx 100mm)
    const derivedChestMm = flatMm > 0 ? Math.round(flatMm * 2 - 100) : 980;

    const brand = PILOT_BRANDS.find((b) => b.id === garmentBrand);
    const brandName = brand ? brand.name : "Uniqlo India";

    addReferenceGarment(activeProfile.id, {
      brandName,
      garmentName: `${brandName} Benchmark Item`,
      sizeLabel: garmentSize,
      fitRating: garmentFitQuality === "perfect" ? 5 : garmentFitQuality === "tight" ? 3 : 3,
      fitFeel: garmentFitQuality,
      category: "t_shirt",
      flatChestMm: flatMm,
      notes: `Calibrated from known comfortable ${garmentSize} garment.`,
    });

    updateMeasurements(activeProfile.id, {
      chestMm: derivedChestMm,
      measurementMethod: {
        chestMm: "garment_derived_anchor",
      },
    });

    saveProfileAndRedirect();
  };

  const handleSaveTape = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const chestMm = parseToCanonicalMm(tapeChest);
    const shoulderMm = parseToCanonicalMm(tapeShoulders);
    const waistMm = parseToCanonicalMm(tapeWaist);
    const hipsMm = parseToCanonicalMm(tapeHips);
    const inseamMm = parseToCanonicalMm(tapeInseam);
    const neckMm = parseToCanonicalMm(tapeNeck);
    const sleeveMm = parseToCanonicalMm(tapeSleeve);

    updateMeasurements(activeProfile.id, {
      chestMm: chestMm || 980,
      shoulderWidthMm: shoulderMm || 450,
      waistMm: waistMm || 820,
      hipsMm: hipsMm || 960,
      inseamMm: inseamMm || 790,
      neckMm: neckMm || 390,
      sleeveLengthMm: sleeveMm || 620,
      measurementMethod: {
        chestMm: "physical_tape",
        shoulderWidthMm: "physical_tape",
        waistMm: "physical_tape",
        hipsMm: "physical_tape",
        inseamMm: "physical_tape",
        neckMm: "physical_tape",
        sleeveLengthMm: "physical_tape",
      },
    });

    saveProfileAndRedirect();
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-semibold tracking-wider uppercase text-accent bg-accent-subtle/60 px-3 py-1 rounded-badge inline-block mb-3">
          Profile Calibration Coordinator
        </span>
        <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
          {wizardStep === 0 ? "Who are we fitting?" : "How would you like to build your profile?"}
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto mt-2">
          {wizardStep === 0
            ? "Tell us a little about yourself before we calibrate your size profile."
            : "Choose the calibration method that fits you right now. You can refine your measurements at any time."}
        </p>
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className={`h-1.5 w-16 rounded-full transition-colors ${wizardStep >= 0 ? "bg-accent" : "bg-border"}`} />
          <div className={`h-1.5 w-16 rounded-full transition-colors ${wizardStep >= 1 ? "bg-accent" : "bg-border"}`} />
          <span className="text-xs text-text-secondary ml-2">
            Step {wizardStep + 1} of 2
          </span>
        </div>
      </div>

      {/* â”€â”€ STEP 0: Who are we fitting? â”€â”€ */}
      {wizardStep === 0 && (
        <div className="rounded-card border border-border bg-bg-surface p-6 sm:p-8 shadow-sm">
          {/* Display Name */}
          <div className="mb-6">
            <label htmlFor="onboarding-name" className="block text-xs font-semibold text-text-primary mb-1.5">
              Display Name
            </label>
            <input
              id="onboarding-name"
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. Aarush"
              maxLength={60}
              className="input-editorial w-full"
              autoComplete="given-name"
              autoFocus
            />
            <span className="text-[11px] text-text-secondary block mt-1">
              Used to personalise your size passport
            </span>
          </div>

          {/* Shopping For â€” pill buttons */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-text-primary mb-2">
              Shopping for
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Shopping category">
              {(
                [
                  { value: "mens", label: "Men's clothing" },
                  { value: "womens", label: "Women's clothing" },
                  { value: "both", label: "Both" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setShoppingFor(opt.value)}
                  aria-pressed={shoppingFor === opt.value}
                  className={`min-h-[44px] px-5 py-2 rounded-badge border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    shoppingFor === opt.value
                      ? "border-accent bg-accent text-white shadow-xs"
                      : "border-border bg-bg-elevated text-text-primary hover:bg-accent-subtle/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Relationship â€” always shown, default Myself */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-text-primary mb-2">
              Shopping for whom?
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Relationship">
              {(
                [
                  { value: "self", label: "Myself" },
                  { value: "partner", label: "Partner" },
                  { value: "parent", label: "Parent" },
                  { value: "sibling", label: "Sibling" },
                  { value: "friend", label: "Friend" },
                  { value: "other", label: "Other" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRelation(opt.value)}
                  aria-pressed={relation === opt.value}
                  className={`min-h-[44px] px-4 py-2 rounded-badge border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    relation === opt.value
                      ? "border-accent bg-accent-subtle/50 text-accent font-semibold"
                      : "border-border bg-bg-surface text-text-primary hover:bg-bg-elevated"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleStep0Continue}
            disabled={!profileName.trim()}
            className="w-full btn-primary min-h-[48px] text-base font-semibold shadow-sm"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}

      {/* â”€â”€ STEP 1: Path Selector + Measurement Form â”€â”€ */}
      {wizardStep === 1 && (
        <>
          {/* Path Selector (3 Paths: Quick 2-min, From Garment, Tape) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <button
              type="button"
              onClick={() => setSelectedPath("quick")}
              className={`p-4 rounded-card border text-left transition-all min-h-[44px] flex flex-col justify-between ${
                selectedPath === "quick"
                  ? "border-accent bg-accent-subtle/30 shadow-xs"
                  : "border-border bg-bg-surface hover:bg-bg-elevated"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-btn bg-accent-subtle text-accent flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                {selectedPath === "quick" && (
                  <span className="w-2 h-2 rounded-full bg-accent" />
                )}
              </div>
              <div>
                <span className="text-sm font-semibold text-text-primary block">
                  Path A: Quick Estimate
                </span>
                <span className="text-xs text-text-secondary mt-0.5 block">
                  Under 2 minutes Â· Height, Chest & Waist
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPath("garment")}
              className={`p-4 rounded-card border text-left transition-all min-h-[44px] flex flex-col justify-between ${
                selectedPath === "garment"
                  ? "border-accent bg-accent-subtle/30 shadow-xs"
                  : "border-border bg-bg-surface hover:bg-bg-elevated"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-btn bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Shirt className="w-4 h-4" />
                </div>
                {selectedPath === "garment" && (
                  <span className="w-2 h-2 rounded-full bg-accent" />
                )}
              </div>
              <div>
                <span className="text-sm font-semibold text-text-primary block">
                  Path B: From Garment
                </span>
                <span className="text-xs text-text-secondary mt-0.5 block">
                  Use a favourite brand & size tag you wear
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPath("tape")}
              className={`p-4 rounded-card border text-left transition-all min-h-[44px] flex flex-col justify-between ${
                selectedPath === "tape"
                  ? "border-accent bg-accent-subtle/30 shadow-xs"
                  : "border-border bg-bg-surface hover:bg-bg-elevated"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-btn bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Ruler className="w-4 h-4" />
                </div>
                {selectedPath === "tape" && (
                  <span className="w-2 h-2 rounded-full bg-accent" />
                )}
              </div>
              <div>
                <span className="text-sm font-semibold text-text-primary block">
                  Path C: Tape Measures
                </span>
                <span className="text-xs text-text-secondary mt-0.5 block">
                  Full tape precision with visual landmarks
                </span>
              </div>
            </button>
          </div>

          {/* Path A View: Quick Onboarding Form */}
          {selectedPath === "quick" && (
            <form
              onSubmit={handleSaveQuick}
              className="rounded-card border border-border bg-bg-surface p-6 sm:p-8 shadow-sm"
            >
              <div className="mb-6 pb-4 border-b border-border">
                <h2 className="font-semibold text-lg text-text-primary">
                  Quick 2-Minute Calibration
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Input your approximate body dimensions. All values are stored in canonical integer millimeters.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Chest Circumference ({displayUnit})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={quickChest}
                    onChange={(e) => setQuickChest(e.target.value)}
                    className="input-editorial w-full"
                    placeholder={displayUnit === "cm" ? "e.g. 98" : "e.g. 38.5"}
                  />
                  <span className="text-[11px] text-text-secondary block mt-1">
                    Measured at the fullest part of the chest
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Natural Waist ({displayUnit})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={quickWaist}
                    onChange={(e) => setQuickWaist(e.target.value)}
                    className="input-editorial w-full"
                    placeholder={displayUnit === "cm" ? "e.g. 82" : "e.g. 32.5"}
                  />
                  <span className="text-[11px] text-text-secondary block mt-1">
                    Narrowest point above the navel
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Stature Height ({displayUnit})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={quickHeight}
                    onChange={(e) => setQuickHeight(e.target.value)}
                    className="input-editorial w-full"
                    placeholder={displayUnit === "cm" ? "e.g. 178" : "e.g. 70"}
                  />
                  <span className="text-[11px] text-text-secondary block mt-1">
                    Standing barefoot against a wall
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-text-primary mb-2">
                  Default Fit Preference (Layer 4 Fit Intent)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(
                    [
                      { type: "slim", label: "Slim Fit", desc: "+4 to +8cm ease" },
                      { type: "regular", label: "Regular Fit", desc: "+8 to +14cm ease" },
                      { type: "relaxed", label: "Relaxed Fit", desc: "+14 to +20cm ease" },
                      { type: "oversized", label: "Oversized", desc: "+20 to +30cm ease" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.type}
                      type="button"
                      onClick={() => setQuickFitIntent(f.type)}
                      className={`p-3 rounded-card border text-left min-h-[44px] transition-all ${
                        quickFitIntent === f.type
                          ? "border-accent bg-accent-subtle/50 font-semibold"
                          : "border-border bg-bg-surface hover:bg-bg-elevated"
                      }`}
                    >
                      <span className="text-xs font-semibold text-text-primary block">
                        {f.label}
                      </span>
                      <span className="text-[10px] text-text-secondary block mt-0.5">
                        {f.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary min-h-[48px] text-base font-semibold shadow-sm"
              >
                {isSubmitting ? "Calibrating..." : "Save Identity & Enter Passport"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </form>
          )}

          {/* Path B View: From Garment */}
          {selectedPath === "garment" && (
            <form
              onSubmit={handleSaveGarment}
              className="rounded-card border border-border bg-bg-surface p-6 sm:p-8 shadow-sm"
            >
              <div className="mb-6 pb-4 border-b border-border">
                <h2 className="font-semibold text-lg text-text-primary">
                  Calibrate from a Garment that Fits You Well
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Tell us a brand and size tag of a shirt or t-shirt you already own that fits you comfortably.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Pilot Brand
                  </label>
                  <select
                    value={garmentBrand}
                    onChange={(e) => setGarmentBrand(e.target.value)}
                    className="input-editorial w-full"
                  >
                    {PILOT_BRANDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.parentGroup})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Size Label on Tag
                  </label>
                  <select
                    value={garmentSize}
                    onChange={(e) => setGarmentSize(e.target.value)}
                    className="input-editorial w-full"
                  >
                    {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => (
                      <option key={sz} value={sz}>
                        Size {sz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  How does this garment fit you?
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: "perfect", label: "Fits Perfectly", desc: "Gold standard anchor" },
                      { id: "tight", label: "Slightly Snug", desc: "Prefer a bit more room" },
                      { id: "loose", label: "Slightly Loose", desc: "Prefer a closer drape" },
                    ] as const
                  ).map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setGarmentFitQuality(q.id)}
                      className={`p-3 rounded-card border text-left min-h-[44px] transition-all ${
                        garmentFitQuality === q.id
                          ? "border-accent bg-accent-subtle/50 font-semibold"
                          : "border-border bg-bg-surface hover:bg-bg-elevated"
                      }`}
                    >
                      <span className="text-xs font-semibold text-text-primary block">
                        {q.label}
                      </span>
                      <span className="text-[10px] text-text-secondary block mt-0.5">
                        {q.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 p-4 rounded-card bg-bg-elevated/50 border border-border">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <label className="block text-xs font-semibold text-text-primary">
                      Optional: Flat Pit-to-Pit Width ({displayUnit})
                    </label>
                    <p className="text-[11px] text-text-secondary mb-2">
                      Lay the t-shirt flat and measure directly from armpit seam to armpit seam.
                    </p>
                    <input
                      type="number"
                      step="0.1"
                      value={garmentFlatChest}
                      onChange={(e) => setGarmentFlatChest(e.target.value)}
                      className="input-editorial w-48"
                      placeholder="e.g. 51.5"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary min-h-[48px] text-base font-semibold shadow-sm"
              >
                {isSubmitting ? "Deriving Profile..." : "Calibrate Profile from Garment"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </form>
          )}

          {/* Path C View: Tape Measures with Landmark Guides */}
          {selectedPath === "tape" && (
            <form
              onSubmit={handleSaveTape}
              className="rounded-card border border-border bg-bg-surface p-6 sm:p-8 shadow-sm"
            >
              <div className="mb-6 pb-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg text-text-primary">
                    Full Anatomical Measurement Wizard
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Visual landmark instructions based on NIFT anthropometric standards.
                  </p>
                </div>
                <div className="text-xs font-semibold text-accent bg-accent-subtle/70 px-2.5 py-1 rounded-badge">
                  Step {activeStepTape + 1} of 7
                </div>
              </div>

              {/* Stepper Tabs */}
              <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-2">
                {["Chest", "Shoulders", "Waist", "Hips", "Inseam", "Collar / Neck", "Sleeve"].map((step, idx) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setActiveStepTape(idx)}
                    className={`px-3 py-1.5 rounded-btn text-xs font-medium min-h-[36px] shrink-0 transition-colors ${
                      activeStepTape === idx
                        ? "bg-accent text-white"
                        : "bg-bg-elevated text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>

              {/* Visual Anatomical Diagram Card */}
              <div className="p-6 rounded-card bg-bg-elevated/40 border border-border mb-6 flex flex-col sm:flex-row items-center gap-6">
                {/* Inline SVG Anatomical Guide */}
                <div className="w-32 h-44 shrink-0 bg-bg-surface rounded-card border border-border flex items-center justify-center p-2">
                  <svg viewBox="0 0 100 140" className="w-full h-full text-accent">
                    {/* Simplified Body Silhouette */}
                    <path
                      d="M50 15 C45 15 42 20 42 25 C42 30 45 35 50 35 C55 35 58 30 58 25 C58 20 55 15 50 15 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M42 33 L26 42 L22 80 L30 80 L34 52 L36 90 L38 135 L48 135 L48 90 L52 90 L52 135 L62 135 L64 90 L66 52 L70 80 L78 80 L74 42 L58 33 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    {/* Active Highlight Line */}
                    {activeStepTape === 0 && (
                      <line x1="28" y1="52" x2="72" y2="52" stroke="var(--terracotta)" strokeWidth="3" strokeDasharray="2 2" />
                    )}
                    {activeStepTape === 1 && (
                      <line x1="26" y1="42" x2="74" y2="42" stroke="var(--terracotta)" strokeWidth="3" strokeDasharray="2 2" />
                    )}
                    {activeStepTape === 2 && (
                      <line x1="33" y1="68" x2="67" y2="68" stroke="var(--terracotta)" strokeWidth="3" strokeDasharray="2 2" />
                    )}
                    {activeStepTape === 3 && (
                      <line x1="32" y1="82" x2="68" y2="82" stroke="var(--terracotta)" strokeWidth="3" strokeDasharray="2 2" />
                    )}
                    {activeStepTape === 4 && (
                      <line x1="50" y1="90" x2="50" y2="135" stroke="var(--terracotta)" strokeWidth="3" strokeDasharray="2 2" />
                    )}
                    {activeStepTape === 5 && (
                      <ellipse cx="50" cy="34" rx="8" ry="4" stroke="var(--terracotta)" strokeWidth="3" fill="none" strokeDasharray="2 2" />
                    )}
                    {activeStepTape === 6 && (
                      <line x1="26" y1="42" x2="22" y2="80" stroke="var(--terracotta)" strokeWidth="3" strokeDasharray="2 2" />
                    )}
                  </svg>
                </div>

                <div className="flex-1">
                  {activeStepTape === 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-text-primary">
                        1. Chest Circumference
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Pass the tape around the fullest point of your chest, keeping the tape level across the shoulder blades. Breathe normally without inflating the ribcage.
                      </p>
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-text-primary block mb-1">
                          Chest ({displayUnit})
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={tapeChest}
                          onChange={(e) => setTapeChest(e.target.value)}
                          className="input-editorial w-48"
                        />
                      </div>
                    </div>
                  )}

                  {activeStepTape === 1 && (
                    <div>
                      <h3 className="font-semibold text-sm text-text-primary">
                        2. Biacromial Shoulder Width
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Measure straight across the back from the bony tip of the left shoulder (acromion) to the right shoulder.
                      </p>
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-text-primary block mb-1">
                          Shoulders ({displayUnit})
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={tapeShoulders}
                          onChange={(e) => setTapeShoulders(e.target.value)}
                          className="input-editorial w-48"
                        />
                      </div>
                    </div>
                  )}

                  {activeStepTape === 2 && (
                    <div>
                      <h3 className="font-semibold text-sm text-text-primary">
                        3. Natural Waist Circumference
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Wrap the tape around the natural crease of your waist (typically 2-3 cm above the belly button). Do not suck in your stomach.
                      </p>
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-text-primary block mb-1">
                          Waist ({displayUnit})
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={tapeWaist}
                          onChange={(e) => setTapeWaist(e.target.value)}
                          className="input-editorial w-48"
                        />
                      </div>
                    </div>
                  )}

                  {activeStepTape === 3 && (
                    <div>
                      <h3 className="font-semibold text-sm text-text-primary">
                        4. High Hip Circumference
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Measure around the fullest part of the buttocks and hip bones with feet placed together.
                      </p>
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-text-primary block mb-1">
                          Hips ({displayUnit})
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={tapeHips}
                          onChange={(e) => setTapeHips(e.target.value)}
                          className="input-editorial w-48"
                        />
                      </div>
                    </div>
                  )}

                  {activeStepTape === 4 && (
                    <div>
                      <h3 className="font-semibold text-sm text-text-primary">
                        5. Inseam Length
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Measure from the lowest point of the crotch seam straight down the inside leg to the bottom of the ankle bone.
                      </p>
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-text-primary block mb-1">
                          Inseam ({displayUnit})
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={tapeInseam}
                          onChange={(e) => setTapeInseam(e.target.value)}
                          className="input-editorial w-48"
                        />
                      </div>
                    </div>
                  )}

                  {activeStepTape === 5 && (
                    <div>
                      <h3 className="font-semibold text-sm text-text-primary">
                        6. Collar / Neck Circumference
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Wrap the tape around the base of the neck, placing one index finger between tape and skin for breathing comfort.
                      </p>
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-text-primary block mb-1">
                          Collar ({displayUnit})
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={tapeNeck}
                          onChange={(e) => setTapeNeck(e.target.value)}
                          className="input-editorial w-48"
                        />
                      </div>
                    </div>
                  )}

                  {activeStepTape === 6 && (
                    <div>
                      <h3 className="font-semibold text-sm text-text-primary">
                        7. Sleeve Span / Length
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        With elbow slightly bent, measure from the acromion shoulder tip down to the prominent wrist bone.
                      </p>
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-text-primary block mb-1">
                          Sleeve ({displayUnit})
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={tapeSleeve}
                          onChange={(e) => setTapeSleeve(e.target.value)}
                          className="input-editorial w-48"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={activeStepTape === 0}
                  onClick={() => setActiveStepTape((prev) => Math.max(0, prev - 1))}
                  className="min-h-[44px] px-4 rounded-btn border border-border text-xs font-semibold text-text-primary disabled:opacity-40"
                >
                  Previous Step
                </button>

                {activeStepTape < 6 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStepTape((prev) => Math.min(6, prev + 1))}
                    className="min-h-[44px] px-5 rounded-btn bg-accent text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    Next Landmark
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary min-h-[44px] text-xs font-semibold"
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Save Complete Anatomical Profile
                  </button>
                )}
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
