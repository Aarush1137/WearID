import React, { Suspense } from "react";
import Link from "next/link";
import { OnboardingWizard } from "@/components/measure/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col">
      {/* Minimal Top Header */}
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
          className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors min-h-[44px] inline-flex items-center"
        >
          Skip to Passport →
        </Link>
      </header>

      {/* Main Wizard wrapped in Suspense */}
      <main className="flex-1 px-4 sm:px-6">
        <Suspense fallback={<div className="max-w-3xl mx-auto py-12 text-center text-xs text-text-secondary">Loading calibration wizard...</div>}>
          <OnboardingWizard />
        </Suspense>
      </main>
    </div>
  );
}
