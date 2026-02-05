import DemoPage from "@/components/DemoPage";
import { Gift } from "lucide-react";

export default function GiftCardsPage() {
  return (
    <DemoPage
      title="Gift Cards"
      description="Give the gift of choice with Davnex gift cards"
      icon={<Gift className="w-10 h-10 text-white" />}
    />
  );
}
