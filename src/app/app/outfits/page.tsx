import { Metadata } from "next";
import { OutfitBuilderView } from "@/components/outfit/OutfitBuilderView";

export const metadata: Metadata = {
  title: "Outfit Builder & Multi-Piece Fit Scoring | WearID",
  description: "Combine tops, bottoms, and footwear into harmonious ensembles with composite sizing scores.",
};

export default function OutfitsPage() {
  return (
    <main className="min-h-screen bg-[#FBF9F5] dark:bg-[#121110] text-[#1C1917] dark:text-[#F5F5F4]">
      <OutfitBuilderView />
    </main>
  );
}
