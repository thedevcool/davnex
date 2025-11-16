import {
  Percent,
  GraduationCap,
  RefreshCw,
  Briefcase,
  Building,
  Shield,
  ChevronRight,
} from "lucide-react";

const savingsOptions = [
  {
    icon: Percent,
    title: "BUNDLE DEALS",
    description:
      "Save up to ₦50,000 when you buy 3 or more accessories together.",
    link: "#",
  },
  {
    icon: GraduationCap,
    title: "STUDENT DISCOUNT",
    description: "Get 15% off with valid student ID on all accessories.",
    link: "#",
  },
  {
    icon: RefreshCw,
    title: "CERTIFIED PRE-OWNED",
    description:
      "Shop certified pre-owned accessories with 6-month warranty and save up to 40%.",
    link: "#",
  },
  {
    icon: Briefcase,
    title: "BUSINESS SOLUTIONS",
    description: "Bulk pricing and corporate packages for businesses.",
    link: "#",
  },
  {
    icon: Building,
    title: "FIRST-TIME BUYER",
    description:
      "Get ₦5,000 off your first purchase when you sign up for our newsletter.",
    link: "#",
  },
  {
    icon: Shield,
    title: "LOYALTY REWARDS",
    description:
      "Earn points on every purchase and redeem for discounts on future orders.",
    link: "#",
  },
];

const Savings = () => {
  return (
    <section className="section-spacing bg-apple-gray-100">
      <div className="mx-auto max-w-wide container-padding">
        {/* Header with gradient title and subtitle beside */}
        <div className="flex items-baseline gap-3 mb-12 flex-wrap">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold gradient-text-shadow">
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 bg-clip-text text-transparent">
              Savings and offers.
            </span>
          </h2>
          <p className="text-xl sm:text-2xl lg:text-3xl text-apple-gray-600 opacity-70">
            Exclusive deals for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsOptions.map((option, idx) => (
            <a
              key={idx}
              href={option.link}
              className="group bg-white rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="mb-4">
                <option.icon className="h-8 w-8 text-apple-blue" />
              </div>
              <h3 className="text-xs font-semibold text-apple-gray-800 mb-2">
                {option.title}
              </h3>
              <p className="text-sm text-apple-gray-600 mb-4">
                {option.description}
              </p>
              <span className="text-apple-blue text-sm font-medium group-hover:underline">
                Learn more →
              </span>
            </a>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="text-xs text-apple-gray-600">
            Previous - Special Savings.
          </span>
          <button className="p-2 hover:bg-apple-gray-200 rounded-full transition-colors">
            <ChevronRight className="h-4 w-4 text-apple-gray-600 rotate-180" />
          </button>
          <button className="p-2 hover:bg-apple-gray-200 rounded-full transition-colors">
            <ChevronRight className="h-4 w-4 text-apple-gray-600" />
          </button>
          <span className="text-xs text-apple-gray-600">
            Next - Special Savings.
          </span>
        </div>
      </div>
    </section>
  );
};

export default Savings;
