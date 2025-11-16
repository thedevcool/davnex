import DemoPage from "@/components/DemoPage";
import { CreditCard } from "lucide-react";

export default function FinancingPage() {
  return (
    <DemoPage
      title="Financing Options"
      description="Flexible payment plans to make your purchase easier"
      icon={<CreditCard className="w-10 h-10 text-white" />}
    />
  );
}
