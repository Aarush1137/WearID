"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error in development/telemetry without leaking biometric keys
    console.error("WearID Caught Route Error:", error?.message);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 stroke-[1.5]" />
      </div>

      <span className="text-xs uppercase tracking-widest text-rose-600 font-semibold mb-2">
        Execution Halt · Safe State Preserved
      </span>

      <h1 className="font-display text-3xl sm:text-4xl text-text-primary font-bold mb-3 max-w-md">
        An unexpected fitting error occurred.
      </h1>

      <p className="text-sm text-text-secondary max-w-md leading-relaxed mb-8">
        Your biometric measurements remain securely encrypted in local storage. You can retry the calculation or return to your passport.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="w-full sm:w-auto btn-primary min-h-[44px] px-6 text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Calculation</span>
        </button>

        <Link
          href="/app"
          className="w-full sm:w-auto btn-secondary min-h-[44px] px-5 text-xs font-semibold inline-flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Return to Passport</span>
        </Link>
      </div>

      {error?.digest && (
        <span className="mt-8 font-mono text-[10px] text-text-tertiary">
          Error Digest: {error.digest}
        </span>
      )}
    </div>
  );
}
