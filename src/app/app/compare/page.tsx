"use client";

import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BrandComparisonView } from "@/components/compare/BrandComparisonView";

export default function ComparePage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-6 sm:py-10">
        <Suspense
          fallback={
            <div className="p-8 text-center text-text-secondary text-sm">
              Loading brand comparison engine...
            </div>
          }
        >
          <BrandComparisonView />
        </Suspense>
      </div>
    </AppShell>
  );
}
