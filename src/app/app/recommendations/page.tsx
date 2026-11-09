import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RecommendationView } from "@/components/recommend/RecommendationView";

export default function RecommendationsPage() {
  return (
    <AppShell>
      <RecommendationView />
    </AppShell>
  );
}
