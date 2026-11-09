"use client";

import React, { useState } from "react";
import { useProfileStore } from "@/core/state/profileStore";
import { formatDualMeasurement } from "@/core/formatters";
import { Scissors, Copy, Check, Printer, QrCode, ShieldCheck } from "lucide-react";

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
