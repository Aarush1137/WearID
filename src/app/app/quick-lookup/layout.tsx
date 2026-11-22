import { Metadata } from "next";

export const metadata: Metadata = {
  title: "What Size Am I? — Instant Clothing Size Calculator — WearID",
  description:
    "Pick any clothing brand and garment category to instantly see your recommended size. Millimeter-accurate fit check across Zara, Uniqlo, Levi's, H&M, Nike, and 28+ brands.",
  keywords: [
    "what size am I",
    "find my size",
    "clothing size calculator",
    "instant size lookup",
    "zara size finder",
    "uniqlo size calculator",
    "levis jeans size calculator",
    "fit check calculator",
  ],
  alternates: {
    canonical: "https://wear-id.vercel.app/app/quick-lookup",
  },
};

export default function QuickLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
