import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title:
    "Davnex - Premium Tech Accessories for Your Lifestyle | Wireless Earbuds, Cases & More",
  description:
    "Shop premium tech accessories at Davnex. Discover wireless earbuds, headphones, phone cases, smartwatches, chargers, and more. Quality accessories for modern living.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
