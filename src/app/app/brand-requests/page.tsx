import { Metadata } from "next";
import { BrandVotingBoard } from "@/components/brands/BrandVotingBoard";

export const metadata: Metadata = {
  title: "Brand Request Voting Board | WearID",
  description: "Request and vote on apparel and footwear brands to be calibrated in WearID.",
};

export default function BrandRequestsPage() {
  return (
    <main className="min-h-screen bg-[#FBF9F5] dark:bg-[#121110] text-[#1C1917] dark:text-[#F5F5F4]">
      <BrandVotingBoard />
    </main>
  );
}
