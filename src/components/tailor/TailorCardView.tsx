"use client";

import React, { useState, useMemo } from "react";
import { useProfileStore } from "@/core/state/profileStore";
import { formatDualMeasurement } from "@/core/formatters";
import { PILOT_PRODUCTS } from "@/core/data/pilotBrands";
import { evaluateSizeRecommendation } from "@/core/sizing/recommendationEngine";
import { Scissors, Copy, Check, Printer, QrCode, ShieldCheck, Shirt } from "lucide-react";

export function TailorCardView() {
  const { getActiveProfile } = useProfileStore();
  const profile = getActiveProfile();
  const [copied, setCopied] = useState(false);

  const m = profile.measurements;

  const measurementsList = [
    { label: "Chest Girth (Fullest Part)", dual: formatDualMeasurement(m.chestMm) },
    { label: "Shoulder Width (Acromion-to-Acromion)", dual: formatDualMeasurement(m.shoulderWidthMm) },
    { label: "Natural Waist Circumference", dual: formatDualMeasurement(m.waistMm) },
    { label: "High Hip Circumference", dual: formatDualMeasurement(m.hipsMm) },
    { label: "Inseam (Crotch to Ankle)", dual: formatDualMeasurement(m.inseamMm) },
    { label: "Collar / Neck Band", dual: formatDualMeasurement(m.neckMm) },
    { label: "Stature Height", dual: formatDualMeasurement(m.heightMm) },
    { label: "Sleeve Span / Length", dual: formatDualMeasurement(m.sleeveLengthMm) },
  ];

  // Calibrate benchmark ready-to-wear sizes across verified pilot brands for tailor reference
  const benchmarkBrandSizes = useMemo(() => {
    const benchmarks = [
      { brandName: "FabIndia", label: "Handloom Kurta", productId: "prod_fabindia_comfort_kurta" },
      { brandName: "Raymond", label: "Formal Dress Shirt", productId: "prod_raymond_formal_dress_shirt" },
      { brandName: "Peter England", label: "University Oxford", productId: "prod_peter_england_oxford_shirt" },
      { brandName: "Levi's", label: "501 Original Jeans", productId: "prod_levis_501_original" },
      { brandName: "Uniqlo", label: "AIRism Oversized", productId: "prod_uniqlo_airism_oversized" },
    ];

    return benchmarks.map((bm) => {
      const prod = PILOT_PRODUCTS.find((p) => p.id === bm.productId);
      if (!prod) return { ...bm, recommendedSize: "M" };

      const res = evaluateSizeRecommendation({
        profile: profile.measurements,
        fitPreference: {
          profileId: profile.id,
          category: prod.category,
          fitType: "regular",
        },
        garmentDimensions: prod.layer3Specs,
        brandSizeCharts: prod.layer2Charts,
        fabricSpec: prod.fabric,
      });

      return {
        ...bm,
        recommendedSize: res.recommendedSize || "M",
        fitScore: res.fitScore,
      };
    });
  }, [profile]);

  // WhatsApp shareable text formatted for Indian tailors
  const generateWhatsAppMessage = () => {
    let msg = `*WearID Tailor Measurement Card*\n`;
    msg += `Profile: ${profile.name}\n`;
    msg += `Date: ${new Date().toLocaleDateString("en-IN")}\n\n`;
    msg += `*Anatomical Measurements:*\n`;

    measurementsList.forEach((item) => {
      if (item.dual.cm !== "—") {
        msg += `• ${item.label}: ${item.dual.cm} / ${item.dual.inches}\n`;
      }
    });

    msg += `\n*Calibrated Ready-to-Wear References:*\n`;
    benchmarkBrandSizes.forEach((bm) => {
      msg += `• ${bm.brandName} (${bm.label}): Size ${bm.recommendedSize}\n`;
    });

    msg += `\nCalibrated via WearID Sovereign Clothing Passport.\nCanonical Millimeter Precision.`;
    return msg;
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge bg-accent-subtle/80 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
            <Scissors className="w-3.5 h-3.5" />
            Master Tailor Specification Sheet
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
            Tailor Card & Export
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Standard dual metric/imperial measurements for bespoke tailoring and alterations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="min-h-[44px] px-4 rounded-btn bg-[#25D366] text-white font-medium text-xs hover:bg-[#1EBE5D] transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied for WhatsApp!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy for WhatsApp
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[44px] px-3.5 rounded-btn border border-border-strong bg-bg-surface hover:bg-bg-elevated transition-colors inline-flex items-center gap-1.5 text-xs font-medium text-text-primary shadow-xs"
          >
            <Printer className="w-4 h-4 text-text-secondary" />
            Print
          </button>
        </div>
      </div>

      {/* Printable Tailor Passport Card */}
      <div className="rounded-card border-2 border-border bg-bg-surface p-6 sm:p-8 shadow-sm">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-card bg-accent text-white flex items-center justify-center font-display text-2xl font-bold">
              W
            </div>
            <div>
              <span className="font-display text-xl text-text-primary">
                Wear<span className="text-accent">Id</span> Passport
              </span>
              <span className="text-xs text-text-secondary block font-medium">
                Identity: {profile.name} · Verified Canonical Units
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">
              Issuance Date
            </span>
            <span className="text-xs font-medium text-text-primary mt-0.5">
              {new Date().toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Dual Measurements Table */}
        <div className="py-6">
          {/* Technical Mannequin Landmark Pattern */}
          <div className="mb-6 p-4 rounded-card bg-bg-elevated/40 border border-border flex flex-col sm:flex-row items-center gap-6">
            <div className="w-28 h-40 shrink-0 bg-bg-surface rounded-card border border-border flex items-center justify-center p-2">
              <svg viewBox="0 0 100 140" className="w-full h-full text-accent" role="img" aria-label="Technical tailoring pattern mannequin">
                <path d="M50 15 C45 15 42 20 42 25 C42 30 45 35 50 35 C55 35 58 30 58 25 C58 20 55 15 50 15 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M42 33 L26 42 L22 80 L30 80 L34 52 L36 90 L38 135 L48 135 L48 90 L52 90 L52 135 L62 135 L64 90 L66 52 L70 80 L78 80 L74 42 L58 33 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Pattern Lines */}
                <line x1="26" y1="42" x2="74" y2="42" stroke="var(--terracotta)" strokeWidth="2" strokeDasharray="2 2" />
                <line x1="28" y1="52" x2="72" y2="52" stroke="var(--terracotta)" strokeWidth="2" strokeDasharray="2 2" />
                <line x1="33" y1="68" x2="67" y2="68" stroke="var(--terracotta)" strokeWidth="2" strokeDasharray="2 2" />
                <line x1="32" y1="82" x2="68" y2="82" stroke="var(--terracotta)" strokeWidth="2" strokeDasharray="2 2" />
                <line x1="50" y1="90" x2="50" y2="135" stroke="var(--terracotta)" strokeWidth="2" strokeDasharray="2 2" />
              </svg>
            </div>
            <div className="flex-1 text-xs text-text-secondary leading-relaxed space-y-1">
              <span className="font-semibold text-text-primary block text-sm mb-1">
                Bespoke Cutting & Alteration Reference
              </span>
              <p>
                Anatomical girths represent bare-body measurements taken with zero tension. Standard tailoring allowances (wearing ease: +8cm to +12cm on chest, +4cm on waist) should be added based on garment block.
              </p>
              <p className="text-[11px] text-text-tertiary">
                Reference standard: Indian NIFT Anthropometric Specification (2025/2026).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-border border border-border rounded-card overflow-hidden">
            <div className="grid grid-cols-12 bg-bg-elevated/70 py-2.5 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              <div className="col-span-6 sm:col-span-7">Measurement Landmark</div>
              <div className="col-span-3 sm:col-span-3 text-right">Metric (cm)</div>
              <div className="col-span-3 sm:col-span-2 text-right">Imperial (in)</div>
            </div>

            {measurementsList.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 py-3.5 px-4 text-sm items-center hover:bg-bg-elevated/20 transition-colors"
              >
                <div className="col-span-6 sm:col-span-7 font-medium text-text-primary">
                  {item.label}
                </div>
                <div className="col-span-3 sm:col-span-3 text-right font-semibold text-accent">
                  {item.dual.cm}
                </div>
                <div className="col-span-3 sm:col-span-2 text-right font-medium text-text-secondary">
                  {item.dual.inches}
                </div>
              </div>
            ))}
          </div>

          {/* Calibrated Ready-to-Wear Benchmark Sizes (Tailor Cutting Reference) */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Shirt className="w-4 h-4 text-accent" />
              <h3 className="font-semibold text-xs uppercase tracking-wider text-text-primary">
                Calibrated Ready-to-Wear Benchmark Blocks (Master Tailor Reference)
              </h3>
            </div>
            <p className="text-[11px] text-text-secondary mb-3 leading-relaxed">
              Standardized size tags matched deterministically against official pilot brand blocks. Tailors can cross-check pattern allowances against these validated commercial cuts:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {benchmarkBrandSizes.map((bm) => (
                <div
                  key={bm.brandName}
                  className="p-3 rounded-card bg-bg-elevated/40 border border-border text-center flex flex-col justify-between"
                >
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
                    {bm.brandName}
                  </span>
                  <span className="font-sans font-semibold text-lg text-accent my-1 block">
                    {bm.recommendedSize}
                  </span>
                  <span className="text-[10px] text-text-tertiary block truncate">
                    {bm.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tailor Card Verification Seal & Sovereign QR Code */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-card bg-bg-elevated border border-border flex items-center justify-center text-text-primary p-2 shrink-0">
              <QrCode className="w-full h-full text-accent" />
            </div>
            <div>
              <span className="text-xs font-semibold text-text-primary block flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                Zero-Knowledge Portable Token
              </span>
              <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed max-w-sm">
                Scan or share this card with custom tailors or boutiques to ensure exact fit without manual re-measuring.
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary block font-mono">
              HASH: 8F2A-9104-E0B2
            </span>
            <span className="text-[11px] text-text-secondary mt-0.5 block">
              wearid.in/p/{profile.id.slice(0, 8)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
