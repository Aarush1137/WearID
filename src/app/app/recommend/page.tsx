import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RecommendationView } from "@/components/recommend/RecommendationView";

export default function RecommendPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-text-secondary">Loading fit passport...</div>}>
        <RecommendationView />
      </Suspense>
    </AppShell>
  );
}
