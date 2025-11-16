import {
  Gift,
  Truck,
  CreditCard,
  Package,
  Users,
  Wrench,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Gift,
    title: "DAVNEX REWARDS",
    description:
      "Earn points on every purchase and get exclusive access to special deals and early launches.",
  },
  {
    icon: Truck,
    title: "FAST DELIVERY",
    description:
      "Get your accessories delivered within 24-48 hours in Lagos. Same-day delivery available.",
  },
  {
    icon: CreditCard,
    title: "FLEXIBLE PAYMENT",
    description:
      "Pay in full or split payments. Multiple payment options available.",
  },
  {
    icon: Package,
    title: "TRADE-IN PROGRAM",
    description:
      "Trade in your old accessories. Get credit toward new purchases.",
  },
  {
    icon: Users,
    title: "EXPERT SUPPORT",
    description:
      "Get personalized recommendations from our tech specialists online or in-store.",
  },
  {
    icon: Wrench,
    title: "WARRANTY & PROTECTION",
    description:
      "Extended warranty and protection plans available for all premium accessories.",
  },
];

const OnlyAtDavnex = () => {
  return (
    <section className="section-spacing bg-white">
      <div className="mx-auto max-w-wide container-padding">
        {/* Header with gradient title and subtitle beside */}
        <div className="flex items-baseline gap-3 mb-12 flex-wrap">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold gradient-text-shadow">
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 bg-clip-text text-transparent">
              Only at Davnex.
            </span>
          </h2>
          <p className="text-xl sm:text-2xl lg:text-3xl text-apple-gray-600 opacity-70">
            Premium service, every time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-apple-gray-50 rounded-2xl p-6 hover:bg-apple-gray-100 transition-colors duration-300"
            >
              <div className="mb-4">
                <feature.icon className="h-8 w-8 text-apple-blue" />
              </div>
              <h3 className="text-xs font-semibold text-apple-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-apple-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 text-white">
            <h3 className="text-xs font-semibold mb-2">PERSONAL SETUP</h3>
            <p className="text-xl font-semibold mb-4">
              Set up your new device with help from a Specialist.
            </p>
            <p className="text-sm">
              Let us guide you through data transfer, the latest features, and
              more in an online, one-on-one session.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-black-600 rounded-3xl p-8 text-white">
            <h3 className="text-xs font-semibold mb-2">EXTENDED RETURNS</h3>
            <p className="text-xl font-semibold mb-4">
              Free extended returns now through 1/8/2026.
            </p>
            <p className="text-sm">
              Shop with confidence knowing you have extra time to return your
              purchases.
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="text-xs text-apple-gray-600">
            Previous - Only at Apple.
          </span>
          <button className="p-2 hover:bg-apple-gray-200 rounded-full transition-colors">
            <ChevronRight className="h-4 w-4 text-apple-gray-600 rotate-180" />
          </button>
          <button className="p-2 hover:bg-apple-gray-200 rounded-full transition-colors">
            <ChevronRight className="h-4 w-4 text-apple-gray-600" />
          </button>
          <span className="text-xs text-apple-gray-600">
            Next - Only at Apple.
          </span>
        </div>
      </div>
    </section>
  );
};

export default OnlyAtDavnex;
