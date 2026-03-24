import type { Metadata } from "next";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Budget Lite",
  description: "A simple mobile-first personal budget app.",
  applicationName: "Budget Lite",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Budget Lite",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
