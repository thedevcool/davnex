import DemoPage from "@/components/DemoPage";
import { PackageCheck } from "lucide-react";

export default function RefurbishedPage() {
  return (
    <DemoPage
      title="Certified Refurbished"
      description="Like new products at amazing prices, backed by our warranty"
      icon={<PackageCheck className="w-10 h-10 text-white" />}
    />
  );
}
