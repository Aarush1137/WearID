import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Sign In — WearID Clothing Identity",
  description:
    "Sign in to your WearID Universal Clothing Size Passport. Access your verified anatomical measurements, cross-brand size recommendations, and portable sizing tokens.",
  alternates: {
    canonical: "https://wear-id.vercel.app/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
