import DemoPage from "@/components/DemoPage";
import { HelpCircle, MessageCircle, Book, Phone } from "lucide-react";
import Link from "next/link";

export default function ShoppingHelpPage() {
  return (
    <DemoPage
      title="Shopping Help"
      description="Get answers to your questions and make the most of your Davnex experience"
      icon={<HelpCircle className="w-10 h-10 text-white" />}
    >
      <div className="space-y-8">
        {/* Help Categories */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Live Chat
            </h3>
            <p className="text-gray-600 mb-4">
              Chat with our support team in real-time for instant assistance.
            </p>
            <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Start Chat →
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Help Center
            </h3>
            <p className="text-gray-600 mb-4">
              Browse our comprehensive knowledge base and tutorials.
            </p>
            <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              View Articles →
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-black-100 rounded-xl flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-black-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Call Us
            </h3>
            <p className="text-gray-600 mb-4">
              Speak directly with our customer service team.
            </p>
            <a
              href="tel:+2348012345678"
              className="text-black-600 font-semibold hover:text-black-700 transition-colors"
            >
              +234 801 234 5678 →
            </a>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Contact Form
            </h3>
            <p className="text-gray-600 mb-4">
              Send us a detailed message and we'll respond within 24 hours.
            </p>
            <Link
              href="/locate-us"
              className="text-green-600 font-semibold hover:text-green-700 transition-colors"
            >
              Contact Us →
            </Link>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-2xl p-8 border border-blue-100">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Popular Topics
          </h3>
          <div className="space-y-3">
            <a
              href="#"
              className="block p-4 bg-white rounded-xl hover:shadow-md transition-all"
            >
              <h4 className="font-semibold text-gray-900 mb-1">
                How do I place an order?
              </h4>
              <p className="text-sm text-gray-600">
                Learn the simple steps to complete your purchase
              </p>
            </a>
            <a
              href="#"
              className="block p-4 bg-white rounded-xl hover:shadow-md transition-all"
            >
              <h4 className="font-semibold text-gray-900 mb-1">
                What payment methods are accepted?
              </h4>
              <p className="text-sm text-gray-600">
                All accepted payment options and security details
              </p>
            </a>
            <a
              href="#"
              className="block p-4 bg-white rounded-xl hover:shadow-md transition-all"
            >
              <h4 className="font-semibold text-gray-900 mb-1">
                How long does delivery take?
              </h4>
              <p className="text-sm text-gray-600">
                Shipping times and delivery information
              </p>
            </a>
            <a
              href="#"
              className="block p-4 bg-white rounded-xl hover:shadow-md transition-all"
            >
              <h4 className="font-semibold text-gray-900 mb-1">
                Can I track my order?
              </h4>
              <p className="text-sm text-gray-600">
                Real-time tracking for all your shipments
              </p>
            </a>
          </div>
        </div>
      </div>
    </DemoPage>
  );
}
