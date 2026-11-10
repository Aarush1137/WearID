"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  User,
  Shirt,
  Sparkles,
  Share2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Layers,
  Ruler,
} from "lucide-react";

interface GuidedTutorialModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface TutorialStep {
  title: string;
  badge: string;
  headline: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
  graphic: React.ReactNode;
}

export function GuidedTutorialModal({ isOpen, onComplete }: GuidedTutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const steps: TutorialStep[] = [
    {
      title: "Step 1 of 5",
      badge: "Private Biometrics",
      headline: "Your Sovereign Measurement Passport",
      description:
        "WearID stores your exact anatomical dimensions internally in canonical millimeters (mm). Your private body scans, chest girth, and waist measurements never leak to third parties or retail trackers.",
      icon: ShieldCheck,
      accentColor: "text-accent",
      graphic: (
        <div className="p-4 rounded-card bg-bg-elevated/70 border border-border flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-accent-subtle flex items-center justify-center text-accent mb-3 shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="font-semibold text-sm text-text-primary">100% Client-Owned Sovereign Identity</span>
          <span className="text-[11px] text-text-secondary mt-1">Zero Cloud Tracking · Zero Hallucinated Numbers</span>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-text-tertiary font-mono">
            <span>Chest: 1016 mm</span>
            <span>·</span>
            <span>Waist: 838 mm</span>
            <span>·</span>
            <span>Inseam: 812 mm</span>
          </div>
        </div>
      ),
    },
    {
      title: "Step 2 of 5",
      badge: "Visual Avatar",
      headline: "Interactive Body Silhouette",
      description:
        "Instead of confusing centimeters or inches, your passport renders a proportional human silhouette avatar with dynamic landmark lines for chest, waist, and hips that adjust automatically as you calibrate your fit.",
      icon: User,
      accentColor: "text-accent",
      graphic: (
        <div className="p-4 rounded-card bg-bg-elevated/70 border border-border flex items-center justify-center gap-4">
          <div className="relative w-24 h-36 bg-bg-base rounded-card border border-border flex items-center justify-center overflow-hidden">
            {/* Mini Mannequin Silhouette SVG */}
            <svg viewBox="0 0 100 160" className="w-20 h-32">
              <circle cx="50" cy="22" r="12" fill="var(--accent)" opacity="0.8" />
              <path
                d="M32 40 C32 36, 68 36, 68 40 L72 70 C70 85, 66 100, 64 150 L36 150 C34 100, 30 85, 28 70 Z"
                fill="var(--accent)"
                opacity="0.3"
                stroke="var(--accent)"
                strokeWidth="1.5"
              />
              {/* Landmark Lines */}
              <line x1="28" y1="52" x2="72" y2="52" stroke="#4E9A6E" strokeWidth="2" strokeDasharray="2 2" />
              <line x1="33" y1="78" x2="67" y2="78" stroke="#D4987A" strokeWidth="2" strokeDasharray="2 2" />
            </svg>
          </div>
          <div className="text-left text-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4E9A6E]" />
              <span className="font-medium text-text-primary">Chest Apex Landmark</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4987A]" />
              <span className="font-medium text-text-primary">Natural Waistline Band</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">Tap landmarks anytime to calibrate tape measures.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Step 3 of 5",
      badge: "Verified Sizing",
      headline: "Curated Brand Catalog & Specs",
      description:
        "Say goodbye to meaningless 'Small', 'Medium', or 'Large' vanity labels. WearID maps your body directly against physical finished textile measurements (Layer 3 flat specs laid on a cutting table).",
      icon: Shirt,
      accentColor: "text-accent",
      graphic: (
        <div className="p-4 rounded-card bg-bg-elevated/70 border border-border">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-text-primary">Layer 3 Flat Garment Spec</span>
            <span className="px-2 py-0.5 rounded-badge bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-[10px]">
              Verified
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-btn bg-bg-base border border-border">
              <span className="text-[10px] text-text-secondary block">Pit-to-Pit Flat</span>
              <span className="font-semibold font-mono text-text-primary mt-0.5 block">560 mm</span>
            </div>
            <div className="p-2 rounded-btn bg-bg-base border border-border">
              <span className="text-[10px] text-text-secondary block">Half-Waist</span>
              <span className="font-semibold font-mono text-text-primary mt-0.5 block">520 mm</span>
            </div>
            <div className="p-2 rounded-btn bg-bg-base border border-border">
              <span className="text-[10px] text-text-secondary block">Length</span>
              <span className="font-semibold font-mono text-text-primary mt-0.5 block">720 mm</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Step 4 of 5",
      badge: "Explainable Math",
      headline: "Deterministic 2D Drape & Radar",
      description:
        "Every size recommendation comes with a visual 2D drape overlay and 5-axis fit radar. See exact millimeter wearing ease, fabric stretch compensation, and clear confidence scores before you order.",
      icon: Sparkles,
      accentColor: "text-accent",
      graphic: (
        <div className="p-4 rounded-card bg-bg-elevated/70 border border-border flex items-center justify-between gap-3 text-xs">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Chest Ease:</span>
              <span className="font-semibold text-emerald-600 font-mono">+60 mm (Ideal)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Waist Ease:</span>
              <span className="font-semibold text-emerald-600 font-mono">+80 mm (Relaxed)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Fabric Stretch:</span>
              <span className="font-semibold text-accent font-mono">2% Elastane</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full bg-accent-subtle flex flex-col items-center justify-center text-center shrink-0 border border-accent/30">
            <span className="text-[9px] uppercase font-bold text-accent">Fit Match</span>
            <span className="font-display text-lg text-accent font-bold">96%</span>
          </div>
        </div>
      ),
    },
    {
      title: "Step 5 of 5",
      badge: "Everywhere Portability",
      headline: "Tailor Card & Storefront Sizing",
      description:
        "Export an elegant tailor specification card formatted for bespoke tailors, or use your WearID token on partner storefronts to automatically select your size without re-entering measurements.",
      icon: Share2,
      accentColor: "text-accent",
      graphic: (
        <div className="p-4 rounded-card bg-bg-elevated/70 border border-border text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-badge bg-accent text-white text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Universal Size Portability Ready
          </div>
          <p className="text-xs text-text-secondary">
            One-click WhatsApp share for tailors · Secure one-time retailer tokens
          </p>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      if (typeof window !== "undefined") {
        localStorage.setItem("wearid_tutorial_completed", "true");
      }
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-modal-title"
    >
      <div className="relative w-full max-w-lg bg-bg-surface border border-border rounded-card shadow-2xl p-6 sm:p-8 overflow-hidden flex flex-col justify-between">
        {/* Step Progress Top Bar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent font-mono">
                {current.title}
              </span>
              <span className="text-text-tertiary">·</span>
              <span className="px-2 py-0.5 rounded-badge bg-accent-subtle text-accent text-[11px] font-semibold">
                {current.badge}
              </span>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? "w-6 bg-accent"
                      : idx < currentStep
                      ? "w-2 bg-accent/50"
                      : "w-2 bg-border-strong"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Graphic Preview */}
          <div className="my-5">{current.graphic}</div>

          {/* Step Title & Description */}
          <h2 id="tutorial-modal-title" className="font-display text-2xl sm:text-3xl text-text-primary leading-tight">
            {current.headline}
          </h2>
          <p className="text-sm text-text-secondary mt-2.5 leading-relaxed">{current.description}</p>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-5 border-t border-border flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`min-h-[44px] px-4 rounded-btn border text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
              currentStep === 0
                ? "border-transparent text-text-tertiary opacity-0 pointer-events-none"
                : "border-border bg-bg-elevated text-text-primary hover:bg-bg-base"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="min-h-[44px] px-6 rounded-btn bg-accent text-white text-xs font-semibold inline-flex items-center gap-2 hover:bg-accent-hover shadow-sm transition-all"
            autoFocus
          >
            {isLast ? (
              <>
                Complete & Enter WearID
                <CheckCircle2 className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Next Step
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
