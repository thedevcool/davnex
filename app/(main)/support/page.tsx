import DemoPage from "@/components/DemoPage";
import { Headphones } from "lucide-react";

export default function SupportPage() {
  return (
    <DemoPage
      title="Support Center"
      description="Expert technical support for all your Davnex products"
      icon={<Headphones className="w-10 h-10 text-white" />}
    />
  );
}
