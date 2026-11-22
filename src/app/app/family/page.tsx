import { Metadata } from "next";
import { FamilySizeMatrixView } from "@/components/family/FamilySizeMatrixView";

export const metadata: Metadata = {
  title: "Family Multi-Profile Size Matrix | WearID",
  description: "Compare apparel and footwear sizes across yourself, your partner, and family members in a single dashboard.",
};

export default function FamilyMatrixPage() {
  return (
    <main className="min-h-screen bg-[#FBF9F5] dark:bg-[#121110] text-[#1C1917] dark:text-[#F5F5F4]">
      <FamilySizeMatrixView />
    </main>
  );
}
