import DemoPage from "@/components/DemoPage";
import { Repeat } from "lucide-react";

export default function TradeInPage() {
  return (
    <DemoPage
      title="Trade In Program"
      description="Trade in your old devices and get instant credit towards new purchases"
      icon={<Repeat className="w-10 h-10 text-white" />}
    />
  );
}
