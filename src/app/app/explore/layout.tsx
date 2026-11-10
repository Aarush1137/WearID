import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand Sizing Charts & Dimension Database — Uniqlo, Zara, H&M, Levi's",
  description:
    "Official verified size charts and flat millimeter garment dimensions for 28+ apparel and footwear brands. Accurate fit check for tops, denim, footwear, and intimates.",
  keywords: [
    "clothing size charts",
    "brand size charts",
    "uniqlo size chart",
    "zara size chart",
    "h&m size chart",
    "levis size chart",
    "snitch size chart",
    "garment dimensions",
    "pit to pit measurement",
    "clothing sizing guide",
  ],
  alternates: {
    canonical: "https://wear-id.vercel.app/app/explore",
  },
  openGraph: {
    title: "Brand Sizing Charts & Dimension Database — WearID",
    description:
      "Official verified size charts and flat millimeter garment dimensions across 28+ brands.",
    url: "https://wear-id.vercel.app/app/explore",
    siteName: "WearID",
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
