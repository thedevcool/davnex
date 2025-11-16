import { ArrowRight } from "lucide-react";
import Link from "next/link";

type QuickLink = {
  title: string;
  href: string;
};

const quickLinks: QuickLink[] = [
  { title: "Order Status", href: "/order-status" },
  { title: "Shopping Help", href: "/shopping-help" },
  { title: "Returns", href: "/returns" },
  { title: "Your Saves", href: "/saves" },
  { title: "Gift Cards", href: "/gift-cards" },
  { title: "Locate us", href: "/locate-us" },
  { title: "Support Center", href: "/support" },
  { title: "About Davnex", href: "/about" },
  { title: "Careers", href: "/careers" },
  { title: "Certified Refurbished", href: "/refurbished" },
  { title: "Trade In", href: "/trade-in" },
  { title: "Financing Options", href: "/financing" },
];

const QuickLinks = () => {
  return (
    <section className="bg-white py-8 border-t border-apple-gray-200">
      <div className="mx-auto max-w-wide container-padding">
        <h2 className="text-xs font-semibold text-apple-gray-500 uppercase mb-4 tracking-wide">
          Quick Links
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-3">
          {quickLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="text-xs text-apple-gray-600 hover:text-apple-blue hover:underline transition-colors"
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
