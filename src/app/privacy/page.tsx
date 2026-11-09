import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, EyeOff, KeyRound } from "lucide-react";

export default function PrivacyPage() {
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
          <ShieldCheck className="w-3.5 h-3.5" />
          Biometric Privacy & Sovereign Identity
        </div>

        <h1 className="font-display text-3xl sm:text-4xl text-text-primary mb-4">
          Privacy & Biometric Sovereignty
        </h1>
        <p className="text-base text-text-secondary leading-relaxed mb-8">
          Human body measurements are sensitive personal data. At WearID, privacy is not an afterthought — it is an immutable operational invariant.
        </p>

        <div className="space-y-6">
          <div className="p-6 rounded-card bg-bg-surface border border-border shadow-xs">
            <h2 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent" />
              1. Private by Default (AGENTS.md Invariant 7)
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Every WearID profile is private by default. Your biometric measurements are stored locally on your device or in cryptographically isolated database rows governed by strict server-side Row Level Security (RLS).
            </p>
          </div>

          <div className="p-6 rounded-card bg-bg-surface border border-border shadow-xs">
            <h2 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-accent" />
              2. Zero Biometric Leakage to Retailers
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              When using WearID Connect or portable size tokens with third-party retailers, only the deterministic size recommendation (e.g., &quot;Size L fits best (95% fit confidence)&quot;) is transferred. Retailers never receive your raw anatomical measurements or personal dimensions.
            </p>
          </div>

          <div className="p-6 rounded-card bg-bg-surface border border-border shadow-xs">
            <h2 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-accent" />
              3. Sovereign Portability & Full Erasure
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              You own your clothing profile unconditionally. You can export your complete biometric passport to print, share via WhatsApp with bespoke tailors, or delete your entire record with one click at any time.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
