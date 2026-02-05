import DemoPage from "@/components/DemoPage";
import { Briefcase } from "lucide-react";

export default function CareersPage() {
  return (
    <DemoPage
      title="Careers at Davnex"
      description="Join our team and help shape the future of tech accessories"
      icon={<Briefcase className="w-10 h-10 text-white" />}
    />
  );
}
