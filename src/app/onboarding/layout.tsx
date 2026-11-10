import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started — Build Your Universal Clothing Passport — WearID",
  description:
    "Set up your sovereign WearID clothing passport in 60 seconds. Calibrate your torso and footwear measurements for deterministic fit checks across 28+ brands.",
  alternates: {
    canonical: "https://wear-id.vercel.app/onboarding",
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
