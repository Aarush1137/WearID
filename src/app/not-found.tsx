"use client";

import React from "react";
import Link from "next/link";
import { Compass, ArrowRight, Home, Store } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-accent-subtle text-accent flex items-center justify-center mb-6">
        <Compass className="w-8 h-8 stroke-[1.5]" />
      </div>

      <span className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">
        Error 404 · Dimension Mismatch
      </span>

      <h1 className="font-display text-3xl sm:text-4xl text-text-primary font-bold mb-3 max-w-md">
        This garment or page could not be located.
      </h1>

      <p className="text-sm text-text-secondary max-w-md leading-relaxed mb-8">
        The link you followed may have expired, or the sizing record has been moved to another verified category.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/app"
          className="w-full sm:w-auto btn-primary min-h-[44px] px-6 text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs"
        >
          <Home className="w-4 h-4" />
          <span>My Size Passport</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          href="/app/explore"
          className="w-full sm:w-auto btn-secondary min-h-[44px] px-5 text-xs font-semibold inline-flex items-center justify-center gap-2"
        >
          <Store className="w-4 h-4" />
          <span>Browse 28 Verified Brands</span>
        </Link>
      </div>

      <footer className="mt-16 text-[11px] text-text-tertiary">
        WearID · Deterministic body-to-garment fitting
      </footer>
    </div>
  );
}
