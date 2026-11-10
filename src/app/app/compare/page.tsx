"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BrandComparisonView } from "@/components/compare/BrandComparisonView";

export default function ComparePage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-6 sm:py-10">
        <BrandComparisonView />
      </div>
    </AppShell>
  );
}
