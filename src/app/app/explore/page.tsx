import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCatalogView } from "@/components/explore/ProductCatalogView";

export default function ExplorePage() {
  return (
    <AppShell>
      <ProductCatalogView />
    </AppShell>
  );
}
