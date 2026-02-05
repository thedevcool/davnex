import DemoPage from "@/components/DemoPage";
import { Heart } from "lucide-react";

export default function SavesPage() {
  return (
    <DemoPage
      title="Your Saves"
      description="Keep track of your favorite Davnex products and never lose them"
      icon={<Heart className="w-10 h-10 text-white" />}
    />
  );
}
