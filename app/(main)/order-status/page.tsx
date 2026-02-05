import DemoPage from "@/components/DemoPage";
import { Package, Search } from "lucide-react";

export default function OrderStatusPage() {
  return (
    <DemoPage
      title="Order Status"
      description="Track your Davnex orders and get real-time delivery updates"
      icon={<Package className="w-10 h-10 text-white" />}
    >
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Track Your Order
          </h2>
          <p className="text-gray-600 mb-6">
            Enter your order number and email address to track your shipment.
          </p>

          <form className="space-y-4">
            <div>
              <label
                htmlFor="orderNumber"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Order Number
              </label>
              <input
                type="text"
                id="orderNumber"
                placeholder="e.g., DVN-123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Track Order
            </button>
          </form>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-black-50 rounded-2xl p-8 border border-blue-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Need Help?
          </h3>
          <p className="text-gray-600 mb-4">
            Can't find your order? Our support team is here to help you track
            your shipment.
          </p>
          <a
            href="/locate-us"
            className="inline-block text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            Contact Support →
          </a>
        </div>
      </div>
    </DemoPage>
  );
}
