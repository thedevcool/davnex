import DemoPage from "@/components/DemoPage";
import { RotateCcw, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function ReturnsPage() {
  return (
    <DemoPage
      title="Returns & Refunds"
      description="Easy returns within 14 days. Your satisfaction is our priority."
      icon={<RotateCcw className="w-10 h-10 text-white" />}
    >
      <div className="space-y-8">
        {/* Return Policy Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Our Return Policy
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  14-Day Return Window
                </h3>
                <p className="text-gray-600">
                  Return any product within 14 days of delivery for a full
                  refund or exchange.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Free Return Shipping
                </h3>
                <p className="text-gray-600">
                  We cover the cost of return shipping for defective or
                  incorrect items.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Quick Refunds
                </h3>
                <p className="text-gray-600">
                  Refunds are processed within 5-7 business days after we
                  receive your return.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Return Requirements */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Eligible for Return
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Unused items in original packaging</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>All accessories and manuals included</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Defective or damaged items</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Wrong item shipped</span>
              </li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Not Eligible
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">✗</span>
                <span>Used or damaged items</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">✗</span>
                <span>Items without original packaging</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">✗</span>
                <span>Personalized or custom items</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">✗</span>
                <span>Returns after 14 days</span>
              </li>
            </ul>
          </div>
        </div>

        {/* How to Return */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            How to Return an Item
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Contact Support
                </h3>
                <p className="text-gray-600">
                  Email us at{" "}
                  <a
                    href="mailto:returns@davnex.com"
                    className="text-blue-600 hover:underline"
                  >
                    returns@davnex.com
                  </a>{" "}
                  or call +234 801 234 5678 with your order number.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Receive Return Label
                </h3>
                <p className="text-gray-600">
                  We'll email you a prepaid return shipping label within 24
                  hours.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Pack & Ship
                </h3>
                <p className="text-gray-600">
                  Pack the item securely in its original packaging, attach the
                  label, and drop it off at any courier location.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Get Your Refund
                </h3>
                <p className="text-gray-600">
                  Once we receive and inspect your return, we'll process your
                  refund within 5-7 business days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-50 to-black-50 rounded-2xl p-8 border border-blue-100 text-center">
          <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Have Questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Our customer service team is here to help with your return.
          </p>
          <a
            href="/locate-us"
            className="inline-block bg-gradient-to-r from-blue-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-700 transition-all"
          >
            Contact Support
          </a>
        </div>
      </div>
    </DemoPage>
  );
}
