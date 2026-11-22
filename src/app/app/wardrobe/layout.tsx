import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wardrobe Closet & Fit History — WearID",
  description:
    "Log garments you already own to calibrate WearID's deterministic sizing engine. Track fit ratings and anchor personal wearing ease across brands.",
  alternates: {
    canonical: "https://wear-id.vercel.app/app/wardrobe",
  },
};

export default function WardrobeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
