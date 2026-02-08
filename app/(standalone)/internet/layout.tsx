import type { Metadata } from "next";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Lodge Internet - Fast and Reliable Hostel Internet | Davnex",
  description:
    "Get instant access to high-speed internet for your hostel room. Purchase Lodge Internet data plans with secure payment.",
};

export default function InternetLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <main className="min-h-screen">{children}</main>
    </ToastProvider>
  );
}
