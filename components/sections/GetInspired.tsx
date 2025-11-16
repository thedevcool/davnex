import { ChevronRight } from "lucide-react";

const inspiredProducts = [
  {
    category: "MUSIC & AUDIO",
    title: "Elevate your listening experience.",
    subtitle: "Premium sound quality for music lovers.",
    products: [
      { name: "Smart Speaker - Midnight Black", price: "₦89,000" },
      { name: "Studio Headphones — Slate Blue", price: "₦179,000" },
    ],
  },
  {
    category: "SMART HOME",
    title: "Transform your space with smart accessories.",
    products: [{ name: "Smart LED Strip Lights with WiFi", price: "₦45,000" }],
  },
];

const GetInspired = () => {
  return (
    <section className="section-spacing bg-apple-gray-100">
      <div className="mx-auto max-w-wide container-padding">
        {/* Header with gradient title and subtitle beside */}
        <div className="flex items-baseline gap-3 mb-12 flex-wrap">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold gradient-text-shadow">
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 bg-clip-text text-transparent">
              Get inspired.
            </span>
          </h2>
          <p className="text-xl sm:text-2xl lg:text-3xl text-apple-gray-600 opacity-70">
            Tech that transforms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {inspiredProducts.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8">
              <div className="mb-4">
                <p className="text-xs font-semibold text-apple-gray-800 mb-2">
                  {section.category}
                </p>
                <h3 className="text-xl font-semibold text-apple-gray-800 mb-2">
                  {section.title}
                </h3>
                {section.subtitle && (
                  <p className="text-sm text-apple-gray-600">
                    {section.subtitle}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                {section.products.map((product, pidx) => (
                  <div
                    key={pidx}
                    className="border-t border-apple-gray-300 pt-4"
                  >
                    <h4 className="text-base font-semibold text-apple-gray-800 mb-1">
                      {product.name}
                    </h4>
                    <p className="text-sm text-apple-gray-600 mb-2">
                      {product.price}
                    </p>
                    <button className="text-apple-blue text-sm font-medium hover:underline">
                      Buy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "CRKD NEO S Widget Edition",
              badge: "Only at Apple",
              price: "$59.95",
            },
            { name: "Sony PlayStation® DualSense™", price: "$74.95" },
            {
              name: "Nanoleaf Essentials Matter A19",
              badge: "Smart Home",
              price: "$49.95",
            },
            { name: "Level Lock Pro with Matter", price: "$349.95" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-square bg-apple-gray-50 rounded-xl mb-4 flex items-center justify-center">
                <div className="w-32 h-32 bg-apple-gray-200 rounded-lg"></div>
              </div>
              {item.badge && (
                <span className="inline-block text-xs font-medium text-orange-600 mb-2">
                  {item.badge}
                </span>
              )}
              <h3 className="text-base font-semibold text-apple-gray-800 mb-2">
                {item.name}
              </h3>
              <p className="text-base text-apple-gray-800 font-medium mb-3">
                {item.price}
              </p>
              <button className="text-apple-blue text-sm font-medium hover:underline">
                Buy
              </button>
            </div>
          ))}
        </div>

        {/* Home CTA */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-center text-white">
          <p className="text-xs font-semibold mb-2">HOME</p>
          <h3 className="text-2xl sm:text-3xl font-semibold mb-3">
            See how one app can control your entire home.
          </h3>
          <button className="btn-primary bg-white text-indigo-600 hover:bg-apple-gray-100">
            Learn More
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="text-xs text-apple-gray-600">
            Previous - Get inspired.
          </span>
          <button className="p-2 hover:bg-apple-gray-200 rounded-full transition-colors">
            <ChevronRight className="h-4 w-4 text-apple-gray-600 rotate-180" />
          </button>
          <button className="p-2 hover:bg-apple-gray-200 rounded-full transition-colors">
            <ChevronRight className="h-4 w-4 text-apple-gray-600" />
          </button>
          <span className="text-xs text-apple-gray-600">
            Next - Get inspired.
          </span>
        </div>
      </div>
    </section>
  );
};

export default GetInspired;
