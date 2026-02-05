import DemoPage from "@/components/DemoPage";
import { Building2 } from "lucide-react";

export default function AboutPage() {
  return (
    <DemoPage
      title="About Davnex"
      description="Premium tech accessories for the modern lifestyle"
      icon={<Building2 className="w-10 h-10 text-white" />}
    />
  );
}
