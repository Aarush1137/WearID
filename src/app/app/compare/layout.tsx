import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clothing Size Comparison Tool — Compare Sizes Across 28+ Brands",
  description:
    "Instant clothing size comparison and digital fit check across Zara, H&M, Uniqlo, Levi's, Snitch, Nike, and 28+ verified brands. Millimeter-accurate brand size converter.",
  keywords: [
    "clothing size comparison",
    "cloth size comparison",
    "fit check",
    "clothing size compare",
    "size comparison tool",
    "cross brand clothing size",
    "brand size converter",
    "zara to uniqlo size converter",
    "h&m to levis size converter",
    "shoe size comparison",
    "shoe size converter",
  ],
  alternates: {
    canonical: "https://wear-id.vercel.app/app/compare",
  },
  openGraph: {
    title: "Clothing Size Comparison Tool — WearID",
    description:
      "Instant clothing size comparison and digital fit check across 28+ verified brands.",
    url: "https://wear-id.vercel.app/app/compare",
    siteName: "WearID",
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
