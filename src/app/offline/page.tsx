"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RotateCcw, ArrowRight } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col justify-between p-6">
      <header className="max-w-md mx-auto w-full pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-btn bg-accent text-white flex items-center justify-center font-display text-lg">
            W
          </span>
          <span className="font-semibold text-lg tracking-tight text-text-primary">
            Wear<span className="text-accent">ID</span>
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="rounded-card border border-border bg-bg-surface p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-[#FAF0E6] text-[#B5621A] flex items-center justify-center mx-auto mb-6">
            <WifiOff className="w-7 h-7" />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl text-text-primary mb-3">
            Offline Mode
          </h1>

          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            You are browsing without an active network connection. Your biometric profile and deterministic sizing calculations remain fully functional in your local sandbox.
          </p>

          <div className="rounded-btn bg-bg-elevated p-4 text-left text-xs text-text-secondary mb-6 border border-border">
            <span className="font-semibold text-text-primary block mb-1">
              Sovereign Local Sandbox
            </span>
            All stored dimensions are preserved in canonical millimeters on your device. Catalog updates will resume when reconnected.
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary w-full min-h-[44px] text-sm font-medium flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Reconnecting
            </button>

            <Link
              href="/app"
              className="btn-secondary w-full min-h-[44px] text-sm font-medium flex items-center justify-center gap-2"
            >
              Open Cached Passport
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="max-w-md mx-auto w-full text-center py-4 text-xs text-text-tertiary">
        WearID · Deterministic Apparel Sizing · India-First
      </footer>
    </div>
  );
}
