import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck, ArrowLeft, Ruler, BookOpen, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Apparel Sizing Methodology & Measurement Science — WearID",
  description:
    "Deterministic fitting methodology, anatomical human dimensions vs laid-flat textile dimensions, ease allowance modeling, and provenance verification standards.",
  keywords: [
    "clothing sizing methodology",
    "anatomical body measurements",
    "garment dimensions",
    "wearing ease allowance",
    "clothing size comparison science",
    "cloth size comparisons",
  ],
  alternates: {
    canonical: "https://wear-id.vercel.app/methodology",
  },
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col">
      <header className="border-b border-border bg-bg-surface/80 backdrop-blur-md px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-btn bg-accent text-white flex items-center justify-center font-display text-lg">
            W
          </span>
          <span className="font-semibold text-lg tracking-tight text-text-primary">
            Wear<span className="text-accent">Id</span>
          </span>
        </Link>
        <Link
          href="/app"
          className="btn-primary min-h-[40px] px-4 text-xs font-semibold"
        >
          Open Passport
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>

        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-badge bg-accent-subtle/80 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          Apparel Sizing Science & Governance
        </div>

        <h1 className="font-display text-3xl sm:text-4xl text-text-primary mb-4">
          WearID Sizing Methodology
        </h1>
        <p className="text-base text-text-secondary leading-relaxed mb-8">
          Why traditional size charts fail, and how WearID provides deterministic, explainable sizing
          calibrated to canonical millimeters.
        </p>

        <div className="space-y-6">
          <div className="p-6 rounded-card bg-bg-surface border border-border shadow-xs">
            <h2 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              1. The Four-Layer Data Architecture
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              Traditional fashion retail conflates human bodies with garments. WearID strictly isolates four distinct layers:
            </p>
            <ul className="text-xs text-text-secondary space-y-2 list-disc list-inside">
              <li><strong className="text-text-primary">Layer 1:</strong> User&apos;s anatomical body profile (chest girth, shoulder acromion width, natural waist, hips, inseam) in canonical integer millimeters.</li>
              <li><strong className="text-text-primary">Layer 2:</strong> Brand body-fit ranges (what body dimensions a brand states a size fits).</li>
              <li><strong className="text-text-primary">Layer 3:</strong> Physical finished garment dimensions laid flat (pit-to-pit flat, shoulder seam-to-seam, garment length).</li>
              <li><strong className="text-text-primary">Layer 4:</strong> User&apos;s personal fit intent per category (slim, regular, relaxed, oversized).</li>
            </ul>
          </div>

          <div className="p-6 rounded-card bg-bg-surface border border-border shadow-xs">
            <h2 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-accent" />
              2. Deterministic Gaussian Ease Modeling
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Ease is the difference between garment circumference and body girth (Garment Chest &minus; Body Chest).
              Our recommendation engine evaluates ease using Gaussian score curves tailored to the user&apos;s desired fit intent:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
              <div className="p-3 rounded-card bg-bg-elevated/50 text-center">
                <span className="text-xs font-semibold text-text-primary block">Slim Fit</span>
                <span className="text-[11px] text-text-secondary mt-0.5 block">+40mm to +80mm</span>
              </div>
              <div className="p-3 rounded-card bg-bg-elevated/50 text-center">
                <span className="text-xs font-semibold text-text-primary block">Regular Fit</span>
                <span className="text-[11px] text-text-secondary mt-0.5 block">+80mm to +140mm</span>
              </div>
              <div className="p-3 rounded-card bg-bg-elevated/50 text-center">
                <span className="text-xs font-semibold text-text-primary block">Relaxed Fit</span>
                <span className="text-[11px] text-text-secondary mt-0.5 block">+140mm to +200mm</span>
              </div>
              <div className="p-3 rounded-card bg-bg-elevated/50 text-center">
                <span className="text-xs font-semibold text-text-primary block">Oversized</span>
                <span className="text-[11px] text-text-secondary mt-0.5 block">+200mm to +300mm</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-card bg-bg-surface border border-border shadow-xs">
            <h2 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              3. Zero Hallucination Invariant
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              In accordance with <strong className="text-text-primary">AGENTS.md Invariant 1</strong>, WearID will never fabricate or synthesize missing size charts.
              If a brand does not provide shoulder measurements or flat specs, the system reports missing data honestly and reflects it in confidence scores.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
