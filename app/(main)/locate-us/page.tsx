"use client";

import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Send,
  Clock,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function LocateUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Reset success message after 3 seconds
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-600 to-black-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 lg:px-6 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-6">
            Locate Us
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            We're here to help. Reach out through any of our channels and we'll
            respond promptly.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 -mt-10">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          {/* Contact Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Phone Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
                Call Us
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Speak directly with our support team
              </p>
              <a
                href="tel:+2348012345678"
                className="block text-center text-lg font-semibold text-blue-600 hover:text-blue-700 mb-2"
              >
                +234 801 234 5678
              </a>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Mon-Fri, 9am - 6pm WAT</span>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-black-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
                Email Us
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Send us a detailed message
              </p>
              <a
                href="mailto:support@davnex.com"
                className="block text-center text-lg font-semibold text-blue-600 hover:text-blue-700 mb-2"
              >
                support@davnex.com
              </a>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span>Response within 24 hours</span>
              </div>
            </div>

            {/* Visit Us Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-black-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
                Visit Us
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Come see us in person
              </p>
              <address className="not-italic text-center text-gray-700 leading-relaxed">
                123 Tech Plaza, Victoria Island
                <br />
                Lagos, Nigeria
              </address>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Additional Info & Social */}
            <div className="space-y-8">
              {/* Office Hours */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Office Hours
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">
                      Monday - Friday
                    </span>
                    <span className="text-gray-600">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Saturday</span>
                    <span className="text-gray-600">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="font-medium text-gray-700">Sunday</span>
                    <span className="text-red-600">Closed</span>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-2xl p-8 border border-blue-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Connect With Us
                </h3>
                <p className="text-gray-600 mb-6">
                  Follow us on social media for the latest updates, products,
                  and exclusive offers.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="https://facebook.com/davnex"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white hover:bg-blue-50 rounded-xl transition-all hover:scale-105 shadow-sm border border-gray-100"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Facebook className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">Facebook</span>
                  </a>

                  <a
                    href="https://instagram.com/davnex"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white hover:bg-black-50 rounded-xl transition-all hover:scale-105 shadow-sm border border-gray-100"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-black-600 rounded-lg flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">Instagram</span>
                  </a>

                  <a
                    href="https://twitter.com/davnex"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white hover:bg-blue-50 rounded-xl transition-all hover:scale-105 shadow-sm border border-gray-100"
                  >
                    <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
                      <Twitter className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">Twitter</span>
                  </a>

                  <a
                    href="https://linkedin.com/company/davnex"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white hover:bg-blue-50 rounded-xl transition-all hover:scale-105 shadow-sm border border-gray-100"
                  >
                    <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                      <Linkedin className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-200 rounded-2xl overflow-hidden h-64 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">
                      Map integration coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-gray-100 h-fit sticky top-24">
              <h3 className="text-3xl font-semibold text-gray-900 mb-3">
                Send us a Message
              </h3>
              <p className="text-gray-600 mb-8">
                Have a question or feedback? Fill out the form below and we'll
                get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="How can we help you?"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-black-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:via-blue-700 hover:to-black-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Success Message */}
                {submitStatus === "success" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-center animate-in fade-in slide-in-from-top-2">
                    ✓ Message sent successfully! We'll get back to you soon.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 lg:px-6">
          <h2 className="text-4xl font-semibold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                What are your shipping options?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-gray-600">
                We offer standard and express shipping across Nigeria. Standard
                delivery takes 3-5 business days, while express delivery takes
                1-2 business days. Free shipping is available for orders above
                ₦50,000.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                What is your return policy?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-gray-600">
                We accept returns within 14 days of delivery. Items must be
                unused and in original packaging. Please contact our support
                team to initiate a return.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                Do you offer warranty on products?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-gray-600">
                Yes! All our products come with a manufacturer's warranty.
                Warranty periods vary by product - typically 6-12 months.
                Extended warranty options are available at checkout.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                What payment methods do you accept?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-gray-600">
                We accept all major debit cards, credit cards, and bank
                transfers through our secure Paystack payment gateway. All
                transactions are encrypted and secure.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-600 text-white">
        <div className="mx-auto max-w-4xl px-4 lg:px-6 text-center">
          <h2 className="text-4xl font-semibold mb-4">Ready to Shop?</h2>
          <p className="text-xl text-white/90 mb-8">
            Explore our collection of premium tech accessories
          </p>
          <Link
            href="/"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:scale-105"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </main>
  );
}
