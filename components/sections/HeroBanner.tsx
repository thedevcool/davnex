import Link from "next/link";

const HeroBanner = () => {
  return (
    <section className="relative bg-gradient-to-b from-apple-gray-100 to-white pt-32 pb-12 overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-gradient-radial from-blue-100 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-radial from-blue-100 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-wide container-padding">
        <div className="flex items-start justify-between">
          {/* Left side - Davnex text */}
          <div>
            <h1 className="text-7xl sm:text-8xl lg:text-9xl font-semibold">
              <span className="bg-gradient-to-r from-blue-500 via-blue-500 to-black-500 bg-clip-text text-transparent">
                Store
              </span>
            </h1>
          </div>

          {/* Right side - Tagline */}
          <div className="text-right">
            <p
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-apple-gray-900 mb-3"
              style={{ opacity: 0.7 }}
            >
              Premium accessories
              <br />
              for your lifestyle.
            </p>
            <Link
              href="/locate-us"
              className="text-base text-apple-blue hover:underline inline-block"
            >
              Locate us →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
