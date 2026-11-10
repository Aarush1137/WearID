import { Metadata } from "next";
import { AppPageClient } from "./AppPageClient";

export const metadata: Metadata = {
  title: "Universal Clothing Size Passport & Fit Engine — WearID",
  description:
    "Your sovereign clothing identity passport. Millimeter-accurate body measurements, cross-brand clothing size comparisons, and instant fit check across 28+ verified brands.",
  keywords: [
    "clothing size passport",
    "clothing size comparison",
    "cloth size comparison",
    "fit check",
    "wearid passport",
    "my size across brands",
    "universal clothing size",
  ],
  alternates: {
    canonical: "https://wear-id.vercel.app/app",
  },
};

export default function AppPage() {
  return <AppPageClient />;
}
