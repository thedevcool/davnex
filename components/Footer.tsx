import Link from "next/link";

const Footer = () => {
  const shopLinks = [
    "Store",
    "Audio",
    "Cases",
    "Charging",
    "Wearables",
    "Tech Organizers",
    "Cables",
    "Protection",
    "Smart Home",
    "Gift Cards",
  ];

  const accountLinks = [
    "Manage Your Account",
    "Davnex Account",
    "Order Tracking",
  ];

  const forBusinessLinks = ["Davnex for Business", "Corporate Solutions"];

  const forEducationLinks = ["Student Discount", "Campus Store Program"];

  const customerServiceLinks = [
    "Shipping & Delivery",
    "Returns & Refunds",
    "Warranty Info",
  ];

  const davnexValuesLinks = [
    "About Us",
    "Sustainability",
    "Quality Promise",
    "Privacy Policy",
    "Community",
  ];

  const aboutDavnexLinks = [
    "News & Updates",
    "Leadership Team",
    "Careers",
    "Store Locations",
    "Contact Us",
  ];

  return (
    <footer className="bg-apple-gray-100 border-t border-apple-gray-300">
      <div className="mx-auto max-w-wide container-padding py-12">
        {/* Footnotes */}
        <div className="mb-8 text-xs text-apple-gray-500 space-y-2">
          <p>
            All prices are in Nigerian Naira (₦) and include applicable taxes.
          </p>
          <p>
            Financing available to qualified customers. Flexible payment plans
            available.
          </p>
          <p>
            Free delivery on orders over ₦50,000 within Lagos. Standard delivery
            ₦2,500.
          </p>
          <p>
            Student discount requires valid student ID. Cannot be combined with
            other offers.
          </p>
          <p>
            Trade-in values vary based on condition and model. Credit applied at
            checkout.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8 pb-8 border-b border-apple-gray-300">
          {/* Shop and Learn */}
          <div>
            <h3 className="text-xs font-semibold text-apple-gray-800 mb-3">
              Shop and Learn
            </h3>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link}>
                  <Link
                    href={`/${link
                      .toLowerCase()
                      .replace(" & ", "-")
                      .replace(" ", "-")}`}
                    className="text-xs text-apple-gray-600 hover:text-apple-gray-800"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-semibold text-apple-gray-800 mb-3">
              Account
            </h3>
            <ul className="space-y-2">
              {accountLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-xs text-apple-gray-600 hover:text-apple-gray-800"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Business/Education/Healthcare */}
          <div>
            <h3 className="text-xs font-semibold text-apple-gray-800 mb-3">
              For Business
            </h3>
            <ul className="space-y-2">
              {forBusinessLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-xs text-apple-gray-600 hover:text-apple-gray-800"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-xs font-semibold text-apple-gray-800 mb-3 mt-4">
              For Education
            </h3>
            <ul className="space-y-2">
              {forEducationLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-xs text-apple-gray-600 hover:text-apple-gray-800"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-xs font-semibold text-apple-gray-800 mb-3 mt-4">
              Customer Service
            </h3>
            <ul className="space-y-2">
              {customerServiceLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-xs text-apple-gray-600 hover:text-apple-gray-800"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Davnex Values */}
          <div>
            <h3 className="text-xs font-semibold text-apple-gray-800 mb-3">
              Davnex Values
            </h3>
            <ul className="space-y-2">
              {davnexValuesLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-xs text-apple-gray-600 hover:text-apple-gray-800"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Davnex */}
          <div>
            <h3 className="text-xs font-semibold text-apple-gray-800 mb-3">
              About Davnex
            </h3>
            <ul className="space-y-2">
              {aboutDavnexLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-xs text-apple-gray-600 hover:text-apple-gray-800"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-apple-gray-600">
            <p>
              More ways to shop:{" "}
              <Link href="/stores" className="text-apple-blue hover:underline">
                Find a Davnex Store
              </Link>{" "}
              or{" "}
              <Link
                href="/authorized-dealers"
                className="text-apple-blue hover:underline"
              >
                authorized dealers
              </Link>{" "}
              near you. Or call +234-801-DAVNEX.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 pt-4 border-t border-apple-gray-300">
          <p className="text-xs text-apple-gray-600">
            Copyright © 2025 Davnex. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-apple-gray-600">
            <Link href="/privacy" className="hover:text-apple-gray-800">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-apple-gray-800">
              Terms of Use
            </Link>
            <span>|</span>
            <Link href="/returns" className="hover:text-apple-gray-800">
              Returns & Refunds
            </Link>
            <span>|</span>
            <Link href="/shipping" className="hover:text-apple-gray-800">
              Shipping Info
            </Link>
            <span>|</span>
            <Link href="/sitemap" className="hover:text-apple-gray-800">
              Site Map
            </Link>
          </div>
          <div className="text-xs text-apple-gray-600">
            <Link href="/choose-country" className="hover:text-apple-gray-800">
              Nigeria
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
